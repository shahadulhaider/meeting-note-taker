import { Router } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { AppError } from '../middleware/error';
import { db, meetings, transcripts } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { supabaseAdmin } from '../utils/supabase';
import { audioQueue } from '../queues/audioQueue';
import { config } from '../config';
import { logger } from '../utils/logger';
import { createMeetingSchema } from '@meeting-note-taker/shared';

const router = Router();

// Get all meetings for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userMeetings = await db
      .select()
      .from(meetings)
      .where(eq(meetings.userId, req.user!.id))
      .orderBy(desc(meetings.createdAt));

    res.json(userMeetings);
  } catch (error) {
    next(error);
  }
});

// Get single meeting with transcript
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const meetingId = req.params.id;

    const [meeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, meetingId), eq(meetings.userId, req.user!.id)));

    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    const [transcript] = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.meetingId, meetingId));

    res.json({ meeting, transcript });
  } catch (error) {
    next(error);
  }
});

// Create new meeting
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = createMeetingSchema.parse(req.body);

    const [meeting] = await db
      .insert(meetings)
      .values({
        userId: req.user!.id,
        title: body.title,
        description: body.description,
        status: 'pending',
      })
      .returning();

    res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
});

// Upload audio file for meeting
router.post(
  '/:id/upload',
  authenticate,
  upload.single('audio'),
  async (req: AuthRequest, res, next) => {
    try {
      const meetingId = req.params.id;
      const file = req.file;

      if (!file) {
        throw new AppError('No audio file provided', 400);
      }

      // Verify meeting ownership
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, meetingId), eq(meetings.userId, req.user!.id)));

      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      if (meeting.status !== 'pending') {
        throw new AppError('Audio has already been uploaded for this meeting', 400);
      }

      // Upload to Supabase Storage
      const fileName = `${meetingId}/${Date.now()}-${file.originalname}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(config.storage.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        logger.error('Storage upload error:', uploadError);
        throw new AppError('Failed to upload audio file', 500);
      }

      // Create signed URL for downloading (valid for 1 hour)
      const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
        .from(config.storage.bucketName)
        .createSignedUrl(fileName, 3600);

      if (signedUrlError || !signedUrlData) {
        logger.error('Failed to create signed URL:', signedUrlError);
        throw new AppError('Failed to create download URL', 500);
      }

      // Get public URL for storage (to save in DB)
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from(config.storage.bucketName).getPublicUrl(fileName);

      // Update meeting with audio URL
      await db
        .update(meetings)
        .set({
          audioUrl: publicUrl,
          status: 'uploading',
          updatedAt: new Date(),
        })
        .where(eq(meetings.id, meetingId));

      // Add job to queue with signed URL for processing
      const job = await audioQueue.add('process-audio', {
        meetingId,
        userId: req.user!.id,
        audioUrl: signedUrlData.signedUrl,
        fileName: file.originalname,
      });

      // Update meeting with job ID
      await db
        .update(meetings)
        .set({
          jobId: job.id,
          status: 'processing',
        })
        .where(eq(meetings.id, meetingId));

      res.json({
        message: 'Audio uploaded successfully',
        jobId: job.id,
        meetingId,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete meeting
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const meetingId = req.params.id;

    const [meeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, meetingId), eq(meetings.userId, req.user!.id)));

    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    // Delete from storage if exists
    if (meeting.audioUrl) {
      const fileName = meeting.audioUrl.split('/').slice(-2).join('/');
      await supabaseAdmin.storage.from(config.storage.bucketName).remove([fileName]);
    }

    // Delete from database (cascade will handle transcript)
    await db.delete(meetings).where(eq(meetings.id, meetingId));

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
