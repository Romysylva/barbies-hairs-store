import { Types } from 'mongoose';
import Order from '../models/orderModel.js';
import Booking from '../models/bookingModel.js';
import { User } from '../models/userModle.js';
import { Product } from '../models/productModules.js';
import { AnalyticsData, CustomerInsight, SalesPerformance } from '../models/analyticsModel.js';

export interface MetricCalculationOptions {
  startDate: Date;
  endDate: Date;
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  filters?: Record<string, any>;
}

export class AnalyticsService {
  // 📊 Core KPI Calculations
  static async calculateKPIs(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;

    const [
      revenue,
      orders,
      customers,
      averageOrderValue,
      conversionData,
      customerAcquisition,
      churnData
    ] = await Promise.all([
      this.calculateRevenue(options),
      this.calculateOrderMetrics(options),
      this.calculateCustomerMetrics(options),
      this.calculateAverageOrderValue(options),
      this.calculateConversionMetrics(options),
      this.calculateCustomerAcquisitionCost(options),
      this.calculateChurnRate(options)
    ]);

    return {
      revenue,
      orders,
      customers,
      averageOrderValue,
      conversionRate: conversionData.rate,
      customerAcquisitionCost: customerAcquisition,
      churnRate: churnData.rate,
      customerLifetimeValue: await this.calculateCustomerLifetimeValue(options),
      period: { startDate, endDate }
    };
  }

  // 💰 Revenue Calculations
  static async calculateRevenue(options: MetricCalculationOptions): Promise<any> {
    const { startDate, endDate, granularity = 'day' } = options;

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: this.getDateGrouping(granularity),
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 as 1 } }
    ];

    const results = await Order.aggregate(pipeline);
    const totalRevenue = results.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalOrders = results.reduce((sum, item) => sum + item.orderCount, 0);

    return {
      total: totalRevenue,
      breakdown: results,
      growth: await this.calculateGrowthRate(totalRevenue, options),
      averagePerPeriod: results.length > 0 ? totalRevenue / results.length : 0
    };
  }

  // 📈 Order Metrics
  static async calculateOrderMetrics(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;

    const [statusBreakdown, orderTrends, fulfillmentMetrics] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalAmount' },
            averageValue: { $avg: '$totalAmount' }
          }
        }
      ]),

      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),

      this.calculateFulfillmentMetrics(options)
    ]);

    return {
      statusBreakdown,
      trends: orderTrends,
      fulfillment: fulfillmentMetrics,
      total: statusBreakdown.reduce((sum, status) => sum + status.count, 0)
    };
  }

  // 👥 Customer Analytics
  static async calculateCustomerMetrics(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;

    const [
      newCustomers,
      activeCustomers,
      customerSegmentation,
      cohortData
    ] = await Promise.all([
      User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),

      this.calculateActiveCustomers(options),
      this.calculateCustomerSegmentation(options),
      this.calculateCohortAnalysis(options)
    ]);

    return {
      new: newCustomers,
      active: activeCustomers,
      segmentation: customerSegmentation,
      cohorts: cohortData,
      retention: await this.calculateRetentionRate(options)
    };
  }

  // 🎯 Conversion Metrics
  static async calculateConversionMetrics(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;

    const [visitors, orders, completedOrders] = await Promise.all([
      User.countDocuments({
        lastActive: { $gte: startDate, $lte: endDate }
      }),
      Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['completed', 'delivered'] }
      })
    ]);

    const conversionRate = visitors > 0 ? (orders / visitors) * 100 : 0;
    const completionRate = orders > 0 ? (completedOrders / orders) * 100 : 0;

    return {
      rate: conversionRate,
      completionRate,
      funnel: {
        visitors,
        orders,
        completed: completedOrders
      }
    };
  }

  // 💎 Customer Lifetime Value
  static async calculateCustomerLifetimeValue(options: MetricCalculationOptions) {
    const clvData = await CustomerInsight.aggregate([
      {
        $group: {
          _id: null,
          averageCLV: { $avg: '$lifetimeValue' },
          values: { $push: '$lifetimeValue' },
          totalCustomers: { $sum: 1 },
          totalValue: { $sum: '$totalSpent' }
        }
      },
      {
        $addFields: {
          sortedValues: {
            $sortArray: {
              input: '$values',
              sortBy: 1
            }
          }
        }
      },
      {
        $addFields: {
          medianCLV: {
            $cond: {
              if: { $eq: [{ $mod: ['$totalCustomers', 2] }, 0] },
              then: {
                $avg: [
                  { $arrayElemAt: ['$sortedValues', { $subtract: [{ $divide: ['$totalCustomers', 2] }, 1] }] },
                  { $arrayElemAt: ['$sortedValues', { $divide: ['$totalCustomers', 2] }] }
                ]
              },
              else: {
                $arrayElemAt: ['$sortedValues', { $floor: { $divide: ['$totalCustomers', 2] } }]
              }
            }
          }
        }
      }
    ]);

    return clvData[0] || {
      averageCLV: 0,
      medianCLV: 0,
      totalCustomers: 0,
      totalValue: 0
    };
  }

  // 🔄 Churn Rate Calculation
  static async calculateChurnRate(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;
    
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
    
    const [currentPeriodCustomers, previousPeriodCustomers, lostCustomers] = await Promise.all([
      User.countDocuments({
        lastActive: { $gte: startDate, $lte: endDate }
      }),
      
      User.countDocuments({
        lastActive: { $gte: previousPeriodStart, $lte: startDate }
      }),
      
      User.countDocuments({
        lastActive: { $lt: startDate },
        createdAt: { $lte: startDate }
      })
    ]);

    const churnRate = previousPeriodCustomers > 0 ? 
      (lostCustomers / previousPeriodCustomers) * 100 : 0;

    return {
      rate: churnRate,
      lostCustomers,
      retainedCustomers: currentPeriodCustomers,
      previousPeriodCustomers
    };
  }

  // 📊 Customer Acquisition Cost
  static async calculateCustomerAcquisitionCost(options: MetricCalculationOptions) {
    // Placeholder - would integrate with marketing spend data
    const { startDate, endDate } = options;
    
    const newCustomers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Mock marketing spend - in real implementation, this would come from marketing data
    const mockMarketingSpend = 10000; 
    
    return newCustomers > 0 ? mockMarketingSpend / newCustomers : 0;
  }

  // 🔍 Product Performance Analytics
  static async calculateProductPerformance(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;

    const productMetrics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$productDetails.name' },
          category: { $first: '$productDetails.category' },
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          averagePrice: { $avg: '$items.price' },
          uniqueCustomers: { $addToSet: '$user' }
        }
      },
      {
        $addFields: {
          customerCount: { $size: '$uniqueCustomers' },
          revenuePerSale: { $divide: ['$totalRevenue', '$totalSales'] }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    return productMetrics;
  }

  // 🎭 Customer Segmentation
  static async calculateCustomerSegmentation(options: MetricCalculationOptions) {
    const segments = await CustomerInsight.aggregate([
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 },
          averageLifetimeValue: { $avg: '$lifetimeValue' },
          averageOrderValue: { $avg: '$averageOrderValue' },
          totalSpent: { $sum: '$totalSpent' }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    return segments;
  }

  // 📊 Cohort Analysis
  static async calculateCohortAnalysis(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;

    const cohortData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          cohortMonth: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          orderMonths: {
            $map: {
              input: '$orders',
              as: 'order',
              in: {
                $dateToString: { format: '%Y-%m', date: '$$order.createdAt' }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$cohortMonth',
          totalCustomers: { $sum: 1 },
          customers: {
            $push: {
              customerId: '$_id',
              orderMonths: '$orderMonths'
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return cohortData;
  }

  // ⚡ Real-time Metrics
  static async getRealTimeMetrics() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      recentOrders,
      activeUsers,
      hourlyRevenue,
      liveBookings
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: lastHour } }),
      
      User.countDocuments({
        lastActive: { $gte: new Date(now.getTime() - 15 * 60 * 1000) }
      }),
      
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: last24Hours },
            status: { $in: ['completed', 'delivered'] }
          }
        },
        {
          $group: {
            _id: { hour: { $hour: '$createdAt' } },
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      Booking.countDocuments({ createdAt: { $gte: lastHour } })
    ]);

    return {
      ordersLastHour: recentOrders,
      activeUsers,
      bookingsLastHour: liveBookings,
      hourlyRevenue: hourlyRevenue.reduce((sum, h) => sum + h.revenue, 0),
      timestamp: now
    };
  }

  // 📈 Predictive Analytics
  static async generatePredictions(metric: string, historicalData: any[], days: number = 30) {
    if (!historicalData || historicalData.length < 2) {
      return [];
    }

    const values = historicalData.map(d => d[metric] || 0);
    const predictions = [];

    // Simple moving average prediction
    const windowSize = Math.min(7, values.length);
    const recentAverage = values.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize;

    // Calculate trend
    const trend = this.calculateLinearTrend(values);

    for (let i = 1; i <= days; i++) {
      const predictedValue = Math.max(0, recentAverage + (trend * i));
      const confidence = Math.max(0.3, 0.95 - (i * 0.02)); // Decreasing confidence

      predictions.push({
        day: i,
        value: Math.round(predictedValue),
        confidence: parseFloat(confidence.toFixed(2))
      });
    }

    return predictions;
  }

  // 🔧 Helper Methods
  private static getDateGrouping(granularity: string) {
    switch (granularity) {
      case 'hour':
        return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
      case 'day':
        return { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      case 'week':
        return { $dateToString: { format: '%Y-W%U', date: '$createdAt' } };
      case 'month':
        return { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      case 'quarter':
        return {
          year: { $year: '$createdAt' },
          quarter: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } }
        };
      case 'year':
        return { $year: '$createdAt' };
      default:
        return { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }
  }

  private static async calculateGrowthRate(currentValue: number, options: MetricCalculationOptions): Promise<number> {
    const { startDate, endDate } = options;
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStart = new Date(startDate.getTime() - periodDuration);
    const previousEnd = startDate;

    const previousValue: any = await this.calculateRevenue({
      ...options,
      startDate: previousStart,
      endDate: previousEnd
    });

    if (previousValue.total > 0) {
      return ((currentValue - previousValue.total) / previousValue.total) * 100;
    }

    return 0;
  }

  private static async calculateActiveCustomers(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;
    
    return await Order.distinct('user', {
      createdAt: { $gte: startDate, $lte: endDate }
    }).then(users => users.length);
  }

  private static async calculateRetentionRate(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;
    
    // Simplified retention calculation
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
    
    const [previousCustomers, currentCustomers, retainedCustomers] = await Promise.all([
      Order.distinct('user', {
        createdAt: { $gte: previousPeriodStart, $lt: startDate }
      }),
      
      Order.distinct('user', {
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: previousPeriodStart, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$user',
            orders: { $push: '$createdAt' }
          }
        },
        {
          $match: {
            'orders.1': { $exists: true } // At least 2 orders
          }
        }
      ])
    ]);

    const retentionRate = previousCustomers.length > 0 ? 
      (retainedCustomers.length / previousCustomers.length) * 100 : 0;

    return retentionRate;
  }

  private static calculateLinearTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private static async calculateFulfillmentMetrics(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;

    const fulfillmentData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'pending' }
        }
      },
      {
        $addFields: {
          fulfillmentTime: {
            $subtract: ['$updatedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          averageFulfillmentTime: { $avg: '$fulfillmentTime' },
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: {
              $cond: [
                { $in: ['$status', ['completed', 'delivered']] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const data = fulfillmentData[0] || {
      averageFulfillmentTime: 0,
      totalOrders: 0,
      completedOrders: 0
    };

    return {
      ...data,
      fulfillmentRate: data.totalOrders > 0 ? (data.completedOrders / data.totalOrders) * 100 : 0,
      averageFulfillmentDays: data.averageFulfillmentTime / (1000 * 60 * 60 * 24) // Convert ms to days
    };
  }

  private static calculateAverageOrderValue(options: MetricCalculationOptions) {
    const { startDate, endDate } = options;

    return Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          averageOrderValue: { $avg: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]).then(result => result[0]?.averageOrderValue || 0);
  }
}
