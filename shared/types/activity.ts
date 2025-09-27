// Activity Logger Types and Interfaces

export type ActivityType = 
  | 'user_action'
  | 'system_event'
  | 'booking_change'
  | 'order_update'
  | 'product_change'
  | 'payment_event'
  | 'auth_event'
  | 'security_alert'
  | 'data_export'
  | 'configuration_change';

export type ActivitySeverity = 'low' | 'medium' | 'high' | 'critical';

export type ActivityStatus = 'success' | 'warning' | 'error' | 'info';

export interface ActivityUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
  photo?: string;
}

export interface ActivityMetadata {
  [key: string]: any;
  // Common metadata fields
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  request_id?: string;
  // Entity-specific metadata
  entity_id?: string;
  entity_type?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changes?: string[];
  // Additional context
  reason?: string;
  notes?: string;
  duration_ms?: number;
  error_message?: string;
  stack_trace?: string;
}

export interface Activity {
  _id: string;
  type: ActivityType;
  action: string;
  description: string;
  user: ActivityUser | null; // null for system events
  target_user?: ActivityUser; // for actions performed on other users
  severity: ActivitySeverity;
  status: ActivityStatus;
  metadata: ActivityMetadata;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityFilter {
  type?: ActivityType[];
  severity?: ActivitySeverity[];
  status?: ActivityStatus[];
  user_id?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
  entity_type?: string;
  entity_id?: string;
}

export interface ActivityAnalytics {
  total_activities: number;
  activities_by_type: Record<ActivityType, number>;
  activities_by_severity: Record<ActivitySeverity, number>;
  activities_by_status: Record<ActivityStatus, number>;
  activities_by_hour: Array<{ hour: number; count: number }>;
  activities_by_day: Array<{ date: string; count: number }>;
  top_users: Array<{
    user: ActivityUser;
    activity_count: number;
    last_activity: string;
  }>;
  security_alerts: number;
  error_rate: number;
  average_session_duration: number;
}

export interface ActivityExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filters?: ActivityFilter;
  include_metadata?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

// Predefined activity configurations for common actions
export const ACTIVITY_CONFIGS = {
  // User Management Activities
  USER_CREATED: {
    type: 'user_action' as ActivityType,
    action: 'user.created',
    severity: 'medium' as ActivitySeverity,
    description: 'Created new user account'
  },
  USER_UPDATED: {
    type: 'user_action' as ActivityType,
    action: 'user.updated',
    severity: 'low' as ActivitySeverity,
    description: 'Updated user information'
  },
  USER_DELETED: {
    type: 'user_action' as ActivityType,
    action: 'user.deleted',
    severity: 'high' as ActivitySeverity,
    description: 'Deleted user account'
  },
  USER_SUSPENDED: {
    type: 'security_alert' as ActivityType,
    action: 'user.suspended',
    severity: 'high' as ActivitySeverity,
    description: 'Suspended user account'
  },
  USER_LOGIN: {
    type: 'auth_event' as ActivityType,
    action: 'auth.login',
    severity: 'low' as ActivitySeverity,
    description: 'User logged in'
  },
  USER_LOGOUT: {
    type: 'auth_event' as ActivityType,
    action: 'auth.logout',
    severity: 'low' as ActivitySeverity,
    description: 'User logged out'
  },
  LOGIN_FAILED: {
    type: 'security_alert' as ActivityType,
    action: 'auth.login_failed',
    severity: 'medium' as ActivitySeverity,
    description: 'Failed login attempt'
  },

  // Product Management Activities
  PRODUCT_CREATED: {
    type: 'product_change' as ActivityType,
    action: 'product.created',
    severity: 'medium' as ActivitySeverity,
    description: 'Created new product'
  },
  PRODUCT_UPDATED: {
    type: 'product_change' as ActivityType,
    action: 'product.updated',
    severity: 'low' as ActivitySeverity,
    description: 'Updated product details'
  },
  PRODUCT_DELETED: {
    type: 'product_change' as ActivityType,
    action: 'product.deleted',
    severity: 'medium' as ActivitySeverity,
    description: 'Deleted product'
  },
  INVENTORY_UPDATED: {
    type: 'product_change' as ActivityType,
    action: 'inventory.updated',
    severity: 'low' as ActivitySeverity,
    description: 'Updated product inventory'
  },

  // Order Management Activities
  ORDER_CREATED: {
    type: 'order_update' as ActivityType,
    action: 'order.created',
    severity: 'low' as ActivitySeverity,
    description: 'New order created'
  },
  ORDER_UPDATED: {
    type: 'order_update' as ActivityType,
    action: 'order.updated',
    severity: 'low' as ActivitySeverity,
    description: 'Order status updated'
  },
  ORDER_CANCELLED: {
    type: 'order_update' as ActivityType,
    action: 'order.cancelled',
    severity: 'medium' as ActivitySeverity,
    description: 'Order cancelled'
  },
  REFUND_PROCESSED: {
    type: 'payment_event' as ActivityType,
    action: 'payment.refund',
    severity: 'medium' as ActivitySeverity,
    description: 'Refund processed'
  },

  // Booking Management Activities
  BOOKING_CREATED: {
    type: 'booking_change' as ActivityType,
    action: 'booking.created',
    severity: 'low' as ActivitySeverity,
    description: 'New booking created'
  },
  BOOKING_UPDATED: {
    type: 'booking_change' as ActivityType,
    action: 'booking.updated',
    severity: 'low' as ActivitySeverity,
    description: 'Booking details updated'
  },
  BOOKING_CANCELLED: {
    type: 'booking_change' as ActivityType,
    action: 'booking.cancelled',
    severity: 'medium' as ActivitySeverity,
    description: 'Booking cancelled'
  },
  STAFF_ASSIGNED: {
    type: 'booking_change' as ActivityType,
    action: 'booking.staff_assigned',
    severity: 'low' as ActivitySeverity,
    description: 'Staff assigned to booking'
  },

  // System Events
  SYSTEM_STARTUP: {
    type: 'system_event' as ActivityType,
    action: 'system.startup',
    severity: 'low' as ActivitySeverity,
    description: 'System started'
  },
  SYSTEM_SHUTDOWN: {
    type: 'system_event' as ActivityType,
    action: 'system.shutdown',
    severity: 'medium' as ActivitySeverity,
    description: 'System shutdown initiated'
  },
  BACKUP_CREATED: {
    type: 'system_event' as ActivityType,
    action: 'system.backup_created',
    severity: 'low' as ActivitySeverity,
    description: 'System backup created'
  },
  CONFIG_CHANGED: {
    type: 'configuration_change' as ActivityType,
    action: 'config.updated',
    severity: 'high' as ActivitySeverity,
    description: 'System configuration changed'
  },

  // Security Alerts
  SUSPICIOUS_LOGIN: {
    type: 'security_alert' as ActivityType,
    action: 'security.suspicious_login',
    severity: 'high' as ActivitySeverity,
    description: 'Suspicious login detected'
  },
  MULTIPLE_FAILED_LOGINS: {
    type: 'security_alert' as ActivityType,
    action: 'security.multiple_failed_logins',
    severity: 'critical' as ActivitySeverity,
    description: 'Multiple failed login attempts detected'
  },
  UNAUTHORIZED_ACCESS: {
    type: 'security_alert' as ActivityType,
    action: 'security.unauthorized_access',
    severity: 'critical' as ActivitySeverity,
    description: 'Unauthorized access attempt'
  },

  // Data Export
  DATA_EXPORTED: {
    type: 'data_export' as ActivityType,
    action: 'data.exported',
    severity: 'medium' as ActivitySeverity,
    description: 'Data exported'
  }
} as const;

// Helper functions for activity management
export const getActivityTypeLabel = (type: ActivityType): string => {
  const labels: Record<ActivityType, string> = {
    user_action: 'User Action',
    system_event: 'System Event',
    booking_change: 'Booking Change',
    order_update: 'Order Update',
    product_change: 'Product Change',
    payment_event: 'Payment Event',
    auth_event: 'Authentication',
    security_alert: 'Security Alert',
    data_export: 'Data Export',
    configuration_change: 'Configuration'
  };
  return labels[type] || type;
};

export const getActivitySeverityColor = (severity: ActivitySeverity): string => {
  const colors: Record<ActivitySeverity, string> = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  };
  return colors[severity];
};

export const getActivityStatusColor = (status: ActivityStatus): string => {
  const colors: Record<ActivityStatus, string> = {
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200'
  };
  return colors[status];
};

export const formatActivityTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};
