import express from 'express';
import {
  trackInteraction,
  getHomepageRecommendations,
  getProductPageRecommendations,
  getCartRecommendations,
  getTrendingProducts,
  getRecentlyViewed,
  updateProductSimilarities,
  updateTrendingProducts,
  getRecommendationAnalytics
} from '../controllers/recommendationController.js';
import { protect, restrictTo } from '../middlewares/authmiddleware.js';

const router = express.Router();

// PUBLIC ROUTES (no authentication required)
router.get('/trending', getTrendingProducts);
router.get('/homepage', getHomepageRecommendations);
router.get('/product/:productId/similar', getProductPageRecommendations);

// TRACKING ROUTES (optional authentication)
router.post('/track', trackInteraction);

// AUTHENTICATED ROUTES
router.use(protect);

// USER-SPECIFIC RECOMMENDATIONS
router.get('/recently-viewed', getRecentlyViewed);
router.post('/cart/suggestions', getCartRecommendations);

// ADMIN-ONLY ROUTES
router.use(restrictTo('admin'));

// BATCH PROCESSING
router.post('/admin/update-similarities', updateProductSimilarities);
router.post('/admin/update-trending', updateTrendingProducts);

// ANALYTICS
router.get('/admin/analytics', getRecommendationAnalytics);

export default router;
