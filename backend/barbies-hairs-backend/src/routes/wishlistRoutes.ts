import express from 'express';
import {
  getUserWishlists,
  getWishlist,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  shareWishlist,
  getSharedWishlist,
  setPriceAlert,
  setStockAlert,
  moveToCart,
  getUserStockAlerts,
  createStockAlert,
  deleteStockAlert
} from '../controllers/wishlistController.js';
import { protect } from '../middlewares/authmiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Wishlist routes
router.route('/')
  .get(getUserWishlists)
  .post(createWishlist);

router.route('/:id')
  .get(getWishlist)
  .patch(updateWishlist)
  .delete(deleteWishlist);

// Wishlist item management
router.post('/:id/items', addToWishlist);
router.delete('/:id/items/:productId', removeFromWishlist);
router.post('/:id/clear', clearWishlist);

// Wishlist sharing
router.post('/:id/share', shareWishlist);

// Price and stock alerts for wishlist items
router.put('/:id/items/:productId/price-alert', setPriceAlert);
router.put('/:id/items/:productId/stock-alert', setStockAlert);

// Move to cart
router.post('/:id/items/:productId/move-to-cart', moveToCart);

// Stock alerts management
router.route('/stock-alerts')
  .get(getUserStockAlerts)
  .post(createStockAlert);

router.delete('/stock-alerts/:id', deleteStockAlert);

// Public routes (no authentication needed)
const publicRouter = express.Router();
publicRouter.get('/shared/:token', getSharedWishlist);

export default router;
export { publicRouter as wishlistPublicRoutes };
