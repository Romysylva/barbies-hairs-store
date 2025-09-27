// routes/adminRoutes.ts
import express from 'express';
import {
  getStats,
  getTopBookedProducts,
  getFraudDetectionResults,
  getSystemSettings,
  getSystemSettingByKey,
  createSystemSetting,
  updateSystemSetting,
  deleteSystemSetting,
  getActivityLogs,
  systemSettings,
  // User management
  getAllUsers,
  getUserAnalytics,
  getUserById,
  updateUser,
  deleteUser,
  bulkUserOperations,
  // Product management
  getAllProducts,
  getProductAnalytics,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkProductOperations,
  // Order management
  getAllOrders,
  getOrderAnalytics,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  bulkOrderOperations,
  // Booking management
  getAllBookings,
  getBookingAnalytics,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  bulkBookingOperations,
  // Chat management
  getAllChats,
  getChatAnalytics,
  getChatById,
  createChat,
  addMessageToChat,
  assignChat,
  updateChatStatus,
  closeChat,
  markMessagesAsRead,
  bulkChatOperations,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authmiddleware.js';

const router = express.Router();

// 📊 Dashboard stats
router.get('/stats', protect, adminOnly, getStats);

// 🏆 Top booked products
router.get(
  '/system-setting/top-booked-products',
  protect,
  adminOnly,
  getTopBookedProducts
);

// 🚨 Fraud detection
router.get('/fraud-detection', protect, adminOnly, getFraudDetectionResults);

// ⚙️ System settings
router.get('/system-settings', protect, adminOnly, getSystemSettings);
router.get('/system-settings/:key', protect, adminOnly, getSystemSettingByKey);
router.post('/system-settings', protect, adminOnly, createSystemSetting);
router.put('/system-settings/:key', protect, adminOnly, updateSystemSetting);
router.delete('/system-settings/:key', protect, adminOnly, deleteSystemSetting);
router.patch('/system-settings/feature_topBookedProducts', systemSettings);

// 📜 Activity logs
router.get('/activity-logs', protect, adminOnly, getActivityLogs);

// 👥 User management routes
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/analytics', protect, adminOnly, getUserAnalytics);
router.get('/users/:id', protect, adminOnly, getUserById);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.post('/users/bulk', protect, adminOnly, bulkUserOperations);

// 📎 Product management routes
router.get('/products', protect, adminOnly, getAllProducts);
router.get('/products/analytics', protect, adminOnly, getProductAnalytics);
router.get('/products/:id', protect, adminOnly, getProductById);
router.post('/products', protect, adminOnly, createProduct);
router.put('/products/:id', protect, adminOnly, updateProduct);
router.delete('/products/:id', protect, adminOnly, deleteProduct);
router.post('/products/bulk', protect, adminOnly, bulkProductOperations);

// 📋 Order management routes
router.get('/orders', protect, adminOnly, getAllOrders);
router.get('/orders/analytics', protect, adminOnly, getOrderAnalytics);
router.get('/orders/:id', protect, adminOnly, getOrderById);
router.patch('/orders/:id/status', protect, adminOnly, updateOrderStatus);
router.patch('/orders/:id/cancel', protect, adminOnly, cancelOrder);
router.post('/orders/bulk', protect, adminOnly, bulkOrderOperations);

// 📅 Booking management routes
router.get('/bookings', protect, adminOnly, getAllBookings);
router.get('/bookings/analytics', protect, adminOnly, getBookingAnalytics);
router.get('/bookings/:id', protect, adminOnly, getBookingById);
router.patch('/bookings/:id/status', protect, adminOnly, updateBookingStatus);
router.patch('/bookings/:id/cancel', protect, adminOnly, cancelBooking);
router.post('/bookings/bulk', protect, adminOnly, bulkBookingOperations);

// 💬 Chat management routes
router.get('/chats', protect, adminOnly, getAllChats);
router.get('/chats/analytics', protect, adminOnly, getChatAnalytics);
router.get('/chats/:id', protect, adminOnly, getChatById);
router.post('/chats', protect, adminOnly, createChat);
router.post('/chats/:id/messages', protect, adminOnly, addMessageToChat);
router.patch('/chats/:id/assign', protect, adminOnly, assignChat);
router.patch('/chats/:id/status', protect, adminOnly, updateChatStatus);
router.patch('/chats/:id/close', protect, adminOnly, closeChat);
router.patch('/chats/:id/read', protect, adminOnly, markMessagesAsRead);
router.post('/chats/bulk', protect, adminOnly, bulkChatOperations);

export default router;
