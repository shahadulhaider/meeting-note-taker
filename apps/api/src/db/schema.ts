import { pgTable, uuid, varchar, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const meetings = pgTable('meetings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  audioUrl: text('audio_url'),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  jobId: varchar('job_id', { length: 255 }),
  duration: integer('duration'), // in seconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transcripts = pgTable('transcripts', {
  id: uuid('id').defaultRandom().primaryKey(),
  meetingId: uuid('meeting_id')
    .notNull()
    .references(() => meetings.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  summary: text('summary'),
  actionItems: jsonb('action_items'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type Transcript = typeof transcripts.$inferSelect;
export type NewTranscript = typeof transcripts.$inferInsert;
