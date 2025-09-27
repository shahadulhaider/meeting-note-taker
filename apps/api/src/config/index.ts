import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),

  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  },

  database: {
    url: process.env.DATABASE_URL!,
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  ai: {
    openaiKey: process.env.OPENAI_API_KEY,
    googleAiKey: process.env.GOOGLE_AI_API_KEY,
  },

  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'development-secret-change-in-production',
  },

  storage: {
    bucketName: 'meeting-records',
    maxFileSize: 100 * 1024 * 1024, // 100MB
  },
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'DATABASE_URL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
