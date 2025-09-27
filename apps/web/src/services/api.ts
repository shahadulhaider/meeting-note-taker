import { supabase } from '@/lib/supabase';
import { Meeting, Transcript, CreateMeetingInput } from '@meeting-note-taker/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    return session.access_token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async getMeetings(): Promise<Meeting[]> {
    return this.request<Meeting[]>('/api/meetings');
  }

  async getMeeting(id: string): Promise<{ meeting: Meeting; transcript?: Transcript }> {
    return this.request(`/api/meetings/${id}`);
  }

  async createMeeting(data: CreateMeetingInput): Promise<Meeting> {
    return this.request('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadAudio(meetingId: string, file: File): Promise<{ jobId: string }> {
    const token = await this.getAuthToken();

    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch(`${API_URL}/api/meetings/${meetingId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async deleteMeeting(id: string): Promise<void> {
    await this.request(`/api/meetings/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
