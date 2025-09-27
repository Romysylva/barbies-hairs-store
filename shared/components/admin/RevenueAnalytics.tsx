"use client";
import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Star,
  Zap,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  RevenueAnalytics as RevenueAnalyticsType,
  formatCurrency,
  formatPercentage,
  calculateGrowthRate
} from '../../types/analytics';

interface RevenueAnalyticsProps {
  data?: RevenueAnalyticsType;
  loading?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '12m';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '12m') => void;
  className?: string;
}

// Mock data generator
const generateMockRevenueData = (): RevenueAnalyticsType => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return {
    total_revenue: 125430.50,
    revenue_growth: 15.3,
    average_transaction: 85.60,
    profit_margin: 68.5,
    revenue_by_service: {
      'haircut': 45200,
      'coloring': 38500,
      'styling': 22800,
      'treatment': 18930
    },
    revenue_by_month: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(currentYear, i).toLocaleDateString('en-US', { month: 'short' }),
      revenue: Math.floor(Math.random() * 15000) + 8000,
      target: 12000
    })),
    revenue_forecast: Array.from({ length: 6 }, (_, i) => ({
      month: new Date(currentYear, currentMonth + i + 1).toLocaleDateString('en-US', { month: 'short' }),
      predicted_revenue: Math.floor(Math.random() * 3000) + 10000,
      confidence_interval: [8500, 13500] as [number, number]
    })),
    top_revenue_services: [
      { service_id: '1', service_name: 'Premium Hair Coloring', revenue: 38500, bookings_count: 420, avg_price: 92 },
      { service_id: '2', service_name: 'Precision Cut & Style', revenue: 32100, bookings_count: 380, avg_price: 85 },
      { service_id: '3', service_name: 'Deep Conditioning Treatment', revenue: 18930, bookings_count: 245, avg_price: 77 },
      { service_id: '4', service_name: 'Bridal Styling Package', revenue: 15200, bookings_count: 95, avg_price: 160 },
      { service_id: '5', service_name: 'Hair Extensions', revenue: 12700, bookings_count: 85, avg_price: 149 }
    ]
  };
};

const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({
  data,
  loading = false,
  timeRange = '30d',
  onTimeRangeChange,
  className = ""
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const revenueData = useMemo(() => {
    return data || generateMockRevenueData();
  }, [data]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className={`bg-card rounded-lg border border-border p-8 text-center ${className}`}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground mt-2">Loading revenue analytics...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            Revenue Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial performance and revenue insights
          </p>
        </div>
        
        {onTimeRangeChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Period:</label>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value as any)}
              className="input text-sm w-auto"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="12m">Last 12 Months</option>
            </select>
          </div>
        )}
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(revenueData.total_revenue)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            {revenueData.revenue_growth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`font-medium ${revenueData.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(Math.abs(revenueData.revenue_growth))}
            </span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        </div>

        {/* Average Transaction */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(revenueData.average_transaction)}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+8.2%</span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
              <p className="text-2xl font-bold text-foreground">
                {formatPercentage(revenueData.profit_margin)}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+2.1%</span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        </div>

        {/* Revenue Growth Rate */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {formatPercentage(revenueData.revenue_growth)}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">Above target</span>
            <span className="text-muted-foreground ml-1">(12% goal)</span>
          </div>
        </div>
      </div>

      {/* Revenue Trends & Forecasting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Revenue Trend */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Monthly Revenue Trend</h3>
            <button
              onClick={() => toggleSection('revenue-trend')}
              className="btn-ghost btn-icon btn-sm"
            >
              {expandedSection === 'revenue-trend' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Revenue Chart */}
          <div className="mb-4">
            <div className="flex items-end gap-2 h-48">
              {revenueData.revenue_by_month.map((month, index) => {
                const maxRevenue = Math.max(...revenueData.revenue_by_month.map(m => Math.max(m.revenue, m.target)));
                const revenueHeight = (month.revenue / maxRevenue) * 100;
                const targetHeight = (month.target / maxRevenue) * 100;
                const isAboveTarget = month.revenue >= month.target;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative">
                      {/* Target line */}
                      <div 
                        className="absolute w-full border-t-2 border-dashed border-gray-400"
                        style={{ bottom: `${targetHeight}%` }}
                      />
                      {/* Revenue bar */}
                      <div 
                        className={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
                          isAboveTarget ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${revenueHeight}%` }}
                        title={`${month.month}: ${formatCurrency(month.revenue)} (Target: ${formatCurrency(month.target)})`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      <div className="font-medium">{month.month}</div>
                      <div className={isAboveTarget ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(month.revenue)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {expandedSection === 'revenue-trend' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="font-medium text-green-800">Months Above Target</p>
                  <p className="text-2xl font-bold text-green-600">
                    {revenueData.revenue_by_month.filter(m => m.revenue >= m.target).length}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="font-medium text-blue-800">Best Month</p>
                  <p className="text-lg font-bold text-blue-600">
                    {revenueData.revenue_by_month.sort((a, b) => b.revenue - a.revenue)[0]?.month}
                  </p>
                  <p className="text-sm text-blue-600">
                    {formatCurrency(Math.max(...revenueData.revenue_by_month.map(m => m.revenue)))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Forecast */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Revenue Forecast</h3>
            <button
              onClick={() => toggleSection('forecast')}
              className="btn-ghost btn-icon btn-sm"
            >
              {expandedSection === 'forecast' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-end gap-2 h-48">
              {revenueData.revenue_forecast.map((forecast, index) => {
                const maxRevenue = Math.max(...revenueData.revenue_forecast.map(f => f.confidence_interval[1]));
                const predictedHeight = (forecast.predicted_revenue / maxRevenue) * 100;
                const lowHeight = (forecast.confidence_interval[0] / maxRevenue) * 100;
                const highHeight = (forecast.confidence_interval[1] / maxRevenue) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative">
                      {/* Confidence interval */}
                      <div 
                        className="absolute w-full bg-blue-200 rounded opacity-50"
                        style={{ 
                          height: `${highHeight - lowHeight}%`,
                          bottom: `${lowHeight}%`
                        }}
                      />
                      {/* Predicted revenue */}
                      <div 
                        className="absolute w-2/3 left-1/6 bg-blue-500 rounded-t transition-all duration-300"
                        style={{ height: `${predictedHeight}%` }}
                        title={`${forecast.month}: ${formatCurrency(forecast.predicted_revenue)}`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      <div className="font-medium">{forecast.month}</div>
                      <div className="text-blue-600">
                        {formatCurrency(forecast.predicted_revenue)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {expandedSection === 'forecast' && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">Forecast Insights</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Revenue projected to grow 12% next quarter</li>
                  <li>• Peak season expected in {revenueData.revenue_forecast[2]?.month}</li>
                  <li>• 95% confidence in forecast accuracy</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Revenue Breakdown */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Revenue by Service</h3>
          <button
            onClick={() => toggleSection('services')}
            className="btn-ghost btn-icon btn-sm"
          >
            {expandedSection === 'services' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Service Revenue Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart Visualization */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Service Distribution</h4>
            <div className="space-y-3">
              {Object.entries(revenueData.revenue_by_service).map(([service, revenue]) => {
                const percentage = (revenue / revenueData.total_revenue) * 100;
                return (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        service === 'haircut' ? 'bg-blue-500' :
                        service === 'coloring' ? 'bg-green-500' :
                        service === 'styling' ? 'bg-purple-500' : 'bg-orange-500'
                      }`} />
                      <span className="text-sm font-medium text-foreground capitalize">
                        {service}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-accent rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            service === 'haircut' ? 'bg-blue-500' :
                            service === 'coloring' ? 'bg-green-500' :
                            service === 'styling' ? 'bg-purple-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-20 text-right">
                        {formatCurrency(revenue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Revenue Services */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Top Revenue Services</h4>
            <div className="space-y-3">
              {revenueData.top_revenue_services.slice(0, 5).map((service, index) => (
                <div key={service.service_id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {service.service_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {service.bookings_count} bookings • Avg: {formatCurrency(service.avg_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          {formatCurrency(service.revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {expandedSection === 'services' && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">Highest Revenue</h4>
                <p className="text-lg font-bold text-green-600">
                  {revenueData.top_revenue_services[0]?.service_name}
                </p>
                <p className="text-sm text-green-600">
                  {formatCurrency(revenueData.top_revenue_services[0]?.revenue || 0)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">Most Popular</h4>
                <p className="text-lg font-bold text-blue-600">
                  {revenueData.top_revenue_services.sort((a, b) => b.bookings_count - a.bookings_count)[0]?.service_name}
                </p>
                <p className="text-sm text-blue-600">
                  {revenueData.top_revenue_services.sort((a, b) => b.bookings_count - a.bookings_count)[0]?.bookings_count} bookings
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-md">
                <h4 className="font-medium text-purple-800 mb-2">Highest Value</h4>
                <p className="text-lg font-bold text-purple-600">
                  {revenueData.top_revenue_services.sort((a, b) => b.avg_price - a.avg_price)[0]?.service_name}
                </p>
                <p className="text-sm text-purple-600">
                  {formatCurrency(revenueData.top_revenue_services.sort((a, b) => b.avg_price - a.avg_price)[0]?.avg_price || 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Goals & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Goal Achievement */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Goal Achievement
          </h3>
          
          <div className="space-y-4">
            {/* Monthly Goal */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Monthly Goal</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(12000)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((revenueData.total_revenue / 12000) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Current: {formatCurrency(revenueData.total_revenue)}</span>
                <span>{formatPercentage((revenueData.total_revenue / 12000) * 100)}</span>
              </div>
            </div>

            {/* Quarterly Goal */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Quarterly Goal</span>
                <span className="text-lg font-bold text-purple-600">
                  {formatCurrency(36000)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((revenueData.total_revenue * 3 / 36000) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Progress: {formatCurrency(revenueData.total_revenue * 3)}</span>
                <span>{formatPercentage((revenueData.total_revenue * 3 / 36000) * 100)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Key Performance Indicators
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Revenue per Customer</span>
              <span className="text-sm font-bold text-blue-600">
                {formatCurrency(142.50)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Revenue per Booking</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(revenueData.average_transaction)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Daily Average</span>
              <span className="text-sm font-bold text-purple-600">
                {formatCurrency(revenueData.total_revenue / 30)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Profit per Service</span>
              <span className="text-sm font-bold text-orange-600">
                {formatCurrency(revenueData.average_transaction * (revenueData.profit_margin / 100))}
              </span>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Revenue efficiency up 18% this month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Insights & Recommendations */}
      <div className="bg-card rounded-lg border border-border border-l-4 border-l-blue-500 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Revenue Insights & Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-3">📈 Growth Opportunities</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Hair coloring services show 25% higher margins - consider promoting</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Tuesday-Thursday bookings are 15% below capacity</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Premium packages have 40% higher customer satisfaction</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-3">⚠️ Areas for Improvement</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-500 mt-0.5" />
                <span>Styling services underperforming by 12% vs target</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-500 mt-0.5" />
                <span>Weekend cancellation rate at 18% - implement deposits</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-500 mt-0.5" />
                <span>Average transaction value declined 3% - upsell training needed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
