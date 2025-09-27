/**
 * Central Service Exports
 * Provides a single import point for all API services
 */

// Core Services
export { default as AuthService } from "./AuthService";
export { default as AdminApiService } from "./AdminApiService";
export { default as ActivityLoggerService } from "./ActivityLoggerService";

// Module-specific Services
export {
  default as analyticsApi,
  analyticsWebSocket,
  useAnalyticsData,
} from "../../admin/analytics/services/analyticsApi";

// Import module services with error handling for modules that might not exist yet
let bookingApi,
  financeApi,
  marketingApi,
  chatApi,
  orderApi,
  productApi,
  userApi;

try {
  bookingApi = require("../../admin/bookings/services/bookingApi").default;
} catch (e) {
  console.warn("Booking API service not found");
}

try {
  financeApi = require("../../admin/finance/services/financeApi").default;
} catch (e) {
  console.warn("Finance API service not found");
}

try {
  marketingApi = require("../../admin/marketing/services/marketingApi").default;
} catch (e) {
  console.warn("Marketing API service not found");
}

try {
  chatApi = require("../../admin/chat/services/chatApi").default;
} catch (e) {
  console.warn("Chat API service not found");
}

try {
  orderApi = require("../../admin/orders/services/orderApi").default;
} catch (e) {
  console.warn("Order API service not found");
}

try {
  productApi = require("../../admin/products/services/productApi").default;
} catch (e) {
  console.warn("Product API service not found");
}

try {
  userApi = require("../../admin/users/services/userApi").default;
} catch (e) {
  console.warn("User API service not found");
}

export {
  bookingApi,
  financeApi,
  marketingApi,
  chatApi,
  orderApi,
  productApi,
  userApi,
};

// API Configuration
export {
  default as API_CONFIG,
  API_BASE_URL,
  ENDPOINTS,
  WS_ENDPOINTS,
} from "../config/apiConfig";

// Types
export type {
  ApiResponse,
  DashboardStats,
  Order,
  Booking,
  Product,
  ActivityLog,
} from "./AdminApiService";
export type { User, LoginCredentials, AuthResponse } from "../types/User";
