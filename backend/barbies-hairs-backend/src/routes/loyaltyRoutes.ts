import express from 'express';
import {
  getLoyaltyTiers,
  createLoyaltyTier,
  updateLoyaltyTier,
  getAvailableRewards,
  getAllRewards,
  createReward,
  updateReward,
  redeemReward,
  getUserRedemptions,
  getPointTransactions,
  awardBonusPoints,
  getLoyaltyDashboard,
  applyRedemptionCode,
  getLoyaltyAnalytics,
  processExpiredPoints
} from '../controllers/loyaltyController.js';
import { protect, restrictTo } from '../middlewares/authmiddleware.js';

const router = express.Router();

// PUBLIC ROUTES
router.get('/tiers', getLoyaltyTiers);

// PROTECTED ROUTES (require authentication)
router.use(protect);

// USER LOYALTY DASHBOARD
router.get('/dashboard', getLoyaltyDashboard);

// REWARDS
router.get('/rewards', getAvailableRewards);
router.post('/rewards/:rewardId/redeem', redeemReward);
router.post('/redemptions/apply', applyRedemptionCode);

// USER REDEMPTIONS & TRANSACTIONS
router.get('/redemptions', getUserRedemptions);
router.get('/transactions', getPointTransactions);

// ADMIN-ONLY ROUTES
router.use(restrictTo('admin'));

// TIER MANAGEMENT
router.post('/tiers', createLoyaltyTier);
router.patch('/tiers/:tierId', updateLoyaltyTier);

// REWARD MANAGEMENT
router.get('/admin/rewards', getAllRewards);
router.post('/admin/rewards', createReward);
router.patch('/admin/rewards/:rewardId', updateReward);

// POINTS MANAGEMENT
router.post('/admin/users/:userId/bonus-points', awardBonusPoints);
router.post('/admin/process-expired-points', processExpiredPoints);

// ANALYTICS
router.get('/admin/analytics', getLoyaltyAnalytics);

export default router;
