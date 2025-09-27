/**
 * Central API Configuration
 * Provides consistent API endpoints and configurations for all services
 */

// Environment-based API configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  API_VERSION: '/api/barbies/v1',
  
  // WebSocket URL
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
  
  // Request timeout
  REQUEST_TIMEOUT: 30000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Full API base URL
export const API_BASE_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`;

// Endpoint configurations
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auths/login',
    LOGOUT: '/auths/logout',
    REGISTER: '/auths/register',
    ME: '/auths/me',
    VERIFY: '/auths/me',
  },

  // Admin
  ADMIN: {
    STATS: '/admin/stats',
    ACTIVITY_LOGS: '/admin/activity-logs',
    SYSTEM_SETTINGS: '/admin/system-settings',
    TOP_PRODUCTS: '/admin/system-setting/top-booked-products',
    FRAUD_DETECTION: '/admin/fraud-detection',
    EXPORT: '/admin/export',
    SYSTEM_HEALTH: '/admin/system-health',
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD_METRICS: '/analytics/dashboard/metrics',
    SALES: '/analytics/sales',
    CUSTOMERS: '/analytics/customers',
    PRODUCTS: '/analytics/products',
    REALTIME: '/analytics/realtime',
    BUSINESS_INTELLIGENCE: '/analytics/reports/business-intelligence',
    FORECAST: '/analytics/forecast',
    EXPORT: '/analytics/export',
    COHORT: '/analytics/cohort',
    AB_TESTING: '/analytics/ab-testing',
    CHANNELS: '/analytics/channels',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    BATCH: '/users/batch',
  },

  // Orders
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    BATCH: '/orders/batch',
  },

  // Products
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    FEATURED: '/products/featured',
    BESTSELLERS: '/products/bestsellers',
    BATCH: '/products/batch',
  },

  // Bookings
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    BATCH: '/bookings/batch',
  },

  // Categories
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
  },

  // Marketing (for future implementation)
  MARKETING: {
    CAMPAIGNS: '/marketing/campaigns',
    METRICS: '/marketing/metrics',
    EMAIL: '/marketing/email',
    SOCIAL: '/marketing/social',
    PROMOS: '/marketing/promos',
    ATTRIBUTION: '/marketing/attribution',
  },

  // Chat (for future implementation)
  CHAT: {
    SESSIONS: '/chat/sessions',
    MESSAGES: (chatId: string) => `/chat/sessions/${chatId}/messages`,
    ASSIGN: (chatId: string) => `/chat/sessions/${chatId}/assign`,
    RESOLVE: (chatId: string) => `/chat/sessions/${chatId}/resolve`,
    CLOSE: (chatId: string) => `/chat/sessions/${chatId}/close`,
    STATS: '/chat/stats',
    AGENTS: '/chat/agents',
  },

  // Global
  SEARCH: '/search',
  UPLOAD: {
    PRODUCT: '/upload/product',
    USER: '/upload/user',
  },
};

// WebSocket endpoint configurations
export const WS_ENDPOINTS = {
  ANALYTICS: `${API_CONFIG.WS_URL}/analytics`,
  CHAT: `${API_CONFIG.WS_URL}/chat`,
  NOTIFICATIONS: `${API_CONFIG.WS_URL}/notifications`,
};

// Helper function to build full endpoint URL
export const getEndpointUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to build WebSocket URL
export const getWebSocketUrl = (endpoint: string): string => {
  return endpoint;
};

// Common request headers
export const getRequestHeaders = (token?: string): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Request configuration builder
export const buildRequestConfig = (
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): RequestInit => {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
  };
};

// Error response interface
export interface ApiError {
  success: false;
  error: string;
  status?: number;
  code?: string;
}

// Success response interface
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export default API_CONFIG;
