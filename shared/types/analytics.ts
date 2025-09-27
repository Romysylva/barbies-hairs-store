// Advanced Analytics Types for Business Intelligence

export interface RevenueAnalytics {
  total_revenue: number;
  revenue_growth: number;
  average_transaction: number;
  profit_margin: number;
  revenue_by_service: Record<string, number>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    target: number;
  }>;
  revenue_forecast: Array<{
    month: string;
    predicted_revenue: number;
    confidence_interval: [number, number];
  }>;
  top_revenue_services: Array<{
    service_id: string;
    service_name: string;
    revenue: number;
    bookings_count: number;
    avg_price: number;
  }>;
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_retention_rate: number;
  average_customer_lifetime_value: number;
  customer_acquisition_cost: number;
  customer_segments: Array<{
    segment: string;
    count: number;
    avg_spending: number;
    retention_rate: number;
  }>;
  customer_behavior: {
    avg_bookings_per_month: number;
    most_popular_services: string[];
    peak_booking_times: string[];
    cancellation_rate: number;
  };
  customer_satisfaction: {
    average_rating: number;
    nps_score: number;
    review_count: number;
    satisfaction_trend: Array<{
      month: string;
      rating: number;
    }>;
  };
}

export interface StaffPerformance {
  staff_id: string;
  staff_name: string;
  role: string;
  performance_metrics: {
    total_bookings: number;
    revenue_generated: number;
    customer_rating: number;
    punctuality_score: number;
    productivity_score: number;
    goals_achieved: number;
    goals_total: number;
  };
  monthly_performance: Array<{
    month: string;
    bookings: number;
    revenue: number;
    rating: number;
  }>;
  skills_assessment: Array<{
    skill: string;
    level: number; // 1-10
    certified: boolean;
  }>;
  customer_feedback: Array<{
    customer_name: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export interface InventoryAnalytics {
  total_products: number;
  low_stock_alerts: number;
  out_of_stock_count: number;
  inventory_value: number;
  top_selling_products: Array<{
    product_id: string;
    product_name: string;
    units_sold: number;
    revenue: number;
    profit_margin: number;
  }>;
  inventory_turnover: Array<{
    product_id: string;
    product_name: string;
    turnover_rate: number;
    reorder_point: number;
    current_stock: number;
  }>;
  supplier_performance: Array<{
    supplier_id: string;
    supplier_name: string;
    delivery_time: number;
    quality_score: number;
    cost_efficiency: number;
  }>;
  waste_tracking: {
    expired_products: number;
    damaged_products: number;
    total_waste_value: number;
    waste_percentage: number;
  };
}

export interface MarketingROI {
  total_marketing_spend: number;
  total_marketing_revenue: number;
  roi_percentage: number;
  cost_per_acquisition: number;
  campaigns: Array<{
    campaign_id: string;
    campaign_name: string;
    type: "email" | "sms" | "social" | "print" | "online";
    spend: number;
    revenue: number;
    conversions: number;
    roi: number;
    status: "active" | "paused" | "completed";
  }>;
  channel_performance: Record<
    string,
    {
      spend: number;
      revenue: number;
      conversions: number;
      roi: number;
    }
  >;
  customer_journey: Array<{
    touchpoint: string;
    conversions: number;
    revenue_attribution: number;
  }>;
}

export interface BusinessIntelligence {
  revenue: RevenueAnalytics;
  customers: CustomerAnalytics;
  staff: StaffPerformance[];
  inventory: InventoryAnalytics;
  marketing: MarketingROI;
  period: {
    start_date: string;
    end_date: string;
    comparison_period: string;
  };
  kpis: {
    revenue_target_achievement: number;
    customer_satisfaction_target: number;
    staff_utilization_rate: number;
    inventory_efficiency: number;
    marketing_efficiency: number;
  };
}

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const calculateGrowthRate = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getPerformanceColor = (
  score: number,
  threshold: { good: number; fair: number }
): string => {
  if (score >= threshold.good) return "text-green-600";
  if (score >= threshold.fair) return "text-yellow-600";
  return "text-red-600";
};

export const getPerformanceBadgeColor = (
  score: number,
  threshold: { good: number; fair: number }
): string => {
  if (score >= threshold.good) return "bg-green-100 text-green-800";
  if (score >= threshold.fair) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

// export interface DashboardMetrics {
//   overview: {
//     totalRevenue: number;
//     totalOrders: number;
//     averageOrderValue: number;
//     conversionRate: number;
//     completionRate: number;
//     period: string;
//   };
//   revenueChart: Array<{
//     _id: { date: string };
//     totalRevenue: number;
//     orderCount: number;
//     averageOrderValue: number;
//   }>;
//   orderStatus: Array<{
//     _id: string;
//     count: number;
//     totalValue: number;
//   }>;
//   customerGrowth: Array<{
//     _id: string;
//     newCustomers: number;
//   }>;
//   topProducts: Array<{
//     _id: string;
//     name: string;
//     category: string;
//     totalSales: number;
//     totalRevenue: number;
//     averagePrice: number;
//   }>;
//   bookingStatus: Array<{
//     _id: string;
//     count: number;
//     totalValue: number;
//   }>;
//   kpis: {
//     revenueGrowth: number;
//     customerAcquisitionCost: number;
//     customerLifetimeValue: number;
//     churnRate: number;
//   };
// }

// export interface SalesAnalytics {
//   salesPerformance: Array<{
//     period: Date;
//     revenue: number;
//     orders: number;
//     periodType: string;
//   }>;
//   orderAnalytics: Array<{
//     _id: { date: string };
//     revenue: number;
//     orders: number;
//     averageOrderValue: number;
//     customerCount: number;
//   }>;
//   trends: {
//     revenueGrowth: number;
//     orderGrowth: number;
//     trend: 'growing' | 'declining' | 'stable';
//   };
//   summary: {
//     totalRevenue: number;
//     totalOrders: number;
//     averageOrderValue: number;
//     uniqueCustomers: number;
//   };
// }

// export interface CustomerAnalytics {
//   segments: Array<{
//     _id: string;
//     count: number;
//     averageLifetimeValue: number;
//     averageOrderValue: number;
//     totalSpent: number;
//   }>;
//   cohortAnalysis: Array<{
//     _id: string;
//     customers: number;
//     firstOrders: number;
//   }>;
//   lifetimeValue: {
//     averageCLV: number;
//     medianCLV: number;
//     topPercentile: number;
//   };
//   churnRisk: Array<{
//     _id: 'low' | 'medium' | 'high';
//     count: number;
//     averageCLV: number;
//     totalAtRisk: number;
//   }>;
//   insights: {
//     totalCustomers: number;
//     highValueCustomers: number;
//     atRiskCustomers: number;
//   };
// }

// export interface ProductAnalytics {
//   productPerformance: Array<{
//     _id: string;
//     name: string;
//     category: string;
//     totalSales: number;
//     totalRevenue: number;
//     averagePrice: number;
//     totalOrders: number;
//     customerCount: number;
//     revenuePerCustomer: number;
//   }>;
//   categoryAnalysis: Array<{
//     _id: string;
//     totalRevenue: number;
//     totalSales: number;
//     uniqueProducts: number;
//     averageOrderValue: number;
//   }>;
//   summary: {
//     totalProducts: number;
//     totalRevenue: number;
//     totalSales: number;
//     topPerformer: any;
//   };
// }

// export interface RealTimeMetrics {
//   liveStats: {
//     activeUsers: number;
//     ordersLastHour: number;
//     bookingsLastHour: number;
//     revenue24h: number;
//   };
//   recentActivity: {
//     orders: Array<{
//       _id: string;
//       totalAmount: number;
//       createdAt: string;
//       user: { firstName: string; lastName: string };
//     }>;
//     bookings: Array<{
//       _id: string;
//       totalPrice: number;
//       createdAt: string;
//       user: { firstName: string; lastName: string };
//       product: { name: string };
//     }>;
//   };
//   hourlyRevenue: Array<{
//     _id: { hour: number };
//     revenue: number;
//     orders: number;
//   }>;
// }

// export interface BusinessIntelligence {
//   reportType: string;
//   period: string;
//   generatedAt: Date;
//   executiveSummary: {
//     totalRevenue: number;
//     totalOrders: number;
//     averageOrderValue: number;
//   };
//   newCustomers: number;
//   activeProducts: number;
//   customerInsights: {
//     averageLifetimeValue: number;
//     highValueCustomers: number;
//   };
//   recommendations: string[];
// }

// export interface ForecastData {
//   historical: Array<{
//     _id: { date: string };
//     revenue: number;
//     orders: number;
//   }>;
//   forecast: Array<{
//     date: string;
//     revenue?: number;
//     orders?: number;
//     confidence: number;
//   }>;
//   accuracy: number;
//   confidence: 'low' | 'medium' | 'high';
// }

// export interface ChartDataPoint {
//   date: string;
//   value: number;
//   label?: string;
// }

// export interface MetricCard {
//   title: string;
//   value: string | number;
//   change?: number;
//   trend?: 'up' | 'down' | 'stable';
//   icon?: React.ComponentType;
//   description?: string;
// }
