import { Worker, Job } from 'bullmq';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AudioJobData } from '../queues/audioQueue';
import { processAudioFile } from '../services/audioProcessor';
import { db, meetings, transcripts } from '../db';
import { eq } from 'drizzle-orm';

const connection = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
});

export function initWorker(io: Server) {
  const audioWorker = new Worker<AudioJobData>(
    'audio-processing',
    async (job: Job<AudioJobData>) => {
      const { meetingId, userId, audioUrl, fileName } = job.data;
      logger.info(`Processing audio for meeting ${meetingId}`);

      const emitProgress = (status: string, progress: number, data?: any) => {
        io.to(userId).emit('job-update', {
          jobId: job.id,
          meetingId,
          status,
          progress,
          data,
        });
        job.updateProgress(progress);
      };

      try {
        // Update meeting status
        await db
          .update(meetings)
          .set({ status: 'processing' })
          .where(eq(meetings.id, meetingId));

        emitProgress('processing', 10);

        // Process the audio file
        const result = await processAudioFile(
          audioUrl,
          fileName,
          (status: string, progress: number) => emitProgress(status, progress)
        );

        // Save transcript to database
        await db.insert(transcripts).values({
          meetingId,
          content: result.transcript,
          summary: result.summary,
          actionItems: result.actionItems,
          metadata: {
            processingTime: result.processingTime,
            audioLength: result.audioLength,
          },
        });

        // Update meeting status
        await db
          .update(meetings)
          .set({
            status: 'completed',
            duration: result.audioLength,
          })
          .where(eq(meetings.id, meetingId));

        emitProgress('completed', 100, result);

        logger.info(`Successfully processed audio for meeting ${meetingId}`);
        return result;
      } catch (error) {
        logger.error(`Failed to process audio for meeting ${meetingId}:`, error);

        // Update meeting status to failed
        await db
          .update(meetings)
          .set({ status: 'failed' })
          .where(eq(meetings.id, meetingId));

        emitProgress('failed', 0, { error: (error as Error).message });
        throw error;
      }
    },
    {
      connection,
      concurrency: 2,
    }
  );

  audioWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

  audioWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
  });

  logger.info('Audio processing worker initialized');
  return audioWorker;
}
