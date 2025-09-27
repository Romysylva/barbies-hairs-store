import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import EventEmitter from 'events';
EventEmitter.defaultMaxListeners = 30;

import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import AppError from './utils/appError.js';

import productRoute from './routes/productRoute.js';
import authRoutes from './routes/authRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import globalErrorHandler from './controllers/errorController.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import userProfileRoutes from './routes/userProfileRoutes.js';
import loyaltyRoutes from './routes/loyaltyRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import userSettingsRoutes from './routes/userSettingsRoutes.js';

const app = express();

app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173',
  'http://localhost:5175',
];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(
  '/uploads',
  express.static('uploads', {
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  }),
);

app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'client/build')));

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// }

try {
  app.use('/api/barbies/v1/products', productRoute);
  app.use('/api/barbies/v1/auths', authRoutes);
  app.use('/api/barbies/v1/reviews', reviewRoutes);
  app.use('/api/barbies/v1/orders', orderRoutes);
  app.use('/api/barbies/v1/bookings', bookingRoutes);
  app.use('/api/barbies/v1/users', userRoutes);
  app.use('/api/barbies/v1/categories', categoryRoutes);
  app.use('/api/barbies/v1/admin', adminRoutes);
  app.use('/api/barbies/v1/analytics', analyticsRoutes);
  app.use('/api/barbies/v1/wishlist', wishlistRoutes);
  app.use('/api/barbies/v1/cart', cartRoutes);
  app.use('/api/barbies/v1/user-profile', userProfileRoutes);
  app.use('/api/barbies/v1/loyalty', loyaltyRoutes);
  app.use('/api/barbies/v1/recommendations', recommendationRoutes);
  app.use('/api/barbies/v1/user-settings', userSettingsRoutes);
} catch (err) {
  console.log('route mounting failes', err);
}

app.get('/', (req, res) => {
  res.send('API is running...⭐✳✳✴❇🌟💫');
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;

  console.error('🔥 Error:', err.message || err);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// app.all('*', (req: Request, res: Response, next: NextFunction) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

app.use(globalErrorHandler);

export default app;
