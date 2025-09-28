import { z } from 'zod';

export const createMeetingSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const uploadAudioSchema = z.object({
  meetingId: z.string().uuid(),
  fileName: z.string(),
  fileSize: z.number().max(100 * 1024 * 1024), // 100MB limit
  mimeType: z.enum(['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp3']),
});

export const actionItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  assignee: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const jobProgressSchema = z.object({
  jobId: z.string(),
  meetingId: z.string().uuid(),
  status: z.enum([
    'pending',
    'uploading',
    'processing',
    'transcribing',
    'summarizing',
    'completed',
    'failed',
  ]),
  progress: z.number().min(0).max(100),
  message: z.string().optional(),
  data: z
    .object({
      transcript: z.string().optional(),
      summary: z.string().optional(),
      actionItems: z.array(actionItemSchema).optional(),
    })
    .optional(),
  error: z.string().optional(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UploadAudioInput = z.infer<typeof uploadAudioSchema>;
