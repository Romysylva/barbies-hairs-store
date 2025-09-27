import http from 'http';
import dotenv from 'dotenv';
import process from 'node:process';
import { Server as SocketIOServer } from 'socket.io';

import connectDB from './config/db.js';
import { setupRealTimeAnalytics } from './services/realTimeAnalyticsService.js';

process.on('unhandledRejection', (err: unknown) => {
  // console.error('UNHANDLED REJECTION! 💥 Shutting down...');

  if (err instanceof Error) {
    console.log(err.name, err.message);
  } else {
    console.log('Non-Error thrown:', String(err));
  }

  server.close(() => {
    process.exit(1);
  });
});

dotenv.config({ path: './config.env' });
import app from './app.js';

const server = http.createServer(app);

// Initialize Socket.IO for real-time analytics
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3002',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup real-time analytics
setupRealTimeAnalytics(io);

connectDB();
const PORT = process.env.PORT || 8080;
server.listen(PORT, () =>
  console.log(
    `🚀 Barbies Hair Backend Server is running on port ${PORT} 💥💥✳❇🚦`,
    `📊 Real-time Analytics WebSocket enabled`,
  ),
);

process.on('unhandledRejection', (err: unknown) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');

  if (err instanceof Error) {
    console.log(err.name, err.message);
  } else {
    console.log('Non-Error thrown:', String(err));
  }

  server.close(() => {
    process.exit(1);
  });
});
