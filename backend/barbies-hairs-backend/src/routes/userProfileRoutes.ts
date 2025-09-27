import express from 'express';
import {
  getUserProfile,
  updateUserPreferences,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getDefaultAddresses,
  getDefaultPaymentMethod,
  getLoyaltyProfile,
  updateLoyaltyPoints,
  applyReferralCode,
} from '../controllers/userProfileController.js';
import { protect, restrictTo } from '../middlewares/authmiddleware.js';

const router = express.Router();

// Protect all routes - require authentication
router.use(protect);

// PROFILE ROUTES
router.get('/profile', getUserProfile);
router.patch('/preferences', updateUserPreferences);

// ADDRESS ROUTES
router.get('/addresses', getUserAddresses);
router.post('/addresses', addAddress);
router.patch('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.patch('/addresses/:addressId/set-default', setDefaultAddress);
router.get('/addresses/defaults', getDefaultAddresses);

// PAYMENT METHOD ROUTES
router.get('/payment-methods', getPaymentMethods);
router.post('/payment-methods', addPaymentMethod);
router.patch('/payment-methods/:paymentMethodId', updatePaymentMethod);
router.delete('/payment-methods/:paymentMethodId', deletePaymentMethod);
router.patch(
  '/payment-methods/:paymentMethodId/set-default',
  setDefaultPaymentMethod,
);
router.get('/payment-methods/default', getDefaultPaymentMethod);

// LOYALTY PROGRAM ROUTES
router.get('/loyalty', getLoyaltyProfile);
router.post('/loyalty/referral', applyReferralCode);

// ADMIN-ONLY ROUTES
router.patch(
  '/loyalty/:userId/points',
  restrictTo('admin'),
  updateLoyaltyPoints,
);

export default router;

// import axios from 'axios';

// const apiClient = axios.create({
//   baseURL: '/api/user-profile', // Replace with your API base URL
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// Add request interceptors if needed
// apiClient.interceptors.request.use(config => {
//   // Add your request interceptor logic here
//   return config;
// });

// Add response interceptors if needed
// apiClient.interceptors.response.use(response => {
//   // Add your response interceptor logic here
//   return response;
// });

// Define your API methods using the apiClient

// Example: Get user profile
// export const getUserProfile = async () => {
//   try {
//     const response = await apiClient.get('/profile');
//     return response.data;
//   } catch (error) {
//     // Handle error
//     console.error(error);
//     throw error;
//   }
// };

// // Example: Update user preferences
// export const updateUserPreferences = async (data) => {
//   try {
//     const response = await apiClient.patch('/preferences', data);
//     return response.data;
//   } catch (error) {
//     // Handle error
//     console.error(error);
//     throw error;
//   }
// };

// // Add similar methods for other routes as needed

// export default apiClient;

// import apiClient from './apiClient';

// const handleUpdatePreferences = async () => {
//   try {
//     const data = {
//       // Add your preferences data here
//     };
//     const updatedPreferences = await apiClient.updateUserPreferences(data);
//     // Handle success
//     console.log(updatedPreferences);
//   } catch (error) {
//     // Handle error
//     console.error(error);
//   }
// };
