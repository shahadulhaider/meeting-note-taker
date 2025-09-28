import { supabase } from '@/lib/supabase';
import { Meeting, Transcript, CreateMeetingInput } from '@meeting-note-taker/shared';

// Raw base URL from build-time environment
const rawBase = import.meta.env.VITE_API_URL;

if (!rawBase) {
  throw new Error(
    '[ApiService] VITE_API_URL is not defined. Set it in your environment (e.g. Vercel project settings).'
  );
}

// Normalize: remove trailing slashes
const API_BASE = rawBase.replace(/\/+$/, '');

// Expose for debugging in dev
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('[ApiService] Using API_BASE =', API_BASE);
  (window as any).__API_BASE__ = API_BASE;
}

class ApiService {
  private async getAuthToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    return session.access_token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();

    // Ensure exactly one leading slash
    const normalizedEndpoint = '/' + endpoint.replace(/^\/+/, '');
    const url = `${API_BASE}${normalizedEndpoint}`;

    const isFormData = options.body instanceof FormData;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const errorBody = await response.json();
        if (errorBody?.error) message = errorBody.error;
      } catch {
        // ignore parse error
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as unknown as T;
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

    const url = `${API_BASE}/api/meetings/${meetingId}/upload`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let message = `Upload failed (${response.status})`;
      try {
        const errorBody = await response.json();
        if (errorBody?.error) message = errorBody.error;
      } catch {
        // ignore parse error
      }
      throw new Error(message);
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
