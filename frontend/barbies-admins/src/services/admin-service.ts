/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "../lib/api/apiClient";
import { ENDPOINTS, getEndpointUrl } from "../../../../shared/config/apiConfig";

// --------------------
// System Settings
// --------------------
export const systemService = {
  getAll: () => apiClient.get(getEndpointUrl(ENDPOINTS.ADMIN.SYSTEM_SETTINGS)),
  getByKey: (key: string) =>
    apiClient.get(getEndpointUrl(ENDPOINTS.ADMIN.SYSTEM_SETTINGS + `/${key}`)),
  create: (data: any) =>
    apiClient.post(getEndpointUrl(ENDPOINTS.ADMIN.SYSTEM_SETTINGS), data),
  update: (key: string, data: any) =>
    apiClient.put(
      getEndpointUrl(ENDPOINTS.ADMIN.SYSTEM_SETTINGS + `/${key}`),
      data
    ),
  delete: (key: string) =>
    apiClient.delete(
      getEndpointUrl(ENDPOINTS.ADMIN.SYSTEM_SETTINGS + `/${key}`)
    ),
  featureTopBookedProducts: (data: any) =>
    apiClient.patch(
      getEndpointUrl("/system-settings/feature_topBookedProducts"),
      data
    ),
};

// --------------------
// Users
// --------------------
export const userService = {
  getAll: () => apiClient.get(getEndpointUrl("/users")),
  getAnalytics: () => apiClient.get(getEndpointUrl("/users/analytics")),
  getById: (id: string) => apiClient.get(getEndpointUrl(`/users/${id}`)),
  update: (id: string, data: any) =>
    apiClient.put(getEndpointUrl(`/users/${id}`), data),
  delete: (id: string) => apiClient.delete(getEndpointUrl(`/users/${id}`)),
  bulk: (data: any) => apiClient.post(getEndpointUrl("/users/bulk"), data),
};

// --------------------
// Products
// --------------------
export const productService = {
  getAll: () => apiClient.get(getEndpointUrl("/products")),
  getAnalytics: () => apiClient.get(getEndpointUrl("/products/analytics")),
  getById: (id: string) => apiClient.get(getEndpointUrl(`/products/${id}`)),
  create: (data: any) => apiClient.post(getEndpointUrl("/products"), data),
  update: (id: string, data: any) =>
    apiClient.put(getEndpointUrl(`/products/${id}`), data),
  delete: (id: string) => apiClient.delete(getEndpointUrl(`/products/${id}`)),
  bulk: (data: any) => apiClient.post(getEndpointUrl("/products/bulk"), data),
};

// --------------------
// Orders
// --------------------
export const orderService = {
  getAll: () => apiClient.get(getEndpointUrl("/orders")),
  getAnalytics: () => apiClient.get(getEndpointUrl("/orders/analytics")),
  getById: (id: string) => apiClient.get(getEndpointUrl(`/orders/${id}`)),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(getEndpointUrl(`/orders/${id}/status`), { status }),
  cancel: (id: string) =>
    apiClient.patch(getEndpointUrl(`/orders/${id}/cancel`)),
  bulk: (data: any) => apiClient.post(getEndpointUrl("/orders/bulk"), data),
};

// --------------------
// Bookings
// --------------------
export const bookingService = {
  getAll: () => apiClient.get(getEndpointUrl("/bookings")),
  getAnalytics: () => apiClient.get(getEndpointUrl("/bookings/analytics")),
  getById: (id: string) => apiClient.get(getEndpointUrl(`/bookings/${id}`)),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(getEndpointUrl(`/bookings/${id}/status`), { status }),
  cancel: (id: string) =>
    apiClient.patch(getEndpointUrl(`/bookings/${id}/cancel`)),
  bulk: (data: any) => apiClient.post(getEndpointUrl("/bookings/bulk"), data),
};

// --------------------
// Chats
// --------------------
export const chatService = {
  getAll: () => apiClient.get(getEndpointUrl("/chats")),
  getAnalytics: () => apiClient.get(getEndpointUrl("/chats/analytics")),
  getById: (id: string) => apiClient.get(getEndpointUrl(`/chats/${id}`)),
  create: (data: any) => apiClient.post(getEndpointUrl("/chats"), data),
  addMessage: (chatId: string, message: any) =>
    apiClient.post(getEndpointUrl(`/chats/${chatId}/messages`), message),
  assign: (chatId: string, data: any) =>
    apiClient.patch(getEndpointUrl(`/chats/${chatId}/assign`), data),
  updateStatus: (chatId: string, data: any) =>
    apiClient.patch(getEndpointUrl(`/chats/${chatId}/status`), data),
  close: (chatId: string) =>
    apiClient.patch(getEndpointUrl(`/chats/${chatId}/close`)),
  markAsRead: (chatId: string) =>
    apiClient.patch(getEndpointUrl(`/chats/${chatId}/read`)),
  bulk: (data: any) => apiClient.post(getEndpointUrl("/chats/bulk"), data),
};

// --------------------
// Dashboard / Stats
// --------------------
export const adminStatsService = {
  getStats: () => apiClient.get(getEndpointUrl("/stats")),
  getTopBookedProducts: () =>
    apiClient.get(getEndpointUrl("/system-setting/top-booked-products")),
  getFraudDetectionResults: () =>
    apiClient.get(getEndpointUrl("/fraud-detection")),
  getActivityLogs: () => apiClient.get(getEndpointUrl("/activity-logs")),
};

// import { adminStatsService, userService, productService } from '../services/adminService';

// async function fetchDashboardData() {
//   try {
//     const stats = await adminStatsService.getStats();
//     const users = await userService.getAll();
//     const products = await productService.getAll();
//     console.log({ stats, users, products });
//   } catch (err) {
//     console.error("Admin API Error:", err);
//   }
// }
