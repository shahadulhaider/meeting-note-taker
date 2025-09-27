import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error';
import { initWebSocket } from './websocket';
import { initWorker } from './workers';
import meetingRoutes from './routes/meetings';
import authRoutes from './routes/auth';

const app = express();
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

// Error handling
app.use(errorHandler);

// Initialize WebSocket
initWebSocket(io);

// Initialize BullMQ worker
initWorker(io);

// Start server
server.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`);
  logger.info(`📡 WebSocket server ready`);
  logger.info(`🔧 Environment: ${config.env}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export { app, io };
