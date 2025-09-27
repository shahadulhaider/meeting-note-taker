import { Queue } from 'bullmq';
import { config } from '../config';
import Redis from 'ioredis';

const connection = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
});

export const audioQueue = new Queue('audio-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

export interface AudioJobData {
  meetingId: string;
  userId: string;
  audioUrl: string;
  fileName: string;
}
