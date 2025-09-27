import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { JobProgress } from '@meeting-note-taker/shared';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export const useWebSocket = (onJobUpdate?: (update: JobProgress) => void) => {
  const { session } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;

    // Initialize socket connection
    socketRef.current = io(WS_URL, {
      auth: {
        token: session.access_token,
      },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    if (onJobUpdate) {
      socket.on('job-update', onJobUpdate);
    }

    return () => {
      socket.disconnect();
    };
  }, [session, onJobUpdate]);

  const subscribeMeeting = useCallback((meetingId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe-meeting', meetingId);
    }
  }, []);

  const unsubscribeMeeting = useCallback((meetingId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe-meeting', meetingId);
    }
  }, []);

  return {
    socket: socketRef.current,
    subscribeMeeting,
    unsubscribeMeeting,
  };
};
