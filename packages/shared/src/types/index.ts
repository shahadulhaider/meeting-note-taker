export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  userId: string;
  title: string;
  description?: string;
  audioUrl?: string;
  status: MeetingStatus;
  jobId?: string;
  duration?: number; // duration in seconds (optional; may be undefined if not processed)
  createdAt: Date;
  updatedAt: Date;
}

export interface Transcript {
  id: string;
  meetingId: string;
  content: string;
  summary?: string;
  actionItems?: ActionItem[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ActionItem {
  id: string;
  text: string;
  assignee?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}

export type MeetingStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'transcribing'
  | 'summarizing'
  | 'completed'
  | 'failed';

export interface JobProgress {
  jobId: string;
  meetingId: string;
  status: MeetingStatus;
  progress: number;
  message?: string;
  data?: {
    transcript?: string;
    summary?: string;
    actionItems?: ActionItem[];
  };
  error?: string;
}
