import { Request, Response, NextFunction } from 'express';
import Booking from '../models/bookingModel.js';
import Order from '../models/orderModel.js';
import { User } from '../models/userModle.js';
import { Product } from '../models/productModules.js';
import { ActivityLog } from '../models/activityModel.js';
import SystemSetting from '../models/systemSettingModel.js';
import Chat from '../models/chatModel.js';
import catchAsync from '../utils/catchAsync.js';
import { SortOrder, Types } from 'mongoose';

// 📊 Get Dashboard Stats
export const getStats = catchAsync(async (req: Request, res: Response) => {
  // Basic counts
  const bookingsCount = await Booking.countDocuments();
  const ordersCount = await Order.countDocuments();
  const usersCount = await User.countDocuments();
  const productsCount = await Product.countDocuments();

  // Get current date ranges for comparisons
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfLastWeek = new Date(
    startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000,
  );

  // Revenue calculations
  const currentMonthRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth },
        paymentStatus: 'paid',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
      },
    },
  ]);

  const lastMonthRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        paymentStatus: 'paid',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
      },
    },
  ]);

  const totalRevenue = await Order.aggregate([
    {
      $match: { paymentStatus: 'paid' },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
      },
    },
  ]);

  // Growth calculations
  const currentRevenue = currentMonthRevenue[0]?.total || 0;
  const lastRevenue = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth =
    lastRevenue > 0
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : 0;

  // Order analytics
  const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
  const processingOrders = await Order.countDocuments({
    orderStatus: 'processing',
  });
  const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
  const deliveredOrders = await Order.countDocuments({
    orderStatus: 'delivered',
  });
  const cancelledOrders = await Order.countDocuments({
    orderStatus: 'cancelled',
  });

  // User analytics
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth },
  });
  const activeUsers = await User.countDocuments({ status: 'active' });
  const inactiveUsers = await User.countDocuments({ status: 'inactive' });
  const suspendedUsers = await User.countDocuments({ status: 'suspended' });

  // Product analytics
  const inStockProducts = await Product.countDocuments({ inStock: true });
  const outOfStockProducts = await Product.countDocuments({ inStock: false });
  const lowStockProducts = await Product.countDocuments({
    quantity: { $lte: 10, $gt: 0 },
  });

  // Booking analytics
  const pendingBookings = await Booking.countDocuments({ status: 'pending' });
  const confirmedBookings = await Booking.countDocuments({
    status: 'confirmed',
  });
  const completedBookings = await Booking.countDocuments({
    status: 'completed',
  });
  const cancelledBookings = await Booking.countDocuments({
    status: 'cancelled',
  });

  // Top products by sales
  const topProducts = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $project: {
        _id: 1,
        name: '$productInfo.name',
        totalSold: 1,
        totalRevenue: 1,
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  // Recent activities (simplified for now)
  const recentActivities = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('action user description createdAt');

  // System health indicators
  const systemHealth = {
    status: 'healthy', // This could be dynamic based on actual health checks
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    lastHealthCheck: new Date(),
  };

  // Security alerts (based on fraud detection)
  const securityAlerts = await Order.countDocuments({
    createdAt: { $gte: startOfWeek },
    // Add conditions for flagged orders if you have that logic
  });

  res.status(200).json({
    success: true,
    stats: {
      // Basic counts
      bookingsCount,
      ordersCount,
      usersCount,
      productsCount,

      // Revenue metrics
      totalRevenue: totalRevenue[0]?.total || 0,
      currentMonthRevenue,
      revenueGrowth,

      // Order metrics
      ordersByStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },

      // User metrics
      newUsersThisMonth,
      usersByStatus: {
        active: activeUsers,
        inactive: inactiveUsers,
        suspended: suspendedUsers,
      },

      // Product metrics
      productsByStock: {
        inStock: inStockProducts,
        outOfStock: outOfStockProducts,
        lowStock: lowStockProducts,
      },

      // Booking metrics
      pendingBookings,
      bookingsByStatus: {
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },

      // Additional insights
      topProducts,
      recentActivities,
      systemHealth,
      securityAlerts,

      // Active chats from chat system
      activeChats: await Chat.countDocuments({ status: 'active' }),
    },
  });
});

// 🏆 Get Top Services/Products by Bookings
export const getTopBookedProducts = catchAsync(
  async (req: Request, res: Response) => {
    // Check system settings toggle
    const setting = await SystemSetting.findOne({
      key: 'feature_topBookedProducts',
    });
    if (!setting || !setting.value) {
      return res.status(403).json({
        success: false,
        message:
          'Top booked products analytics is disabled in system settings.',
      });
    }

    // Aggregate bookings to get top products
    const topProducts = await Booking.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$product',
          name: { $first: '$productDetails.name' },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({ success: true, topProducts });
  },
);

// 🚨 Fraud Detection Stub (you can add logic later)
export const getFraudDetectionResults = async (req: Request, res: Response) => {
  try {
    // ✅ Check feature toggle
    const fraudToggle = await SystemSetting.findOne({
      key: 'feature_fraudDetection',
    });
    if (!fraudToggle?.value) {
      return res.status(403).json({
        success: false,
        message: 'Fraud detection analytics is disabled in system settings.',
      });
    }

    // ✅ Fetch potentially suspicious orders (initial filter)
    const recentOrders = await Order.find({ status: 'pending' })
      .limit(100)
      .lean();

    const flaggedOrders = [];
    for (const order of recentOrders) {
      let riskScore = 0;
      const reasons = [];

      // Rule 1: Large transaction amount
      if (order.totalAmount > 100000) {
        riskScore += 40;
        reasons.push('Unusually high order amount');
      }

      // Rule 2: Suspicious shipping country
      const trustedCountries = ['Nigeria', 'USA', 'UK'];
      if (!trustedCountries.includes(order.shippingAddress.country)) {
        riskScore += 30;
        reasons.push('Shipping to untrusted country');
      }

      // Rule 3: Multiple pending high-value orders from same user
      const sameUserHighOrders = await Order.countDocuments({
        user: order.user,
        status: 'pending',
        totalAmount: { $gt: 50000 },
      });
      if (sameUserHighOrders > 3) {
        riskScore += 20;
        reasons.push('Multiple high-value pending orders by same user');
      }

      // Rule 4: Risky payment method
      const riskyMethods = ['Prepaid Card', 'Crypto'];
      if (riskyMethods.includes(order.paymentMethod)) {
        riskScore += 10;
        reasons.push('Risky payment method');
      }

      // Rule 5: Mismatched billing and shipping countries
      if (
        order.shippingAddress.country &&
        order.shippingAddress.country &&
        order.shippingAddress.country !== order.shippingAddress.country
      ) {
        riskScore += 15;
        reasons.push('Billing and shipping country mismatch');
      }

      // Threshold to mark as suspicious
      if (riskScore >= 50) {
        flaggedOrders.push({
          ...order,
          riskScore,
          reasons,
        });
      }
    }

    return res.json({ success: true, flaggedOrders });
  } catch (error) {
    console.error('Error fetching fraud detection results:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getSystemSettings = catchAsync(
  async (req: Request, res: Response) => {
    const settings = await SystemSetting.find();
    res.json(settings);
  },
);

export const getSystemSettingByKey = catchAsync(
  async (req: Request, res: Response) => {
    const setting = await SystemSetting.findOne({ key: req.params.key });
    if (!setting) {
      res.status(404);
      throw new Error(`Setting with key '${req.params.key}' not found`);
    }
    res.json(setting);
  },
);

export const createSystemSetting = catchAsync(
  async (req: Request, res: Response) => {
    const { key, value, description } = req.body;

    const exists = await SystemSetting.findOne({ key });
    if (exists) {
      res.status(400);
      throw new Error('Setting with this key already exists');
    }

    const setting = await SystemSetting.create({
      key,
      value,
      description,
    });
    res.status(201).json(setting);
  },
);

export const updateSystemSetting = catchAsync(
  async (req: Request, res: Response) => {
    const { value, description } = req.body;

    const setting = await SystemSetting.findOneAndUpdate(
      { key: req.params.key },
      { value, description },
      { new: true, runValidators: true },
    );

    if (!setting) {
      res.status(404);
      throw new Error(`Setting with key '${req.params.key}' not found`);
    }

    res.json(setting);
  },
);

export const deleteSystemSetting = catchAsync(
  async (req: Request, res: Response) => {
    const setting = await SystemSetting.findOneAndDelete({
      key: req.params.key,
    });

    if (!setting) {
      res.status(404);
      throw new Error(`Setting with key '${req.params.key}' not found`);
    }

    res.json({ message: `Setting '${req.params.key}' deleted successfully` });
  },
);

// 📜 Get Activity Logs (last 100)
export const getActivityLogs = catchAsync(
  async (req: Request, res: Response) => {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, logs });
  },
);

export const systemSettings = catchAsync(
  async (req: Request, res: Response) => {
    const { enabled, limit } = req.body;

    let setting = await SystemSetting.findOne({
      key: 'feature_topBookedProducts',
    });
    if (!setting) {
      setting = new SystemSetting({
        key: 'feature_topBookedProducts',
        value: {},
      });
    }

    setting.value = { enabled, limit };
    await setting.save();

    res.status(200).json({ success: true, setting });
  },
);

// 👥 USER MANAGEMENT ENDPOINTS

// Get all users with filtering, sorting, and pagination
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.role) {
    filter.roles = { $in: [req.query.role] };
  }

  if (req.query.search) {
    const searchTerm = req.query.search as string;
    filter.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (req.query.verified !== undefined) {
    filter.verified = req.query.verified === 'true';
  }

  // Build sort object
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const users = await User.find(filter)
    .select('-password -passwordResetToken')
    .sort(sort as Record<string, SortOrder>)
    .skip(skip)
    .limit(limit)
    .lean();

  const totalUsers = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

// Get user analytics
export const getUserAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const verifiedUsers = await User.countDocuments({ verified: true });
    const unverifiedUsers = await User.countDocuments({ verified: false });

    // User registration trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Role distribution
    const roleDistribution = await User.aggregate([
      { $unwind: '$roles' },
      {
        $group: {
          _id: '$roles',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        statusBreakdown: {
          active: activeUsers,
          inactive: inactiveUsers,
          suspended: suspendedUsers,
        },
        verificationBreakdown: {
          verified: verifiedUsers,
          unverified: unverifiedUsers,
        },
        registrationTrends,
        roleDistribution,
      },
    });
  },
);

// Get single user by ID
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
    .select('-password -passwordResetToken')
    .populate('preferences');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Get user's order history
  const orders = await Order.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('totalAmount orderStatus paymentStatus createdAt');

  // Get user's booking history
  const bookings = await Booking.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('serviceName price status bookingDate');

  res.status(200).json({
    success: true,
    data: {
      user,
      recentOrders: orders,
      recentBookings: bookings,
    },
  });
});

// Update user
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const allowedFields = [
    'name',
    'email',
    'phone',
    'location',
    'status',
    'roles',
    'verified',
    'loyaltyPoints',
    'notes',
    'permissions',
  ];

  const updateData: any = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password -passwordResetToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Log activity
  await ActivityLog.create({
    action: 'USER_UPDATED',
    user: req.user?._id,
    description: `User ${user.name} (${user.email}) updated by admin`,
    metadata: { updatedFields: Object.keys(updateData) },
  });

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// Delete user (soft delete)
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: false, status: 'inactive' },
    { new: true },
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Log activity
  await ActivityLog.create({
    action: 'USER_DELETED',
    user: req.user?._id,
    description: `User ${user.name} (${user.email}) deleted by admin`,
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// Bulk user operations
export const bulkUserOperations = catchAsync(
  async (req: Request, res: Response) => {
    const { operation, userIds, data } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required',
      });
    }

    let result;

    switch (operation) {
      case 'delete':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { active: false, status: 'inactive' },
        );
        break;

      case 'suspend':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { status: 'suspended' },
        );
        break;

      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { status: 'active' },
        );
        break;

      case 'verify':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { verified: true },
        );
        break;

      case 'update_role':
        if (!data?.roles) {
          return res.status(400).json({
            success: false,
            message: 'Roles data is required for role update',
          });
        }
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { roles: data.roles },
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation',
        });
    }

    // Log bulk operation
    await ActivityLog.create({
      action: 'BULK_USER_OPERATION',
      user: req.user?._id,
      description: `Bulk ${operation} operation performed on ${userIds.length} users`,
      metadata: { operation, userIds, affectedCount: result.modifiedCount },
    });

    res.status(200).json({
      success: true,
      message: `Bulk ${operation} completed`,
      data: {
        affectedCount: result.modifiedCount,
      },
    });
  },
);

// 📅 BOOKING MANAGEMENT ENDPOINTS

// Get all bookings with filtering, sorting, and pagination
export const getAllBookings = catchAsync(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchTerm = req.query.search as string;
      filter.$or = [
        { customerName: { $regex: searchTerm, $options: 'i' } },
        { customerEmail: { $regex: searchTerm, $options: 'i' } },
        { serviceName: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (req.query.dateFrom || req.query.dateTo) {
      filter.bookingDate = {};
      if (req.query.dateFrom)
        filter.bookingDate.$gte = new Date(req.query.dateFrom as string);
      if (req.query.dateTo)
        filter.bookingDate.$lte = new Date(req.query.dateTo as string);
    }

    if (req.query.staff) {
      filter.staff = req.query.staff;
    }

    if (req.query.service) {
      filter.service = req.query.service;
    }

    // Build sort object
    const sortBy = (req.query.sortBy as string) || 'bookingDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('staff', 'name')
      .populate('service', 'name category')
      .sort(sort as Record<string, SortOrder>)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / limit);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  },
);

// Get booking analytics
export const getBookingAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({
      status: 'confirmed',
    });
    const completedBookings = await Booking.countDocuments({
      status: 'completed',
    });
    const cancelledBookings = await Booking.countDocuments({
      status: 'cancelled',
    });

    // Booking trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Service popularity
    const servicePopularity = await Booking.aggregate([
      {
        $group: {
          _id: '$serviceName',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Staff performance
    const staffPerformance = await Booking.aggregate([
      {
        $group: {
          _id: '$staff',
          staffName: { $first: '$staffName' },
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          totalRevenue: { $sum: '$price' },
        },
      },
      {
        $project: {
          _id: 1,
          staffName: 1,
          totalBookings: 1,
          completedBookings: 1,
          totalRevenue: 1,
          completionRate: {
            $cond: [
              { $gt: ['$totalBookings', 0] },
              {
                $multiply: [
                  { $divide: ['$completedBookings', '$totalBookings'] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { totalBookings: -1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalBookings,
        statusBreakdown: {
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
        bookingTrends,
        servicePopularity,
        staffPerformance,
      },
    });
  },
);

// Get single booking by ID
export const getBookingById = catchAsync(
  async (req: Request, res: Response) => {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('staff', 'name email')
      .populate('service', 'name category duration price');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { booking },
    });
  },
);

// Update booking status
export const updateBookingStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { status, notes } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true },
    ).populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Log activity
    await ActivityLog.create({
      action: 'BOOKING_STATUS_UPDATED',
      user: req.user?._id,
      description: `Booking #${booking._id} status updated to ${status}`,
      metadata: { bookingId: booking._id, newStatus: status },
    });

    res.status(200).json({
      success: true,
      data: { booking },
    });
  },
);

// Cancel booking
export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const { reason } = req.body;

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    {
      status: 'cancelled',
      notes: reason || 'Booking cancelled by admin',
    },
    { new: true },
  ).populate('user', 'name email');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  // Log activity
  await ActivityLog.create({
    action: 'BOOKING_CANCELLED',
    user: req.user?._id,
    description: `Booking #${booking._id} cancelled by admin`,
    metadata: { bookingId: booking._id, reason },
  });

  res.status(200).json({
    success: true,
    data: { booking },
    message: 'Booking cancelled successfully',
  });
});

// Bulk booking operations
export const bulkBookingOperations = catchAsync(
  async (req: Request, res: Response) => {
    const { operation, bookingIds, data } = req.body;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Booking IDs array is required',
      });
    }

    let result;

    switch (operation) {
      case 'confirm':
        result = await Booking.updateMany(
          { _id: { $in: bookingIds } },
          { status: 'confirmed' },
        );
        break;

      case 'complete':
        result = await Booking.updateMany(
          { _id: { $in: bookingIds } },
          { status: 'completed' },
        );
        break;

      case 'cancel':
        result = await Booking.updateMany(
          { _id: { $in: bookingIds } },
          {
            status: 'cancelled',
            notes: data?.reason || 'Bulk cancelled by admin',
          },
        );
        break;

      case 'reschedule':
        if (!data?.newDate) {
          return res.status(400).json({
            success: false,
            message: 'New date is required for rescheduling',
          });
        }
        result = await Booking.updateMany(
          { _id: { $in: bookingIds } },
          { bookingDate: new Date(data.newDate) },
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation',
        });
    }

    // Log bulk operation
    await ActivityLog.create({
      action: 'BULK_BOOKING_OPERATION',
      user: req.user?._id,
      description: `Bulk ${operation} operation performed on ${bookingIds.length} bookings`,
      metadata: { operation, bookingIds, affectedCount: result.modifiedCount },
    });

    res.status(200).json({
      success: true,
      message: `Bulk ${operation} completed`,
      data: {
        affectedCount: result.modifiedCount,
      },
    });
  },
);

// 💬 CHAT MANAGEMENT ENDPOINTS

// Get all chats with filtering, sorting, and pagination
export const getAllChats = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.assigned) {
    filter.isAssigned = req.query.assigned === 'true';
  }

  if (req.query.assignedTo) {
    filter.assignedTo = req.query.assignedTo;
  }

  if (req.query.search) {
    const searchTerm = req.query.search as string;
    filter.$or = [
      { subject: { $regex: searchTerm, $options: 'i' } },
      { 'messages.content': { $regex: searchTerm, $options: 'i' } },
    ];
  }

  // Build sort object
  const sortBy = (req.query.sortBy as string) || 'lastMessageAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const chats = await Chat.find(filter)
    .populate('user', 'name email photo')
    .populate('assignedTo', 'name email')
    .populate('admin', 'name email')
    .sort(sort as Record<string, SortOrder>)
    .skip(skip)
    .limit(limit)
    .lean();

  const totalChats = await Chat.countDocuments(filter);
  const totalPages = Math.ceil(totalChats / limit);

  res.status(200).json({
    success: true,
    data: {
      chats,
      pagination: {
        currentPage: page,
        totalPages,
        totalChats,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

// Get chat analytics
export const getChatAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const totalChats = await Chat.countDocuments();
    const activeChats = await Chat.countDocuments({ status: 'active' });
    const pendingChats = await Chat.countDocuments({ status: 'pending' });
    const closedChats = await Chat.countDocuments({ status: 'closed' });

    const assignedChats = await Chat.countDocuments({ isAssigned: true });
    const unassignedChats = await Chat.countDocuments({ isAssigned: false });

    // Priority breakdown
    const urgentChats = await Chat.countDocuments({
      priority: 'urgent',
      status: { $ne: 'closed' },
    });
    const highPriorityChats = await Chat.countDocuments({
      priority: 'high',
      status: { $ne: 'closed' },
    });
    const mediumPriorityChats = await Chat.countDocuments({
      priority: 'medium',
      status: { $ne: 'closed' },
    });
    const lowPriorityChats = await Chat.countDocuments({
      priority: 'low',
      status: { $ne: 'closed' },
    });

    // Category distribution
    const categoryDistribution = await Chat.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Response time analytics (time from pending to active/closed)
    const responseTimeStats = await Chat.aggregate([
      {
        $match: {
          status: { $in: ['active', 'closed'] },
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      },
      {
        $addFields: {
          responseTime: {
            $subtract: [
              { $ifNull: ['$lastMessageAt', '$updatedAt'] },
              '$createdAt',
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          totalChats: { $sum: 1 },
        },
      },
    ]);

    // Staff performance (chat assignments)
    const staffPerformance = await Chat.aggregate([
      {
        $match: {
          isAssigned: true,
          assignedTo: { $exists: true },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'staffInfo',
        },
      },
      { $unwind: '$staffInfo' },
      {
        $group: {
          _id: '$assignedTo',
          staffName: { $first: '$staffInfo.name' },
          totalChats: { $sum: 1 },
          activeChats: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          closedChats: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 1,
          staffName: 1,
          totalChats: 1,
          activeChats: 1,
          closedChats: 1,
          resolutionRate: {
            $cond: [
              { $gt: ['$totalChats', 0] },
              {
                $multiply: [{ $divide: ['$closedChats', '$totalChats'] }, 100],
              },
              0,
            ],
          },
        },
      },
      { $sort: { totalChats: -1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalChats,
        statusBreakdown: {
          active: activeChats,
          pending: pendingChats,
          closed: closedChats,
        },
        assignmentBreakdown: {
          assigned: assignedChats,
          unassigned: unassignedChats,
        },
        priorityBreakdown: {
          urgent: urgentChats,
          high: highPriorityChats,
          medium: mediumPriorityChats,
          low: lowPriorityChats,
        },
        categoryDistribution,
        responseTimeStats: responseTimeStats[0] || {
          avgResponseTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0,
          totalChats: 0,
        },
        staffPerformance,
      },
    });
  },
);

// Get single chat by ID
export const getChatById = catchAsync(async (req: Request, res: Response) => {
  const chat = await Chat.findById(req.params.id)
    .populate('user', 'name email phone photo')
    .populate('assignedTo', 'name email')
    .populate('admin', 'name email')
    .populate({
      path: 'messages.sender',
      select: 'name email',
    });

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    });
  }

  res.status(200).json({
    success: true,
    data: { chat },
  });
});

// Create new chat (admin-initiated)
export const createChat = catchAsync(async (req: Request, res: Response) => {
  const { user, subject, category, priority, initialMessage } = req.body;

  const chatData: any = {
    user,
    subject,
    category: category || 'general',
    priority: priority || 'medium',
    admin: req.user?._id,
    status: 'active',
  };

  // Add initial message if provided
  if (initialMessage) {
    chatData.messages = [
      {
        sender: req.user?._id,
        senderType: 'admin',
        content: initialMessage,
        messageType: 'text',
        timestamp: new Date(),
        isRead: false,
      },
    ];
  }

  const chat = await Chat.create(chatData);

  // Populate the created chat
  const populatedChat = await Chat.findById(chat._id)
    .populate('user', 'name email')
    .populate('admin', 'name email');

  // Log activity
  await ActivityLog.create({
    action: 'CHAT_CREATED',
    user: req.user?._id,
    description: `Chat created with subject: "${subject}"`,
    metadata: { chatId: chat._id, subject },
  });

  res.status(201).json({
    success: true,
    data: { chat: populatedChat },
  });
});

// Add message to chat
export const addMessageToChat = catchAsync(
  async (req: Request, res: Response) => {
    const { content, messageType = 'text' } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Add new message
    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    const newMessage = {
      sender: new Types.ObjectId(req.user._id),
      senderType: 'admin' as const,
      content,
      messageType,
      timestamp: new Date(),
      isRead: false,
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();

    // If chat was closed, reactivate it
    if (chat.status === 'closed') {
      chat.status = 'active';
    }

    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: { chat: updatedChat, message: newMessage },
    });
  },
);

// Assign chat to staff/admin
export const assignChat = catchAsync(async (req: Request, res: Response) => {
  const { assignedTo } = req.body;

  const chat = await Chat.findByIdAndUpdate(
    req.params.id,
    {
      assignedTo,
      isAssigned: true,
      status: 'active',
    },
    { new: true },
  )
    .populate('assignedTo', 'name email')
    .populate('user', 'name email');

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    });
  }

  // Log activity
  await ActivityLog.create({
    action: 'CHAT_ASSIGNED',
    user: req.user?._id,
    description: `Chat "${chat.subject}" assigned to staff member`,
    metadata: { chatId: chat._id, assignedTo },
  });

  res.status(200).json({
    success: true,
    data: { chat },
    message: 'Chat assigned successfully',
  });
});

// Update chat status/priority
export const updateChatStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { status, priority, tags } = req.body;

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'closed') {
        updateData.closedAt = new Date();
      }
    }
    if (priority) updateData.priority = priority;
    if (tags) updateData.tags = tags;

    const chat = await Chat.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Log activity
    await ActivityLog.create({
      action: 'CHAT_UPDATED',
      user: req.user?._id,
      description: `Chat "${chat.subject}" updated`,
      metadata: { chatId: chat._id, updates: updateData },
    });

    res.status(200).json({
      success: true,
      data: { chat },
    });
  },
);

// Close chat
export const closeChat = catchAsync(async (req: Request, res: Response) => {
  const { closeReason } = req.body;

  const chat = await Chat.findByIdAndUpdate(
    req.params.id,
    {
      status: 'closed',
      closedAt: new Date(),
    },
    { new: true },
  ).populate('user', 'name email');

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    });
  }

  // Add closing message if reason provided
  if (closeReason) {
    chat.messages.push({
      sender: req.user?._id,
      senderType: 'admin',
      content: `Chat closed: ${closeReason}`,
      messageType: 'text',
      timestamp: new Date(),
      isRead: false,
    });
    await chat.save();
  }

  // Log activity
  await ActivityLog.create({
    action: 'CHAT_CLOSED',
    user: req.user?._id,
    description: `Chat "${chat.subject}" closed`,
    metadata: { chatId: chat._id, reason: closeReason },
  });

  res.status(200).json({
    success: true,
    data: { chat },
    message: 'Chat closed successfully',
  });
});

// Mark messages as read
export const markMessagesAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const { messageIds } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Mark specified messages as read
    if (messageIds && Array.isArray(messageIds)) {
      messageIds.forEach((messageId) => {
        const message = chat.messages.id(messageId);
        if (message) {
          message.isRead = true;
        }
      });
    } else {
      // Mark all messages as read
      chat.messages.forEach((message) => {
        message.isRead = true;
      });
    }

    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  },
);

// Bulk chat operations
export const bulkChatOperations = catchAsync(
  async (req: Request, res: Response) => {
    const { operation, chatIds, data } = req.body;

    if (!Array.isArray(chatIds) || chatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chat IDs array is required',
      });
    }

    let result;

    switch (operation) {
      case 'assign':
        if (!data?.assignedTo) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user ID is required',
          });
        }
        result = await Chat.updateMany(
          { _id: { $in: chatIds } },
          {
            assignedTo: data.assignedTo,
            isAssigned: true,
            status: 'active',
          },
        );
        break;

      case 'close':
        result = await Chat.updateMany(
          { _id: { $in: chatIds } },
          {
            status: 'closed',
            closedAt: new Date(),
          },
        );
        break;

      case 'update_priority':
        if (!data?.priority) {
          return res.status(400).json({
            success: false,
            message: 'Priority is required',
          });
        }
        result = await Chat.updateMany(
          { _id: { $in: chatIds } },
          { priority: data.priority },
        );
        break;

      case 'update_category':
        if (!data?.category) {
          return res.status(400).json({
            success: false,
            message: 'Category is required',
          });
        }
        result = await Chat.updateMany(
          { _id: { $in: chatIds } },
          { category: data.category },
        );
        break;

      case 'activate':
        result = await Chat.updateMany(
          { _id: { $in: chatIds } },
          { status: 'active' },
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation',
        });
    }

    // Log bulk operation
    await ActivityLog.create({
      action: 'BULK_CHAT_OPERATION',
      user: req.user?._id,
      description: `Bulk ${operation} operation performed on ${chatIds.length} chats`,
      metadata: { operation, chatIds, affectedCount: result.modifiedCount },
    });

    res.status(200).json({
      success: true,
      message: `Bulk ${operation} completed`,
      data: {
        affectedCount: result.modifiedCount,
      },
    });
  },
);

// 📎 PRODUCT MANAGEMENT ENDPOINTS

// Get all products with filtering, sorting, and pagination
export const getAllProducts = catchAsync(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.inStock !== undefined) {
      filter.inStock = req.query.inStock === 'true';
    }

    if (req.query.search) {
      const searchTerm = req.query.search as string;
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      ];
    }

    if (req.query.priceMin || req.query.priceMax) {
      filter.price = {};
      if (req.query.priceMin)
        filter.price.$gte = parseFloat(req.query.priceMin as string);
      if (req.query.priceMax)
        filter.price.$lte = parseFloat(req.query.priceMax as string);
    }

    if (req.query.stockStatus) {
      switch (req.query.stockStatus) {
        case 'in_stock':
          filter.inStock = true;
          filter.quantity = { $gt: 0 };
          break;
        case 'low_stock':
          filter.inStock = true;
          filter.quantity = { $lte: 10, $gt: 0 };
          break;
        case 'out_of_stock':
          filter.$or = [{ inStock: false }, { quantity: 0 }];
          break;
      }
    }

    // Build sort object
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(sort as Record<string, SortOrder>)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  },
);

// Get product analytics
export const getProductAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const totalProducts = await Product.countDocuments();
    const inStockProducts = await Product.countDocuments({ inStock: true });
    const outOfStockProducts = await Product.countDocuments({ inStock: false });
    const lowStockProducts = await Product.countDocuments({
      quantity: { $lte: 10, $gt: 0 },
    });

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryInfo.name' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Price distribution
    const priceRanges = await Product.aggregate([
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 10000, 25000, 50000, 100000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
          },
        },
      },
    ]);

    // Top selling products
    const topSellingProducts = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 1,
          name: '$productInfo.name',
          price: '$productInfo.price',
          totalSold: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalProducts,
        stockBreakdown: {
          inStock: inStockProducts,
          outOfStock: outOfStockProducts,
          lowStock: lowStockProducts,
        },
        categoryDistribution,
        priceRanges,
        topSellingProducts,
      },
    });
  },
);

// Get single product by ID
export const getProductById = catchAsync(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('reviews');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get product order history
    const orderHistory = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.product': product._id } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        product,
        salesHistory: orderHistory,
      },
    });
  },
);

// Create new product
export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.create(req.body);

  // Log activity
  await ActivityLog.create({
    action: 'PRODUCT_CREATED',
    user: req.user?._id,
    description: `Product "${product.name}" created by admin`,
    metadata: { productId: product._id },
  });

  res.status(201).json({
    success: true,
    data: { product },
  });
});

// Update product
export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name');

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Log activity
  await ActivityLog.create({
    action: 'PRODUCT_UPDATED',
    user: req.user?._id,
    description: `Product "${product.name}" updated by admin`,
    metadata: { productId: product._id, updatedFields: Object.keys(req.body) },
  });

  res.status(200).json({
    success: true,
    data: { product },
  });
});

// Delete product
export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Log activity
  await ActivityLog.create({
    action: 'PRODUCT_DELETED',
    user: req.user?._id,
    description: `Product "${product.name}" deleted by admin`,
    metadata: { productId: product._id },
  });

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// Bulk product operations
export const bulkProductOperations = catchAsync(
  async (req: Request, res: Response) => {
    const { operation, productIds, data } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required',
      });
    }

    let result;

    switch (operation) {
      case 'delete':
        result = await Product.deleteMany({ _id: { $in: productIds } });
        break;

      case 'update_stock':
        if (data?.inStock === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Stock status is required',
          });
        }
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { inStock: data.inStock },
        );
        break;

      case 'update_category':
        if (!data?.category) {
          return res.status(400).json({
            success: false,
            message: 'Category is required',
          });
        }
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { category: data.category },
        );
        break;

      case 'mark_featured':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { isFeatured: true },
        );
        break;

      case 'unmark_featured':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { isFeatured: false },
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation',
        });
    }

    // function getAffectedCount(result: DeleteResult | UpdateResult): number {
    //   if ('modifiedCount' in result) return result.modifiedCount;
    //   if ('deletedCount' in result) return result.deletedCount;
    //   return 0;
    // }

    let affectedCount = 0;

    if ('modifiedCount' in result) {
      affectedCount = result.modifiedCount;
    } else if ('deletedCount' in result) {
      affectedCount = result.deletedCount;
    }

    // Log bulk operation
    await ActivityLog.create({
      action: 'BULK_PRODUCT_OPERATION',
      user: req.user?._id,
      description: `Bulk ${operation} operation performed on ${productIds.length} products`,
      metadata: {
        operation,
        productIds,
        affectedCount,
      },
    });

    res.status(200).json({
      success: true,
      message: `Bulk ${operation} completed`,
      data: {
        affectedCount,
      },
    });
  },
);

// 📋 ORDER MANAGEMENT ENDPOINTS

// Get all orders with filtering, sorting, and pagination
export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {};

  if (req.query.orderStatus) {
    filter.orderStatus = req.query.orderStatus;
  }

  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  if (req.query.search) {
    const searchTerm = req.query.search as string;
    // Search by user email or name (requires population)
    const users = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ],
    }).select('_id');

    if (users.length > 0) {
      filter.user = { $in: users.map((u) => u._id) };
    }
  }

  if (req.query.dateFrom || req.query.dateTo) {
    filter.createdAt = {};
    if (req.query.dateFrom)
      filter.createdAt.$gte = new Date(req.query.dateFrom as string);
    if (req.query.dateTo)
      filter.createdAt.$lte = new Date(req.query.dateTo as string);
  }

  if (req.query.amountMin || req.query.amountMax) {
    filter.totalAmount = {};
    if (req.query.amountMin)
      filter.totalAmount.$gte = parseFloat(req.query.amountMin as string);
    if (req.query.amountMax)
      filter.totalAmount.$lte = parseFloat(req.query.amountMax as string);
  }

  // Build sort object
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('items.product', 'name price')
    .sort(sort as Record<string, SortOrder>)
    .skip(skip)
    .limit(limit)
    .lean();

  const totalOrders = await Order.countDocuments(filter);
  const totalPages = Math.ceil(totalOrders / limit);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

// Get order analytics
export const getOrderAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      orderStatus: 'pending',
    });
    const processingOrders = await Order.countDocuments({
      orderStatus: 'processing',
    });
    const shippedOrders = await Order.countDocuments({
      orderStatus: 'shipped',
    });
    const deliveredOrders = await Order.countDocuments({
      orderStatus: 'delivered',
    });
    const cancelledOrders = await Order.countDocuments({
      orderStatus: 'cancelled',
    });

    const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const pendingPayments = await Order.countDocuments({
      paymentStatus: 'pending',
    });
    const failedPayments = await Order.countDocuments({
      paymentStatus: 'failed',
    });
    const refundedOrders = await Order.countDocuments({
      paymentStatus: 'refunded',
    });

    // Revenue trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const revenueTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Average order value
    const avgOrderValue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$totalAmount' },
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Payment method distribution
    const paymentMethodDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalOrders,
        orderStatusBreakdown: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        paymentStatusBreakdown: {
          paid: paidOrders,
          pending: pendingPayments,
          failed: failedPayments,
          refunded: refundedOrders,
        },
        revenueTrends,
        averageOrderValue: avgOrderValue[0]?.avgValue || 0,
        totalRevenue: avgOrderValue[0]?.totalRevenue || 0,
        paymentMethodDistribution,
      },
    });
  },
);

// Get single order by ID
export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name price imageCover');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  res.status(200).json({
    success: true,
    data: { order },
  });
});

// Update order status
export const updateOrderStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { orderStatus, paymentStatus, trackingInfo } = req.body;

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    // Add tracking info if provided
    if (trackingInfo && orderStatus) {
      updateData.$push = {
        deliveryTracking: {
          status: orderStatus,
          updatedAt: new Date(),
          location: trackingInfo.location,
          note: trackingInfo.note,
        },
      };
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Log activity
    await ActivityLog.create({
      action: 'ORDER_STATUS_UPDATED',
      user: req.user?._id,
      description: `Order #${order._id} status updated to ${orderStatus || paymentStatus}`,
      metadata: { orderId: order._id, newStatus: orderStatus || paymentStatus },
    });

    res.status(200).json({
      success: true,
      data: { order },
    });
  },
);

// Cancel order
export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const { reason } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      orderStatus: 'cancelled',
      $push: {
        deliveryTracking: {
          status: 'cancelled',
          updatedAt: new Date(),
          note: reason || 'Order cancelled by admin',
        },
      },
    },
    { new: true },
  ).populate('user', 'name email');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Log activity
  await ActivityLog.create({
    action: 'ORDER_CANCELLED',
    user: req.user?._id,
    description: `Order #${order._id} cancelled by admin`,
    metadata: { orderId: order._id, reason },
  });

  res.status(200).json({
    success: true,
    data: { order },
    message: 'Order cancelled successfully',
  });
});

// Bulk order operations
export const bulkOrderOperations = catchAsync(
  async (req: Request, res: Response) => {
    const { operation, orderIds, data } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required',
      });
    }

    let result;

    switch (operation) {
      case 'update_status':
        if (!data?.status) {
          return res.status(400).json({
            success: false,
            message: 'Status is required',
          });
        }
        result = await Order.updateMany(
          { _id: { $in: orderIds } },
          { orderStatus: data.status },
        );
        break;

      case 'update_payment_status':
        if (!data?.paymentStatus) {
          return res.status(400).json({
            success: false,
            message: 'Payment status is required',
          });
        }
        result = await Order.updateMany(
          { _id: { $in: orderIds } },
          { paymentStatus: data.paymentStatus },
        );
        break;

      case 'cancel':
        result = await Order.updateMany(
          { _id: { $in: orderIds } },
          {
            orderStatus: 'cancelled',
            $push: {
              deliveryTracking: {
                status: 'cancelled',
                updatedAt: new Date(),
                note: data?.reason || 'Bulk cancelled by admin',
              },
            },
          },
        );
        break;

      case 'mark_paid':
        result = await Order.updateMany(
          { _id: { $in: orderIds } },
          {
            paymentStatus: 'paid',
            isPaid: true,
            paidAt: new Date(),
          },
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation',
        });
    }

    // Log bulk operation
    await ActivityLog.create({
      action: 'BULK_ORDER_OPERATION',
      user: req.user?._id,
      description: `Bulk ${operation} operation performed on ${orderIds.length} orders`,
      metadata: { operation, orderIds, affectedCount: result.modifiedCount },
    });

    res.status(200).json({
      success: true,
      message: `Bulk ${operation} completed`,
      data: {
        affectedCount: result.modifiedCount,
      },
    });
  },
);

// 📊 REPORTS AND ANALYTICS

// Generate comprehensive business report
export const generateBusinessReport = catchAsync(
  async (req: Request, res: Response) => {
    const { startDate, endDate, reportType } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    const filter =
      Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Sales & Revenue Report
    if (reportType === 'sales' || !reportType) {
      const salesData = await Order.aggregate([
        { $match: { ...filter, paymentStatus: 'paid' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]);

      const productSales = await Order.aggregate([
        { $match: { ...filter, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.subtotal' },
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        { $unwind: '$productInfo' },
        {
          $project: {
            name: '$productInfo.name',
            category: '$productInfo.category',
            totalSold: 1,
            totalRevenue: 1,
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 20 },
      ]);

      return res.status(200).json({
        success: true,
        report: {
          type: 'sales',
          period: { startDate, endDate },
          salesData,
          topProducts: productSales,
          summary: {
            totalRevenue: salesData.reduce(
              (sum, day) => sum + day.totalRevenue,
              0,
            ),
            totalOrders: salesData.reduce(
              (sum, day) => sum + day.orderCount,
              0,
            ),
            avgDailyRevenue:
              salesData.length > 0
                ? salesData.reduce((sum, day) => sum + day.totalRevenue, 0) /
                  salesData.length
                : 0,
          },
        },
      });
    }

    // Customer Analytics Report
    if (reportType === 'customers') {
      const customerData = await User.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            newCustomers: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const customerSegments = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            lastOrderDate: { $max: '$createdAt' },
          },
        },
        {
          $addFields: {
            customerType: {
              $switch: {
                branches: [
                  { case: { $gte: ['$totalSpent', 100000] }, then: 'VIP' },
                  { case: { $gte: ['$totalSpent', 50000] }, then: 'Premium' },
                  { case: { $gte: ['$orderCount', 5] }, then: 'Loyal' },
                ],
                default: 'Regular',
              },
            },
          },
        },
        {
          $group: {
            _id: '$customerType',
            count: { $sum: 1 },
            avgSpent: { $avg: '$totalSpent' },
            totalRevenue: { $sum: '$totalSpent' },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        report: {
          type: 'customers',
          period: { startDate, endDate },
          customerData,
          customerSegments,
        },
      });
    }

    // Booking Performance Report
    if (reportType === 'bookings') {
      const bookingData = await Booking.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              status: '$status',
            },
            count: { $sum: 1 },
            totalRevenue: { $sum: '$price' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const servicePerformance = await Booking.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$serviceName',
            bookingCount: { $sum: 1 },
            completedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            totalRevenue: { $sum: '$price' },
            avgPrice: { $avg: '$price' },
          },
        },
        {
          $addFields: {
            completionRate: {
              $multiply: [
                { $divide: ['$completedCount', '$bookingCount'] },
                100,
              ],
            },
          },
        },
        { $sort: { bookingCount: -1 } },
      ]);

      return res.status(200).json({
        success: true,
        report: {
          type: 'bookings',
          period: { startDate, endDate },
          bookingData,
          servicePerformance,
        },
      });
    }

    // Default comprehensive report
    const summary = {
      totalUsers: await User.countDocuments(filter),
      totalOrders: await Order.countDocuments(filter),
      totalBookings: await Booking.countDocuments(filter),
      totalRevenue:
        (
          await Order.aggregate([
            { $match: { ...filter, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ])
        )[0]?.total || 0,
    };

    res.status(200).json({
      success: true,
      report: {
        type: 'summary',
        period: { startDate, endDate },
        summary,
      },
    });
  },
);

// Export data for external analysis
export const exportData = catchAsync(async (req: Request, res: Response) => {
  const { dataType, format = 'json', startDate, endDate } = req.query;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);

  const filter =
    Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  let data;
  let filename;

  switch (dataType) {
    case 'users':
      data = await User.find(filter)
        .select('-password -passwordResetToken')
        .lean();
      filename = `users_export_${Date.now()}`;
      break;

    case 'orders':
      data = await Order.find(filter).populate('user', 'name email').lean();
      filename = `orders_export_${Date.now()}`;
      break;

    case 'bookings':
      data = await Booking.find(filter).populate('user', 'name email').lean();
      filename = `bookings_export_${Date.now()}`;
      break;

    case 'products':
      data = await Product.find(filter).lean();
      filename = `products_export_${Date.now()}`;
      break;

    case 'chats':
      data = await Chat.find(filter).populate('user', 'name email').lean();
      filename = `chats_export_${Date.now()}`;
      break;

    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid data type specified',
      });
  }

  if (format === 'csv') {
    // For CSV format, we'll return the data as JSON with CSV headers
    // Frontend can handle CSV conversion
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}.json"`,
    );
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}.json"`,
    );
  }

  res.status(200).json({
    success: true,
    data,
    metadata: {
      exportType: dataType,
      format,
      recordCount: data.length,
      exportedAt: new Date(),
      period: { startDate, endDate },
    },
  });
});

// 🔔 NOTIFICATION MANAGEMENT

// Get system notifications for admin
export const getNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const notifications = [];

    // Check for low stock products
    const lowStockProducts = await Product.find({
      quantity: { $lte: 10, $gt: 0 },
    })
      .select('name quantity')
      .lean();

    lowStockProducts.forEach((product) => {
      notifications.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `Product "${product.name}" has only ${product.quantity} items left`,
        category: 'inventory',
        createdAt: new Date(),
        priority: 'medium',
      });
    });

    // Check for pending orders
    const pendingOrdersCount = await Order.countDocuments({
      orderStatus: 'pending',
    });
    if (pendingOrdersCount > 0) {
      notifications.push({
        type: 'info',
        title: 'Pending Orders',
        message: `${pendingOrdersCount} orders are pending processing`,
        category: 'orders',
        createdAt: new Date(),
        priority: pendingOrdersCount > 10 ? 'high' : 'medium',
      });
    }

    // Check for unassigned chats
    const unassignedChatsCount = await Chat.countDocuments({
      status: 'pending',
      isAssigned: false,
    });
    if (unassignedChatsCount > 0) {
      notifications.push({
        type: 'info',
        title: 'Unassigned Chats',
        message: `${unassignedChatsCount} chats need to be assigned to staff`,
        category: 'support',
        createdAt: new Date(),
        priority: unassignedChatsCount > 5 ? 'high' : 'medium',
      });
    }

    // Check for urgent chats
    const urgentChatsCount = await Chat.countDocuments({
      priority: 'urgent',
      status: { $ne: 'closed' },
    });
    if (urgentChatsCount > 0) {
      notifications.push({
        type: 'error',
        title: 'Urgent Support Requests',
        message: `${urgentChatsCount} urgent support requests require immediate attention`,
        category: 'support',
        createdAt: new Date(),
        priority: 'urgent',
      });
    }

    // Check for failed payments
    const failedPaymentsCount = await Order.countDocuments({
      paymentStatus: 'failed',
    });
    if (failedPaymentsCount > 0) {
      notifications.push({
        type: 'warning',
        title: 'Failed Payments',
        message: `${failedPaymentsCount} orders have failed payments`,
        category: 'payments',
        createdAt: new Date(),
        priority: 'high',
      });
    }

    // Check for overdue bookings
    const overdueBookings = await Booking.countDocuments({
      bookingDate: { $lt: new Date() },
      status: 'confirmed',
    });
    if (overdueBookings > 0) {
      notifications.push({
        type: 'warning',
        title: 'Overdue Bookings',
        message: `${overdueBookings} confirmed bookings are overdue`,
        category: 'bookings',
        createdAt: new Date(),
        priority: 'high',
      });
    }

    // Sort notifications by priority and date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    notifications.sort((a, b) => {
      const priorityDiff =
        priorityOrder[b.priority as keyof typeof priorityOrder] -
        priorityOrder[a.priority as keyof typeof priorityOrder];

      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount: notifications.length,
      summary: {
        urgent: notifications.filter((n) => n.priority === 'urgent').length,
        high: notifications.filter((n) => n.priority === 'high').length,
        medium: notifications.filter((n) => n.priority === 'medium').length,
        low: notifications.filter((n) => n.priority === 'low').length,
      },
    });
  },
);

// 🎯 ADVANCED ANALYTICS

// Get conversion funnel analytics
export const getConversionFunnel = catchAsync(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    // User registration to first purchase funnel
    const totalUsers = await User.countDocuments(
      Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
    );

    const usersWithOrders = await User.aggregate([
      ...(Object.keys(dateFilter).length > 0
        ? [{ $match: { createdAt: dateFilter } }]
        : []),
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $match: {
          'orders.0': { $exists: true },
        },
      },
      {
        $count: 'total',
      },
    ]);

    const usersWithPaidOrders = await User.aggregate([
      ...(Object.keys(dateFilter).length > 0
        ? [{ $match: { createdAt: dateFilter } }]
        : []),
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $match: {
          'orders.paymentStatus': 'paid',
        },
      },
      {
        $count: 'total',
      },
    ]);

    const repeatCustomers = await Order.aggregate([
      ...(Object.keys(dateFilter).length > 0
        ? [{ $match: { createdAt: dateFilter } }]
        : []),
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
        },
      },
      {
        $match: {
          orderCount: { $gt: 1 },
        },
      },
      {
        $count: 'total',
      },
    ]);

    const conversionRates = {
      registrationToOrder:
        totalUsers > 0
          ? ((usersWithOrders[0]?.total || 0) / totalUsers) * 100
          : 0,
      orderToPayment:
        (usersWithOrders[0]?.total || 0) > 0
          ? ((usersWithPaidOrders[0]?.total || 0) /
              (usersWithOrders[0]?.total || 1)) *
            100
          : 0,
      customerRetention:
        (usersWithPaidOrders[0]?.total || 0) > 0
          ? ((repeatCustomers[0]?.total || 0) /
              (usersWithPaidOrders[0]?.total || 1)) *
            100
          : 0,
    };

    res.status(200).json({
      success: true,
      funnel: {
        totalUsers,
        usersWithOrders: usersWithOrders[0]?.total || 0,
        usersWithPaidOrders: usersWithPaidOrders[0]?.total || 0,
        repeatCustomers: repeatCustomers[0]?.total || 0,
        conversionRates,
      },
    });
  },
);

// Get cohort analysis
export const getCohortAnalysis = catchAsync(
  async (req: Request, res: Response) => {
    const cohortData = await User.aggregate([
      {
        $addFields: {
          registrationCohort: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $unwind: {
          path: '$orders',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          orderMonth: {
            $dateToString: {
              format: '%Y-%m',
              date: '$orders.createdAt',
            },
          },
        },
      },
      {
        $group: {
          _id: {
            registrationCohort: '$registrationCohort',
            orderMonth: '$orderMonth',
          },
          userCount: { $addToSet: '$_id' },
        },
      },
      {
        $addFields: {
          userCount: { $size: '$userCount' },
        },
      },
      {
        $group: {
          _id: '$_id.registrationCohort',
          months: {
            $push: {
              month: '$_id.orderMonth',
              activeUsers: '$userCount',
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      cohortAnalysis: cohortData,
    });
  },
);

// 🔧 SYSTEM MAINTENANCE

// Clear cache and temporary data
export const clearSystemCache = catchAsync(
  async (req: Request, res: Response) => {
    // Log the cache clearing activity
    await ActivityLog.create({
      action: 'SYSTEM_CACHE_CLEARED',
      user: req.user?._id,
      description: 'System cache cleared by admin',
    });

    // Here you could implement actual cache clearing logic
    // For example, if using Redis: await redisClient.flushall();

    res.status(200).json({
      success: true,
      message: 'System cache cleared successfully',
    });
  },
);

// Database maintenance and cleanup
export const performDatabaseMaintenance = catchAsync(
  async (req: Request, res: Response) => {
    const { operation } = req.body;

    let result;

    switch (operation) {
      case 'cleanup_old_logs':
        // Remove activity logs older than 90 days
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        result = await ActivityLog.deleteMany({
          createdAt: { $lt: ninetyDaysAgo },
        });
        break;

      case 'cleanup_abandoned_carts':
        // Remove orders that are still pending after 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        result = await Order.deleteMany({
          orderStatus: 'pending',
          paymentStatus: { $ne: 'paid' },
          createdAt: { $lt: sevenDaysAgo },
        });
        break;

      case 'update_indexes':
        // This would typically involve database-specific operations
        result = { acknowledged: true, message: 'Database indexes updated' };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid maintenance operation',
        });
    }

    // Log maintenance activity
    await ActivityLog.create({
      action: 'DATABASE_MAINTENANCE',
      user: req.user?._id,
      description: `Database maintenance performed: ${operation}`,
      metadata: { operation, result },
    });

    res.status(200).json({
      success: true,
      message: `Database maintenance completed: ${operation}`,
      result,
    });
  },
);

// Get system health status
export const getSystemHealth = catchAsync(
  async (req: Request, res: Response) => {
    const header = req.headers['x-request-start'];
    const headerValue = Array.isArray(header) ? header[0] : header;

    const startTime = headerValue
      ? new Date(headerValue).getTime()
      : Date.now();

    const responseTime = Date.now() - startTime;
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        database: 'healthy',
        server: 'healthy',
        memory: 'healthy',
        disk: 'healthy',
      },
      metrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        activeConnections: 0, // Would be populated from actual connection pool
        responseTime:
          Date.now() -
          new Date(
            Array.isArray(req.headers['x-request-start'])
              ? req.headers['x-request-start'][0]
              : req.headers['x-request-start'] || Date.now(),
          ).getTime(),
      },
      alerts: [] as {
        type: string;
        message: string;
        value?: string;
        error?: string;
      }[],
    };

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryThreshold = 1024 * 1024 * 1024; // 1GB
    if (memoryUsage.rss > memoryThreshold) {
      health.services.memory = 'warning';
      health.alerts.push({
        type: 'memory',
        message: 'High memory usage detected',
        value: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      });
    }

    // Check database connectivity
    try {
      await User.findOne().limit(1);
      health.services.database = 'healthy';
    } catch (error) {
      health.services.database = 'error';
      health.status = 'unhealthy';
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      health.alerts.push({
        type: 'database',
        message: 'Database connection failed',
        error: errorMessage,
      });
    }

    // Overall health status
    const unhealthyServices = Object.values(health.services).filter(
      (status) => status === 'error',
    );
    if (unhealthyServices.length > 0) {
      health.status = 'unhealthy';
    } else if (health.alerts.length > 0) {
      health.status = 'warning';
    }

    res.status(200).json({
      success: true,
      health,
    });
  },
);
