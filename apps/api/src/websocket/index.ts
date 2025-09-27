import { Server, Socket } from 'socket.io';
import { supabaseAdmin } from '../utils/supabase';
import { logger } from '../utils/logger';

interface SocketData {
  userId: string;
  email: string;
}

export function initWebSocket(io: Server) {
  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify token with Supabase
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return next(new Error('Invalid authentication token'));
      }

      // Store user data in socket
      (socket.data as SocketData) = {
        userId: user.id,
        email: user.email!,
      };

      // Join user-specific room
      socket.join(user.id);

      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userData = socket.data as SocketData;
    logger.info(`User connected: ${userData.email} (${userData.userId})`);

    // Subscribe to specific meeting updates
    socket.on('subscribe-meeting', (meetingId: string) => {
      socket.join(`meeting-${meetingId}`);
      logger.debug(`User ${userData.userId} subscribed to meeting ${meetingId}`);
    });

    // Unsubscribe from meeting updates
    socket.on('unsubscribe-meeting', (meetingId: string) => {
      socket.leave(`meeting-${meetingId}`);
      logger.debug(`User ${userData.userId} unsubscribed from meeting ${meetingId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userData.email} (${userData.userId})`);
    });
  });

  logger.info('WebSocket server initialized');
}
