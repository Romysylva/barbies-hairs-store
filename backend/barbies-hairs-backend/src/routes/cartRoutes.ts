import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  saveForLater,
  moveToCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getAvailableCoupons,
  getShippingMethods,
  updateShippingMethod,
  validateCoupon,
  mergeGuestCart
} from '../controllers/cartController.js';
import { protect } from '../middlewares/authmiddleware.js';

const router = express.Router();

// Cart management (supports both authenticated and guest users)
router.route('/')
  .get(getCart)
  .post(addToCart);

router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.post('/items/:itemId/save-for-later', saveForLater);
router.post('/items/:itemId/move-to-cart', moveToCart);
router.delete('/clear', clearCart);

// Coupon management
router.post('/coupons/apply', applyCoupon);
router.delete('/coupons/:couponId', removeCoupon);
router.get('/coupons/available', getAvailableCoupons);
router.post('/coupons/validate', validateCoupon);

// Shipping
router.get('/shipping/methods', getShippingMethods);
router.put('/shipping/method', updateShippingMethod);

// Merge guest cart (protected route)
router.post('/merge', protect, mergeGuestCart);

export default router;
