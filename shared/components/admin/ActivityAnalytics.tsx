"use client";
import React, { useMemo, useState } from 'react';
import {
  Activity as ActivityIcon,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Shield,
  Zap,
  Timer,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Activity,
  ActivityAnalytics,
  ActivityType,
  ActivitySeverity,
  ActivityStatus,
  getActivityTypeLabel,
  getActivitySeverityColor,
  getActivityStatusColor,
  formatActivityTimestamp
} from '../../types/activity';

interface ActivityAnalyticsProps {
  activities?: Activity[];
  analytics?: ActivityAnalytics;
  loading?: boolean;
  className?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: '24h' | '7d' | '30d' | '90d') => void;
}

// Generate mock analytics data
const generateMockAnalytics = (activities: Activity[]): ActivityAnalytics => {
  const total = activities.length;
  
  // Count by type
  const activitiesByType = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<ActivityType, number>);

  // Count by severity
  const activitiesBySeverity = activities.reduce((acc, activity) => {
    acc[activity.severity] = (acc[activity.severity] || 0) + 1;
    return acc;
  }, {} as Record<ActivitySeverity, number>);

  // Count by status
  const activitiesByStatus = activities.reduce((acc, activity) => {
    acc[activity.status] = (acc[activity.status] || 0) + 1;
    return acc;
  }, {} as Record<ActivityStatus, number>);

  // Activities by hour (last 24 hours)
  const activitiesByHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: Math.floor(Math.random() * 20)
  }));

  // Activities by day (last 7 days)
  const activitiesByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 100)
    };
  });

  // Top users
  const userActivities = activities.reduce((acc, activity) => {
    if (activity.user) {
      const userId = activity.user._id;
      if (!acc[userId]) {
        acc[userId] = { user: activity.user, count: 0, lastActivity: activity.timestamp };
      }
      acc[userId].count++;
      if (new Date(activity.timestamp) > new Date(acc[userId].lastActivity)) {
        acc[userId].lastActivity = activity.timestamp;
      }
    }
    return acc;
  }, {} as Record<string, { user: any; count: number; lastActivity: string }>);

  const topUsers = Object.values(userActivities)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(item => ({
      user: item.user,
      activity_count: item.count,
      last_activity: item.lastActivity
    }));

  return {
    total_activities: total,
    activities_by_type: activitiesByType,
    activities_by_severity: activitiesBySeverity,
    activities_by_status: activitiesByStatus,
    activities_by_hour: activitiesByHour,
    activities_by_day: activitiesByDay,
    top_users: topUsers,
    security_alerts: activitiesBySeverity.critical || 0,
    error_rate: ((activitiesByStatus.error || 0) / total * 100),
    average_session_duration: 1200000 // 20 minutes in ms
  };
};

const ActivityAnalytics: React.FC<ActivityAnalyticsProps> = ({
  activities = [],
  analytics,
  loading = false,
  className = "",
  timeRange = '7d',
  onTimeRangeChange
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const computedAnalytics = useMemo(() => {
    return analytics || generateMockAnalytics(activities);
  }, [activities, analytics]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'user_action': return <User className="h-4 w-4" />;
      case 'system_event': return <ActivityIcon className="h-4 w-4" />;
      case 'security_alert': return <Shield className="h-4 w-4" />;
      case 'auth_event': return <User className="h-4 w-4" />;
      case 'booking_change': return <Calendar className="h-4 w-4" />;
      case 'order_update': return <BarChart3 className="h-4 w-4" />;
      case 'product_change': return <PieChart className="h-4 w-4" />;
      case 'payment_event': return <Zap className="h-4 w-4" />;
      case 'data_export': return <BarChart3 className="h-4 w-4" />;
      case 'configuration_change': return <ActivityIcon className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: ActivityStatus) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-card rounded-lg border border-border p-8 text-center ${className}`}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground mt-2">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Activity Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into system activity and usage patterns
          </p>
        </div>
        
        {onTimeRangeChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value as any)}
              className="input text-sm w-auto"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Activities */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
              <p className="text-2xl font-bold text-foreground">{computedAnalytics.total_activities.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ActivityIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
              <p className="text-2xl font-bold text-foreground">{computedAnalytics.security_alerts}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">-23.1%</span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
              <p className="text-2xl font-bold text-foreground">{computedAnalytics.error_rate.toFixed(1)}%</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">-5.2%</span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        </div>

        {/* Avg Session Duration */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(computedAnalytics.average_session_duration / 60000)}m
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Timer className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+8.3%</span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Activity by Type */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Activity by Type</h3>
            <button
              onClick={() => toggleSection('types')}
              className="btn-ghost btn-icon btn-sm"
            >
              {expandedSection === 'types' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="space-y-3">
            {Object.entries(computedAnalytics.activities_by_type).map(([type, count]) => {
              const percentage = (count / computedAnalytics.total_activities * 100);
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type as ActivityType)}
                    <span className="text-sm font-medium text-foreground">
                      {getActivityTypeLabel(type as ActivityType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-accent rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {expandedSection === 'types' && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <strong>Most Active:</strong> {
                    Object.entries(computedAnalytics.activities_by_type)
                      .sort(([,a], [,b]) => b - a)[0]?.[0] 
                      ? getActivityTypeLabel(Object.entries(computedAnalytics.activities_by_type).sort(([,a], [,b]) => b - a)[0][0] as ActivityType)
                      : 'N/A'
                  }
                </div>
                <div>
                  <strong>Total Types:</strong> {Object.keys(computedAnalytics.activities_by_type).length}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity by Status */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Activity by Status</h3>
            <button
              onClick={() => toggleSection('status')}
              className="btn-ghost btn-icon btn-sm"
            >
              {expandedSection === 'status' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="space-y-3">
            {Object.entries(computedAnalytics.activities_by_status).map(([status, count]) => {
              const percentage = (count / computedAnalytics.total_activities * 100);
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status as ActivityStatus)}
                    <span className="text-sm font-medium text-foreground capitalize">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-accent rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          status === 'success' ? 'bg-green-500' :
                          status === 'warning' ? 'bg-yellow-500' :
                          status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {expandedSection === 'status' && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <strong>Success Rate:</strong> {
                    ((computedAnalytics.activities_by_status.success || 0) / computedAnalytics.total_activities * 100).toFixed(1)
                  }%
                </div>
                <div>
                  <strong>Error Rate:</strong> {computedAnalytics.error_rate.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Activity Timeline</h3>
          <button
            onClick={() => toggleSection('timeline')}
            className="btn-ghost btn-icon btn-sm"
          >
            {expandedSection === 'timeline' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Daily Activity Chart */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Daily Activity (Last 7 Days)</h4>
          <div className="flex items-end gap-2 h-32">
            {computedAnalytics.activities_by_day.map((day, index) => {
              const maxCount = Math.max(...computedAnalytics.activities_by_day.map(d => d.count));
              const height = (day.count / maxCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                    style={{ height: `${height}%` }}
                    title={`${day.count} activities on ${new Date(day.date).toLocaleDateString()}`}
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    <div>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="font-medium">{day.count}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {expandedSection === 'timeline' && (
          <div>
            {/* Hourly Activity Chart */}
            <h4 className="text-sm font-medium text-foreground mb-3">Hourly Activity (Last 24 Hours)</h4>
            <div className="flex items-end gap-1 h-20 mb-4">
              {computedAnalytics.activities_by_hour.map((hour) => {
                const maxCount = Math.max(...computedAnalytics.activities_by_hour.map(h => h.count));
                const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                return (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-secondary rounded-t transition-all duration-300 hover:bg-secondary/80"
                      style={{ height: `${height}%` }}
                      title={`${hour.count} activities at ${hour.hour}:00`}
                    />
                    <div className="text-xs text-muted-foreground">
                      {hour.hour}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <strong>Peak Hour:</strong> {
                  computedAnalytics.activities_by_hour.sort((a, b) => b.count - a.count)[0]?.hour || 'N/A'
                }:00
              </div>
              <div>
                <strong>Peak Activities:</strong> {
                  Math.max(...computedAnalytics.activities_by_hour.map(h => h.count))
                }
              </div>
              <div>
                <strong>Avg/Hour:</strong> {
                  (computedAnalytics.activities_by_hour.reduce((sum, h) => sum + h.count, 0) / 24).toFixed(1)
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Severity Distribution & Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Severity Distribution */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Activity Severity</h3>
            <button
              onClick={() => toggleSection('severity')}
              className="btn-ghost btn-icon btn-sm"
            >
              {expandedSection === 'severity' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="space-y-3">
            {(['critical', 'high', 'medium', 'low'] as ActivitySeverity[]).map((severity) => {
              const count = computedAnalytics.activities_by_severity[severity] || 0;
              const percentage = computedAnalytics.total_activities > 0 ? (count / computedAnalytics.total_activities * 100) : 0;
              return (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      severity === 'critical' ? 'bg-red-500' :
                      severity === 'high' ? 'bg-orange-500' :
                      severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm font-medium text-foreground capitalize">
                      {severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-accent rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          severity === 'critical' ? 'bg-red-500' :
                          severity === 'high' ? 'bg-orange-500' :
                          severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {expandedSection === 'severity' && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <strong>Critical Issues:</strong> {computedAnalytics.activities_by_severity.critical || 0}
                </div>
                <div>
                  <strong>High Priority:</strong> {computedAnalytics.activities_by_severity.high || 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Active Users */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Most Active Users</h3>
            <button
              onClick={() => toggleSection('users')}
              className="btn-ghost btn-icon btn-sm"
            >
              {expandedSection === 'users' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="space-y-3">
            {computedAnalytics.top_users.slice(0, 5).map((userActivity, index) => (
              <div key={userActivity.user._id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {userActivity.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {userActivity.user.role} • Last active {formatActivityTimestamp(userActivity.last_activity)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {userActivity.activity_count}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        activities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {expandedSection === 'users' && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <strong>Total Active Users:</strong> {computedAnalytics.top_users.length}
                </div>
                <div>
                  <strong>Avg Activities/User:</strong> {
                    computedAnalytics.top_users.length > 0 
                      ? (computedAnalytics.total_activities / computedAnalytics.top_users.length).toFixed(1)
                      : '0'
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security & System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Security Overview */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Failed Logins</span>
              <span className="text-sm font-bold text-red-600">
                {computedAnalytics.activities_by_type.security_alert || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Suspicious Activity</span>
              <span className="text-sm font-bold text-orange-600">
                {Math.floor((computedAnalytics.activities_by_severity.high || 0) * 0.3)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Blocked IPs</span>
              <span className="text-sm font-bold text-gray-600">
                {Math.floor((computedAnalytics.security_alerts || 0) * 0.1)}
              </span>
            </div>
            
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {computedAnalytics.security_alerts} security alerts requiring attention
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Error Rate</span>
              <span className={`text-sm font-bold ${
                computedAnalytics.error_rate > 5 ? 'text-red-600' : 
                computedAnalytics.error_rate > 2 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {computedAnalytics.error_rate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Avg Response Time</span>
              <span className="text-sm font-bold text-blue-600">
                {(computedAnalytics.average_session_duration / 1000).toFixed(0)}ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">System Events</span>
              <span className="text-sm font-bold text-purple-600">
                {computedAnalytics.activities_by_type.system_event || 0}
              </span>
            </div>
            
            <div className={`mt-4 p-3 rounded-md border ${
              computedAnalytics.error_rate > 5 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2">
                {computedAnalytics.error_rate > 5 ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <span className={`text-sm font-medium ${
                  computedAnalytics.error_rate > 5 ? 'text-red-800' : 'text-green-800'
                }`}>
                  System health: {computedAnalytics.error_rate > 5 ? 'Needs attention' : 'Good'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Stats
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Activities Today</span>
              <span className="text-sm font-bold text-blue-600">
                {computedAnalytics.activities_by_day[computedAnalytics.activities_by_day.length - 1]?.count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Peak Hour</span>
              <span className="text-sm font-bold text-purple-600">
                {computedAnalytics.activities_by_hour.sort((a, b) => b.count - a.count)[0]?.hour || 0}:00
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Active Users</span>
              <span className="text-sm font-bold text-green-600">
                {computedAnalytics.top_users.length}
              </span>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Activity increased 12.5% this period
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Critical Activities */}
      {computedAnalytics.activities_by_severity.critical > 0 && (
        <div className="bg-card rounded-lg border border-border border-l-4 border-l-red-500 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Critical Activities Requiring Attention
          </h3>
          
          <div className="space-y-3">
            {activities
              .filter(activity => activity.severity === 'critical')
              .slice(0, 3)
              .map((activity) => (
                <div key={activity._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{activity.description}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {activity.user?.name || 'System'} • {formatActivityTimestamp(activity.timestamp)}
                    </p>
                  </div>
                  <button className="btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-600 hover:text-white self-start sm:self-center">
                    Review
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityAnalytics;
