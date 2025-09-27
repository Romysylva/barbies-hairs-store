import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import http from 'http';
import { User } from '../models/userModle.js';
import Order from '../models/orderModel.js';
import Booking from '../models/bookingModel.js';
import { AnalyticsEvent } from '../models/analyticsModel.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupRealTimeAnalytics = (io: SocketIOServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: any, next) => {
    try {
      const token = socket.auth?.token || socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Only allow admin users for analytics
      if (!user.roles.includes('admin')) {
        return next(new Error('Authorization error: Admin access required'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.roles.includes('admin') ? 'admin' : 'user';
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Admin user ${socket.userId} connected to real-time analytics`);

    // Join analytics room
    socket.join('analytics_admins');

    // Send initial real-time data
    sendInitialAnalyticsData(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(
        `Admin user ${socket.userId} disconnected from real-time analytics`,
      );
    });

    // Handle custom analytics event tracking
    socket.on('track_event', async (eventData) => {
      try {
        await trackAnalyticsEvent(eventData, socket.userId!);
      } catch (error) {
        console.error('Error tracking analytics event:', error);
      }
    });
  });

  // Set up periodic metric updates
  setupPeriodicUpdates(io);

  // Set up database change listeners
  setupDatabaseListeners(io);
};

// Send initial analytics data to connected admin
const sendInitialAnalyticsData = async (socket: AuthenticatedSocket) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const [recentOrders, recentBookings, activeUsers, hourlyRevenue] =
      await Promise.all([
        Order.find({ createdAt: { $gte: lastHour } })
          .populate('user', 'firstName lastName')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),

        Booking.find({ createdAt: { $gte: lastHour } })
          .populate('user', 'firstName lastName')
          .populate('product', 'name')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),

        User.countDocuments({
          lastActive: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
        }),

        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: last24Hours },
              status: { $in: ['completed', 'delivered'] },
            },
          },
          {
            $group: {
              _id: { hour: { $hour: '$createdAt' } },
              revenue: { $sum: '$totalAmount' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { '_id.hour': 1 } },
        ]),
      ]);

    const analyticsData = {
      activeUsers,
      ordersLastHour: recentOrders.length,
      bookingsLastHour: recentBookings.length,
      revenue24h: hourlyRevenue.reduce((sum, hour) => sum + hour.revenue, 0),
      recentActivity: {
        orders: recentOrders,
        bookings: recentBookings,
      },
      hourlyRevenue,
    };

    socket.emit('analytics_update', analyticsData);
  } catch (error) {
    console.error('Error sending initial analytics data:', error);
  }
};

// Set up periodic updates every 30 seconds
const setupPeriodicUpdates = (io: SocketIOServer) => {
  setInterval(async () => {
    try {
      const activeUsers = await User.countDocuments({
        lastActive: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
      });

      const ordersLastHour = await Order.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      });

      const bookingsLastHour = await Booking.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      });

      const revenue24h = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            status: { $in: ['completed', 'delivered'] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ]);

      const updateData = {
        activeUsers,
        ordersLastHour,
        bookingsLastHour,
        revenue24h: revenue24h[0]?.total || 0,
        timestamp: new Date(),
      };

      io.to('analytics_admins').emit('metrics_update', updateData);
    } catch (error) {
      console.error('Error in periodic analytics update:', error);
    }
  }, 30000); // Every 30 seconds
};

// Set up database change listeners for real-time events
const setupDatabaseListeners = (io: SocketIOServer) => {
  // Listen for new orders
  const orderChangeStream = Order.watch([
    { $match: { operationType: 'insert' } },
  ]);

  orderChangeStream.on('change', async (change) => {
    try {
      if (change.operationType === 'insert') {
        const newOrder = await Order.findById(change.fullDocument._id)
          .populate('user', 'firstName lastName')
          .lean();

        if (newOrder) {
          // Track analytics event
          await trackAnalyticsEvent({
            eventType: 'order_placed',
            eventName: 'New Order Created',
            data: {
              orderId: newOrder._id,
              amount: newOrder.totalAmount,
              userId: newOrder.user._id,
            },
          });
        }

        // Emit to analytics admins
        io.to('analytics_admins').emit('new_order', newOrder);
      }
    } catch (error) {
      console.error('Error processing order change:', error);
    }
  });

  // Listen for new bookings
  const bookingChangeStream = Booking.watch([
    { $match: { operationType: 'insert' } },
  ]);

  bookingChangeStream.on('change', async (change) => {
    try {
      if (change.operationType === 'insert') {
        const newBooking = await Booking.findById(change.fullDocument._id)
          .populate('user', 'firstName lastName')
          .populate('product', 'name')
          .lean();

        if (newBooking) {
          // Track analytics event
          await trackAnalyticsEvent({
            eventType: 'booking_created',
            eventName: 'New Booking Created',
            data: {
              bookingId: newBooking._id,
              amount: newBooking.totalPrice || 0,
              userId: newBooking.user._id,
              productId: newBooking.product?._id,
            },
          });
        }

        // Emit to analytics admins
        io.to('analytics_admins').emit('new_booking', newBooking);
      }
    } catch (error) {
      console.error('Error processing booking change:', error);
    }
  });

  // Listen for new user registrations
  const userChangeStream = User.watch([
    { $match: { operationType: 'insert' } },
  ]);

  userChangeStream.on('change', async (change) => {
    try {
      if (change.operationType === 'insert') {
        const newUser = change.fullDocument;

        // Track analytics event
        await trackAnalyticsEvent({
          eventType: 'user_registered',
          eventName: 'New User Registration',
          data: {
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role,
          },
        });

        // Emit to analytics admins
        io.to('analytics_admins').emit('new_user', {
          userId: newUser._id,
          name: `${newUser.firstName} ${newUser.lastName}`,
          email: newUser.email,
          createdAt: newUser.createdAt,
        });
      }
    } catch (error) {
      console.error('Error processing user change:', error);
    }
  });
};

// Track analytics events
const trackAnalyticsEvent = async (eventData: any, userId?: string) => {
  try {
    const event = new AnalyticsEvent({
      eventType: eventData.eventType,
      eventName: eventData.eventName,
      userId: userId || eventData.data?.userId,
      data: eventData.data || {},
      metadata: {
        source: 'backend',
        version: '1.0',
        timestamp: new Date(),
      },
    });

    await event.save();
  } catch (error) {
    console.error('Error tracking analytics event:', error);
  }
};

// Real-time KPI calculation service
export class RealTimeKPIService {
  private static io: SocketIOServer;

  static initialize(ioServer: SocketIOServer) {
    this.io = ioServer;
    this.startKPIMonitoring();
  }

  private static startKPIMonitoring() {
    // Monitor KPIs every minute
    setInterval(async () => {
      try {
        const kpis = await this.calculateRealTimeKPIs();
        this.io.to('analytics_admins').emit('kpi_update', kpis);
      } catch (error) {
        console.error('Error calculating real-time KPIs:', error);
      }
    }, 60000); // Every minute
  }

  private static async calculateRealTimeKPIs() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [dailyRevenue, dailyOrders, weeklyCustomers, conversionRate] =
      await Promise.all([
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: last24Hours },
              status: { $in: ['completed', 'delivered'] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' },
            },
          },
        ]),

        Order.countDocuments({
          createdAt: { $gte: last24Hours },
        }),

        User.countDocuments({
          createdAt: { $gte: lastWeek },
        }),

        this.calculateLiveConversionRate(),
      ]);

    return {
      dailyRevenue: dailyRevenue[0]?.total || 0,
      dailyOrders,
      weeklyNewCustomers: weeklyCustomers,
      liveConversionRate: conversionRate,
      timestamp: now,
    };
  }

  private static async calculateLiveConversionRate() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [visitors, orders] = await Promise.all([
      User.countDocuments({
        lastActive: { $gte: last24Hours },
      }),
      Order.countDocuments({
        createdAt: { $gte: last24Hours },
      }),
    ]);

    return visitors > 0 ? (orders / visitors) * 100 : 0;
  }
}

// Export the io instance for use in other parts of the app
export let analyticsIO: SocketIOServer;

export const initializeRealTimeAnalytics = (server: http.Server) => {
  analyticsIO = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3002',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  setupRealTimeAnalytics(analyticsIO);
  RealTimeKPIService.initialize(analyticsIO);

  return analyticsIO;
};
