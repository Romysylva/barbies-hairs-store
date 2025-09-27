import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnalyticsData extends Document {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  period: Date;
  metrics: {
    revenue: number;
    orders: number;
    bookings: number;
    newCustomers: number;
    activeCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    cancelationRate: number;
    topProducts: Array<{
      productId: Types.ObjectId;
      name: string;
      sales: number;
      revenue: number;
    }>;
    customerSegments: {
      newCustomers: number;
      returningCustomers: number;
      vipCustomers: number;
    };
    geographicData: Array<{
      location: string;
      orders: number;
      revenue: number;
    }>;
    paymentMethods: Array<{
      method: string;
      count: number;
      percentage: number;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsDataSchema = new Schema<IAnalyticsData>(
  {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
    },
    period: {
      type: Date,
      required: true,
    },
    metrics: {
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      bookings: { type: Number, default: 0 },
      newCustomers: { type: Number, default: 0 },
      activeCustomers: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      cancelationRate: { type: Number, default: 0 },
      topProducts: [
        {
          productId: { type: Schema.Types.ObjectId, ref: 'Product' },
          name: String,
          sales: Number,
          revenue: Number,
        },
      ],
      customerSegments: {
        newCustomers: { type: Number, default: 0 },
        returningCustomers: { type: Number, default: 0 },
        vipCustomers: { type: Number, default: 0 },
      },
      geographicData: [
        {
          location: String,
          orders: Number,
          revenue: Number,
        },
      ],
      paymentMethods: [
        {
          method: String,
          count: Number,
          percentage: Number,
        },
      ],
    },
  },
  { timestamps: true }
);

// Compound index for efficient querying
AnalyticsDataSchema.index({ type: 1, period: -1 });
AnalyticsDataSchema.index({ period: -1 });

export const AnalyticsData = mongoose.model<IAnalyticsData>(
  'AnalyticsData',
  AnalyticsDataSchema
);

// Customer insights model
export interface ICustomerInsight extends Document {
  customerId: Types.ObjectId;
  segment: 'new' | 'regular' | 'vip' | 'inactive' | 'at_risk';
  lifetimeValue: number;
  averageOrderValue: number;
  orderFrequency: number;
  lastOrderDate: Date;
  totalOrders: number;
  totalSpent: number;
  preferredCategories: Array<{
    categoryId: Types.ObjectId;
    categoryName: string;
    purchaseCount: number;
  }>;
  riskScore: number;
  predictions: {
    churnProbability: number;
    nextPurchaseDate: Date;
    recommendedProducts: Types.ObjectId[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const CustomerInsightSchema = new Schema<ICustomerInsight>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    segment: {
      type: String,
      enum: ['new', 'regular', 'vip', 'inactive', 'at_risk'],
      default: 'new',
    },
    lifetimeValue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    orderFrequency: { type: Number, default: 0 },
    lastOrderDate: Date,
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    preferredCategories: [
      {
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
        categoryName: String,
        purchaseCount: Number,
      },
    ],
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    predictions: {
      churnProbability: { type: Number, default: 0, min: 0, max: 1 },
      nextPurchaseDate: Date,
      recommendedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    },
  },
  { timestamps: true }
);

CustomerInsightSchema.index({ customerId: 1 });
CustomerInsightSchema.index({ segment: 1 });
CustomerInsightSchema.index({ lifetimeValue: -1 });

export const CustomerInsight = mongoose.model<ICustomerInsight>(
  'CustomerInsight',
  CustomerInsightSchema
);

// Sales performance model
export interface ISalesPerformance extends Document {
  period: Date;
  periodType: 'day' | 'week' | 'month' | 'quarter' | 'year';
  salesData: {
    totalRevenue: number;
    totalOrders: number;
    totalBookings: number;
    averageOrderValue: number;
    growth: {
      revenueGrowth: number;
      orderGrowth: number;
      customerGrowth: number;
    };
    targets: {
      revenueTarget: number;
      orderTarget: number;
      achievementRate: number;
    };
  };
  productPerformance: Array<{
    productId: Types.ObjectId;
    name: string;
    category: string;
    sales: number;
    revenue: number;
    margin: number;
    growth: number;
  }>;
  channelPerformance: Array<{
    channel: string;
    orders: number;
    revenue: number;
    conversionRate: number;
  }>;
}

const SalesPerformanceSchema = new Schema<ISalesPerformance>(
  {
    period: { type: Date, required: true },
    periodType: {
      type: String,
      enum: ['day', 'week', 'month', 'quarter', 'year'],
      required: true,
    },
    salesData: {
      totalRevenue: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
      growth: {
        revenueGrowth: { type: Number, default: 0 },
        orderGrowth: { type: Number, default: 0 },
        customerGrowth: { type: Number, default: 0 },
      },
      targets: {
        revenueTarget: { type: Number, default: 0 },
        orderTarget: { type: Number, default: 0 },
        achievementRate: { type: Number, default: 0 },
      },
    },
    productPerformance: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        category: String,
        sales: Number,
        revenue: Number,
        margin: Number,
        growth: Number,
      },
    ],
    channelPerformance: [
      {
        channel: String,
        orders: Number,
        revenue: Number,
        conversionRate: Number,
      },
    ],
  },
  { timestamps: true }
);

SalesPerformanceSchema.index({ period: -1, periodType: 1 });

export const SalesPerformance = mongoose.model<ISalesPerformance>(
  'SalesPerformance',
  SalesPerformanceSchema
);

// Business Intelligence Reports Model
export interface IBusinessReport extends Document {
  reportId: string;
  reportType: 'executive' | 'sales' | 'customer' | 'product' | 'financial' | 'operational';
  title: string;
  description?: string;
  parameters: {
    startDate: Date;
    endDate: Date;
    filters?: Record<string, any>;
    granularity?: string;
  };
  data: {
    summary: Record<string, any>;
    charts: Array<{
      type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
      title: string;
      data: any[];
      config?: Record<string, any>;
    }>;
    tables: Array<{
      title: string;
      headers: string[];
      rows: any[][];
    }>;
    insights: string[];
    recommendations: string[];
  };
  status: 'generating' | 'completed' | 'failed';
  generatedBy: Types.ObjectId;
  generatedAt: Date;
  expiresAt?: Date;
  isScheduled: boolean;
  scheduleConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    hour: number;
    recipients: string[];
  };
}

const BusinessReportSchema = new Schema<IBusinessReport>(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      default: () => `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    reportType: {
      type: String,
      enum: ['executive', 'sales', 'customer', 'product', 'financial', 'operational'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    parameters: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      filters: { type: Schema.Types.Mixed },
      granularity: { type: String, default: 'day' }
    },
    data: {
      summary: { type: Schema.Types.Mixed, default: {} },
      charts: [{
        type: {
          type: String,
          enum: ['line', 'bar', 'pie', 'area', 'scatter'],
          required: true
        },
        title: { type: String, required: true },
        data: [{ type: Schema.Types.Mixed }],
        config: { type: Schema.Types.Mixed }
      }],
      tables: [{
        title: String,
        headers: [String],
        rows: [[Schema.Types.Mixed]]
      }],
      insights: [String],
      recommendations: [String]
    },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating'
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    isScheduled: {
      type: Boolean,
      default: false
    },
    scheduleConfig: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly']
      },
      dayOfWeek: Number,
      dayOfMonth: Number,
      hour: { type: Number, default: 9 },
      recipients: [String]
    }
  },
  { timestamps: true }
);

BusinessReportSchema.index({ reportType: 1, generatedAt: -1 });
BusinessReportSchema.index({ generatedBy: 1, createdAt: -1 });
BusinessReportSchema.index({ isScheduled: 1, 'scheduleConfig.frequency': 1 });

export const BusinessReport = mongoose.model<IBusinessReport>(
  'BusinessReport',
  BusinessReportSchema
);

// KPI Tracking Model
export interface IKPIMetric extends Document {
  name: string;
  category: 'revenue' | 'customer' | 'product' | 'operational' | 'marketing';
  description?: string;
  calculation: {
    formula: string;
    dependencies: string[];
    aggregationType: 'sum' | 'avg' | 'count' | 'ratio' | 'custom';
  };
  targets: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    quarterly?: number;
    yearly?: number;
  };
  currentValue: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  lastCalculated: Date;
  isActive: boolean;
  alertThresholds: {
    critical: { min?: number; max?: number };
    warning: { min?: number; max?: number };
  };
  historicalData: Array<{
    date: Date;
    value: number;
    period: string;
  }>;
}

const KPIMetricSchema = new Schema<IKPIMetric>(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: String,
      enum: ['revenue', 'customer', 'product', 'operational', 'marketing'],
      required: true
    },
    description: String,
    calculation: {
      formula: { type: String, required: true },
      dependencies: [String],
      aggregationType: {
        type: String,
        enum: ['sum', 'avg', 'count', 'ratio', 'custom'],
        required: true
      }
    },
    targets: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      quarterly: Number,
      yearly: Number
    },
    currentValue: {
      type: Number,
      default: 0
    },
    previousValue: {
      type: Number,
      default: 0
    },
    trend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'stable'
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    alertThresholds: {
      critical: {
        min: Number,
        max: Number
      },
      warning: {
        min: Number,
        max: Number
      }
    },
    historicalData: [{
      date: { type: Date, required: true },
      value: { type: Number, required: true },
      period: { type: String, required: true }
    }]
  },
  { timestamps: true }
);

KPIMetricSchema.index({ category: 1, isActive: 1 });
KPIMetricSchema.index({ lastCalculated: -1 });

export const KPIMetric = mongoose.model<IKPIMetric>(
  'KPIMetric',
  KPIMetricSchema
);

// Forecasting Model
export interface IForecast extends Document {
  metric: string;
  forecastType: 'revenue' | 'orders' | 'customers' | 'growth' | 'churn';
  period: {
    start: Date;
    end: Date;
    granularity: 'day' | 'week' | 'month' | 'quarter';
  };
  algorithm: 'linear' | 'exponential' | 'seasonal' | 'arima' | 'ml_model';
  historicalData: Array<{
    date: Date;
    value: number;
  }>;
  predictions: Array<{
    date: Date;
    predictedValue: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
  }>;
  accuracy: {
    mae: number; // Mean Absolute Error
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
  };
  parameters: Record<string, any>;
  status: 'training' | 'completed' | 'failed';
  generatedAt: Date;
  validUntil: Date;
}

const ForecastSchema = new Schema<IForecast>(
  {
    metric: {
      type: String,
      required: true
    },
    forecastType: {
      type: String,
      enum: ['revenue', 'orders', 'customers', 'growth', 'churn'],
      required: true
    },
    period: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      granularity: {
        type: String,
        enum: ['day', 'week', 'month', 'quarter'],
        required: true
      }
    },
    algorithm: {
      type: String,
      enum: ['linear', 'exponential', 'seasonal', 'arima', 'ml_model'],
      default: 'linear'
    },
    historicalData: [{
      date: { type: Date, required: true },
      value: { type: Number, required: true }
    }],
    predictions: [{
      date: { type: Date, required: true },
      predictedValue: { type: Number, required: true },
      confidence: { type: Number, required: true, min: 0, max: 1 },
      upperBound: Number,
      lowerBound: Number
    }],
    accuracy: {
      mae: { type: Number, default: 0 },
      mape: { type: Number, default: 0 },
      rmse: { type: Number, default: 0 }
    },
    parameters: {
      type: Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ['training', 'completed', 'failed'],
      default: 'training'
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

ForecastSchema.index({ metric: 1, forecastType: 1 });
ForecastSchema.index({ generatedAt: -1 });
ForecastSchema.index({ validUntil: 1 });

export const Forecast = mongoose.model<IForecast>(
  'Forecast',
  ForecastSchema
);

// Real-time Analytics Events Model
export interface IAnalyticsEvent extends Document {
  eventType: 'order_placed' | 'user_registered' | 'product_viewed' | 'booking_created' | 'payment_completed' | 'custom';
  eventName: string;
  userId?: Types.ObjectId;
  sessionId?: string;
  data: Record<string, any>;
  metadata: {
    source: string;
    version: string;
    timestamp: Date;
    userAgent?: string;
    ipAddress?: string;
  };
  processed: boolean;
  processedAt?: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    eventType: {
      type: String,
      enum: ['order_placed', 'user_registered', 'product_viewed', 'booking_created', 'payment_completed', 'custom'],
      required: true
    },
    eventName: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    sessionId: String,
    data: {
      type: Schema.Types.Mixed,
      required: true
    },
    metadata: {
      source: { type: String, required: true },
      version: { type: String, default: '1.0' },
      timestamp: { type: Date, default: Date.now },
      userAgent: String,
      ipAddress: String
    },
    processed: {
      type: Boolean,
      default: false
    },
    processedAt: Date
  },
  { timestamps: true }
);

AnalyticsEventSchema.index({ eventType: 1, createdAt: -1 });
AnalyticsEventSchema.index({ userId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ processed: 1, createdAt: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>(
  'AnalyticsEvent',
  AnalyticsEventSchema
);

// Alert System Model
export interface IAnalyticsAlert extends Document {
  alertId: string;
  name: string;
  description?: string;
  kpiMetric: string;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    value: number | [number, number];
    period: 'instant' | 'hourly' | 'daily' | 'weekly';
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
  recipients: Array<{
    type: 'email' | 'sms' | 'webhook';
    address: string;
    isActive: boolean;
  }>;
  actions: Array<{
    type: 'email' | 'webhook' | 'create_ticket' | 'log';
    config: Record<string, any>;
  }>;
}

const AnalyticsAlertSchema = new Schema<IAnalyticsAlert>(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      default: () => `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    kpiMetric: {
      type: String,
      required: true
    },
    condition: {
      operator: {
        type: String,
        enum: ['gt', 'lt', 'eq', 'gte', 'lte', 'between'],
        required: true
      },
      value: {
        type: Schema.Types.Mixed,
        required: true
      },
      period: {
        type: String,
        enum: ['instant', 'hourly', 'daily', 'weekly'],
        default: 'instant'
      }
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastTriggered: Date,
    triggerCount: {
      type: Number,
      default: 0
    },
    recipients: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'webhook'],
        required: true
      },
      address: {
        type: String,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    actions: [{
      type: {
        type: String,
        enum: ['email', 'webhook', 'create_ticket', 'log'],
        required: true
      },
      config: {
        type: Schema.Types.Mixed,
        required: true
      }
    }]
  },
  { timestamps: true }
);

AnalyticsAlertSchema.index({ kpiMetric: 1, isActive: 1 });
AnalyticsAlertSchema.index({ severity: 1, isActive: 1 });

export const AnalyticsAlert = mongoose.model<IAnalyticsAlert>(
  'AnalyticsAlert',
  AnalyticsAlertSchema
);
