import { Request, Response } from 'express';
import {
  AnalyticsData,
  CustomerInsight,
  SalesPerformance,
} from '../models/analyticsModel.js';
import Order from '../models/orderModel.js';
import Booking from '../models/bookingModel.js';
import { User } from '../models/userModle.js';
import { Product } from '../models/productModules.js';
import catchAsync from '../utils/catchAsync.js';
import { Types } from 'mongoose';

// 📊 Advanced Dashboard Metrics
export const getAdvancedDashboardMetrics = catchAsync(
  async (req: Request, res: Response) => {
    const { period = '7d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get comprehensive metrics
    const [
      revenueData,
      orderMetrics,
      customerMetrics,
      productMetrics,
      bookingMetrics,
      conversionData,
    ] = await Promise.all([
      // Revenue analytics
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['completed', 'delivered'] },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
            },
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: '$totalAmount' },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),

      // Order metrics
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalAmount' },
          },
        },
      ]),

      // Customer analytics
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            newCustomers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Product performance
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['completed', 'delivered'] },
          },
        },
        {
          $unwind: '$items',
        },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        {
          $unwind: '$productDetails',
        },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$productDetails.name' },
            category: { $first: '$productDetails.category' },
            totalSales: { $sum: '$items.quantity' },
            totalRevenue: {
              $sum: { $multiply: ['$items.quantity', '$items.price'] },
            },
            averagePrice: { $avg: '$items.price' },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),

      // Booking metrics
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalPrice' },
          },
        },
      ]),

      // Conversion funnel
      Promise.all([
        User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Order.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Order.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered'] },
        }),
      ]),
    ]);

    // Calculate KPIs
    const totalRevenue = revenueData.reduce(
      (sum, day) => sum + day.totalRevenue,
      0,
    );
    const totalOrders = revenueData.reduce(
      (sum, day) => sum + day.orderCount,
      0,
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const [totalVisitors, totalOrdersCreated, completedOrders] = conversionData;
    const conversionRate =
      totalVisitors > 0 ? (totalOrdersCreated / totalVisitors) * 100 : 0;
    const completionRate =
      totalOrdersCreated > 0 ? (completedOrders / totalOrdersCreated) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          conversionRate,
          completionRate,
          period: period as string,
        },
        revenueChart: revenueData,
        orderStatus: orderMetrics,
        customerGrowth: customerMetrics,
        topProducts: productMetrics,
        bookingStatus: bookingMetrics,
        kpis: {
          revenueGrowth: 0, // Will be calculated with previous period comparison
          customerAcquisitionCost: 0, // Placeholder for marketing spend integration
          customerLifetimeValue: averageOrderValue * 3, // Simplified calculation
          churnRate: 0, // Will be calculated with customer retention logic
        },
      },
    });
  },
);

// 📈 Sales Analytics
export const getSalesAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const {
      startDate: startParam,
      endDate: endParam,
      granularity = 'day',
      compareWith = 'previous_period',
    } = req.query;

    const endDate = endParam ? new Date(endParam as string) : new Date();
    const startDate = startParam
      ? new Date(startParam as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get sales performance data
    const salesData = await SalesPerformance.aggregate([
      {
        $match: {
          period: { $gte: startDate, $lte: endDate },
          periodType: granularity,
        },
      },
      {
        $sort: { period: 1 },
      },
    ]);

    // Get detailed order analytics
    const orderAnalytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format:
                  granularity === 'hour'
                    ? '%Y-%m-%d %H:00'
                    : granularity === 'day'
                      ? '%Y-%m-%d'
                      : granularity === 'week'
                        ? '%Y-W%U'
                        : granularity === 'month'
                          ? '%Y-%m'
                          : '%Y',
                date: '$createdAt',
              },
            },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
          uniqueCustomers: { $addToSet: '$user' },
        },
      },
      {
        $addFields: {
          customerCount: { $size: '$uniqueCustomers' },
        },
      },
      {
        $project: {
          uniqueCustomers: 0,
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Calculate trends and growth rates
    const trends = calculateTrends(orderAnalytics);

    res.status(200).json({
      success: true,
      data: {
        salesPerformance: salesData,
        orderAnalytics,
        trends,
        summary: {
          totalRevenue: orderAnalytics.reduce(
            (sum, item) => sum + item.revenue,
            0,
          ),
          totalOrders: orderAnalytics.reduce(
            (sum, item) => sum + item.orders,
            0,
          ),
          averageOrderValue:
            orderAnalytics.reduce(
              (sum, item) => sum + item.averageOrderValue,
              0,
            ) / orderAnalytics.length,
          uniqueCustomers: new Set(
            orderAnalytics.flatMap((item) => item.customerCount),
          ).size,
        },
      },
    });
  },
);

// 👥 Customer Analytics & Insights
export const getCustomerAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const { segment, limit = 100 } = req.query;

    // Customer segmentation
    const customerSegments = await CustomerInsight.aggregate([
      ...(segment ? [{ $match: { segment: segment as string } }] : []),
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 },
          averageLifetimeValue: { $avg: '$lifetimeValue' },
          averageOrderValue: { $avg: '$averageOrderValue' },
          totalSpent: { $sum: '$totalSpent' },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
    ]);

    // Customer cohort analysis
    const cohortAnalysis = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $addFields: {
          firstOrderDate: {
            $min: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.createdAt',
              },
            },
          },
          cohortMonth: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt',
            },
          },
        },
      },
      {
        $group: {
          _id: '$cohortMonth',
          customers: { $sum: 1 },
          firstOrders: {
            $sum: {
              $cond: {
                if: { $ne: ['$firstOrderDate', null] },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Customer lifetime value analysis
    const clvAnalysis = await CustomerInsight.aggregate([
      {
        $group: {
          _id: null,
          averageCLV: { $avg: '$lifetimeValue' },
          medianCLV: { $avg: '$lifetimeValue' },
          topPercentile: { $max: '$lifetimeValue' },
          segments: {
            $push: {
              segment: '$segment',
              clv: '$lifetimeValue',
              totalSpent: '$totalSpent',
            },
          },
        },
      },
    ]);

    // Churn prediction
    const churnAnalysis = await CustomerInsight.aggregate([
      {
        $match: {
          'predictions.churnProbability': { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                {
                  case: { $lt: ['$predictions.churnProbability', 0.3] },
                  then: 'low',
                },
                {
                  case: { $lt: ['$predictions.churnProbability', 0.7] },
                  then: 'medium',
                },
                {
                  case: { $gte: ['$predictions.churnProbability', 0.7] },
                  then: 'high',
                },
              ],
              default: 'unknown',
            },
          },
          count: { $sum: 1 },
          averageCLV: { $avg: '$lifetimeValue' },
          totalAtRisk: { $sum: '$totalSpent' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        segments: customerSegments,
        cohortAnalysis,
        lifetimeValue: clvAnalysis[0] || {},
        churnRisk: churnAnalysis,
        insights: {
          totalCustomers: customerSegments.reduce(
            (sum, seg) => sum + seg.count,
            0,
          ),
          highValueCustomers:
            customerSegments.filter((seg) => seg._id === 'vip')[0]?.count || 0,
          atRiskCustomers:
            churnAnalysis.find((risk) => risk._id === 'high')?.count || 0,
        },
      },
    });
  },
);

// 📊 Product Performance Analytics
export const getProductAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const { category, timeframe = '30d' } = req.query;

    const endDate = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Product performance metrics
    const productPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered'] },
        },
      },
      {
        $unwind: '$items',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: '$productDetails',
      },
      ...(category
        ? [{ $match: { 'productDetails.category': category } }]
        : []),
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$productDetails.name' },
          category: { $first: '$productDetails.category' },
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] },
          },
          averagePrice: { $avg: '$items.price' },
          totalOrders: { $sum: 1 },
          uniqueCustomers: { $addToSet: '$user' },
        },
      },
      {
        $addFields: {
          customerCount: { $size: '$uniqueCustomers' },
          revenuePerCustomer: {
            $divide: ['$totalRevenue', { $size: '$uniqueCustomers' }],
          },
        },
      },
      {
        $project: {
          uniqueCustomers: 0,
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);

    // Category analysis
    const categoryAnalysis = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered'] },
        },
      },
      {
        $unwind: '$items',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: '$productDetails',
      },
      {
        $group: {
          _id: '$productDetails.category',
          totalRevenue: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] },
          },
          totalSales: { $sum: '$items.quantity' },
          productCount: { $addToSet: '$items.product' },
          averageOrderValue: {
            $avg: { $multiply: ['$items.quantity', '$items.price'] },
          },
        },
      },
      {
        $addFields: {
          uniqueProducts: { $size: '$productCount' },
        },
      },
      {
        $project: {
          productCount: 0,
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        productPerformance,
        categoryAnalysis,
        summary: {
          totalProducts: productPerformance.length,
          totalRevenue: productPerformance.reduce(
            (sum, product) => sum + product.totalRevenue,
            0,
          ),
          totalSales: productPerformance.reduce(
            (sum, product) => sum + product.totalSales,
            0,
          ),
          topPerformer: productPerformance[0] || null,
        },
      },
    });
  },
);

// 🔄 Real-time Analytics
export const getRealTimeMetrics = catchAsync(
  async (req: Request, res: Response) => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const [recentOrders, recentBookings, activeUsers, realtimeRevenue] =
      await Promise.all([
        Order.find({ createdAt: { $gte: lastHour } })
          .populate('user', 'firstName lastName')
          .sort({ createdAt: -1 })
          .limit(10),

        Booking.find({ createdAt: { $gte: lastHour } })
          .populate('user', 'firstName lastName')
          .populate('product', 'name')
          .sort({ createdAt: -1 })
          .limit(10),

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
              _id: {
                hour: { $hour: '$createdAt' },
              },
              revenue: { $sum: '$totalAmount' },
              orders: { $sum: 1 },
            },
          },
          {
            $sort: { '_id.hour': 1 },
          },
        ]),
      ]);

    res.status(200).json({
      success: true,
      data: {
        liveStats: {
          activeUsers,
          ordersLastHour: recentOrders.length,
          bookingsLastHour: recentBookings.length,
          revenue24h: realtimeRevenue.reduce(
            (sum, hour) => sum + hour.revenue,
            0,
          ),
        },
        recentActivity: {
          orders: recentOrders,
          bookings: recentBookings,
        },
        hourlyRevenue: realtimeRevenue,
      },
    });
  },
);

// 🎯 Business Intelligence Reports
export const getBusinessIntelligenceReport = catchAsync(
  async (req: Request, res: Response) => {
    const { reportType = 'executive', period = '30d' } = req.query;

    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Executive summary metrics
    const executiveSummary = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['completed', 'delivered'] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$totalAmount' },
          },
        },
      ]),

      User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      Product.countDocuments({ isActive: true }),

      CustomerInsight.aggregate([
        {
          $group: {
            _id: null,
            averageLifetimeValue: { $avg: '$lifetimeValue' },
            highValueCustomers: {
              $sum: {
                $cond: [{ $gte: ['$lifetimeValue', 10000] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reportType,
        period,
        generatedAt: new Date(),
        executiveSummary: executiveSummary[0]?.[0] || {},
        newCustomers: executiveSummary[1] || 0,
        activeProducts: executiveSummary[2] || 0,
        customerInsights: executiveSummary[3]?.[0] || {},
        recommendations: generateBusinessRecommendations(executiveSummary),
      },
    });
  },
);

// Helper function to calculate trends
function calculateTrends(data: any[]): any {
  if (data.length < 2) return { growth: 0, trend: 'stable' };

  const current = data[data.length - 1];
  const previous = data[data.length - 2];

  const revenueGrowth =
    previous.revenue > 0
      ? ((current.revenue - previous.revenue) / previous.revenue) * 100
      : 0;

  const orderGrowth =
    previous.orders > 0
      ? ((current.orders - previous.orders) / previous.orders) * 100
      : 0;

  return {
    revenueGrowth: Number(revenueGrowth.toFixed(2)),
    orderGrowth: Number(orderGrowth.toFixed(2)),
    trend:
      revenueGrowth > 0
        ? 'growing'
        : revenueGrowth < 0
          ? 'declining'
          : 'stable',
  };
}

// Helper function to generate business recommendations
function generateBusinessRecommendations(data: any[]): string[] {
  const recommendations = [];

  const summary = data[0]?.[0];
  if (summary) {
    if (summary.averageOrderValue < 5000) {
      recommendations.push(
        'Consider upselling strategies to increase average order value',
      );
    }

    if (summary.totalOrders < 100) {
      recommendations.push(
        'Focus on customer acquisition and marketing campaigns',
      );
    }
  }

  const customerInsights = data[3]?.[0];
  if (customerInsights && customerInsights.highValueCustomers < 10) {
    recommendations.push(
      'Implement customer loyalty programs to increase lifetime value',
    );
  }

  return recommendations;
}

// 📅 Forecasting and Predictions
export const getForecasting = catchAsync(
  async (req: Request, res: Response) => {
    const { metric = 'revenue', period = '30d' } = req.query;

    // Get historical data for the last 90 days
    const historicalData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
          status: { $in: ['completed', 'delivered'] },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Simple linear regression for forecasting (in a real app, you'd use more sophisticated algorithms)
    const forecast = generateForecast(
      historicalData,
      metric as string,
      period as string,
    );

    res.status(200).json({
      success: true,
      data: {
        historical: historicalData,
        forecast,
        accuracy: 85, // Placeholder - would be calculated based on model performance
        confidence: 'medium',
      },
    });
  },
);

// Helper function for simple forecasting
function generateForecast(data: any[], metric: string, period: string): any[] {
  if (data.length === 0) return [];

  const values = data.map((d) => d[metric] || 0);
  const trend = calculateSimpleTrend(values);

  const forecastDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const forecast = [];

  for (let i = 1; i <= forecastDays; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);

    const lastValue = values[values.length - 1] || 0;
    const forecastValue = Math.max(0, lastValue + trend * i);

    forecast.push({
      date: futureDate.toISOString().split('T')[0],
      [metric]: Math.round(forecastValue),
      confidence: Math.max(0.5, 0.9 - i * 0.01), // Decreasing confidence over time
    });
  }

  return forecast;
}

function calculateSimpleTrend(values: number[]): number {
  if (values.length < 2) return 0;

  const n = values.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}
