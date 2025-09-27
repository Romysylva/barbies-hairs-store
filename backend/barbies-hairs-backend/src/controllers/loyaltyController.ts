import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { 
  LoyaltyTier, 
  PointTransaction, 
  LoyaltyReward, 
  UserRedemption,
  ILoyaltyTier,
  IPointTransaction,
  ILoyaltyReward,
  IUserRedemption
} from '../models/loyaltyModel.js';
import { UserProfile } from '../models/userProfileModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// LOYALTY TIERS

// Get all loyalty tiers
export const getLoyaltyTiers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tiers = await LoyaltyTier.find({ isActive: true }).sort({ level: 1 });

  res.status(200).json({
    success: true,
    data: {
      tiers
    }
  });
});

// Create loyalty tier (admin only)
export const createLoyaltyTier = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tierData = req.body;

  const tier = await LoyaltyTier.create(tierData);

  res.status(201).json({
    success: true,
    data: {
      tier
    }
  });
});

// Update loyalty tier (admin only)
export const updateLoyaltyTier = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { tierId } = req.params;
  const updateData = req.body;

  const tier = await LoyaltyTier.findByIdAndUpdate(
    tierId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!tier) {
    return next(new AppError('Loyalty tier not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      tier
    }
  });
});

// LOYALTY REWARDS

// Get available rewards for user
export const getAvailableRewards = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  // Get user's loyalty profile
  const profile = await UserProfile.findOne({ userId });
  const userTier = profile?.loyaltyProfile?.tier || 'bronze';
  const userPoints = profile?.loyaltyProfile?.points || 0;

  // Find rewards available to user's tier and within points budget
  const now = new Date();
  const rewards = await LoyaltyReward.find({
    isActive: true,
    validFrom: { $lte: now },
    validTo: { $gte: now },
    eligibleTiers: { $in: [userTier] },
    pointsCost: { $lte: userPoints },
    $expr: {
      $or: [
        { $eq: ['$maxRedemptions', null] },
        { $lt: ['$currentRedemptions', '$maxRedemptions'] }
      ]
    }
  }).populate('applicableCategories', 'name').sort({ pointsCost: 1 });

  res.status(200).json({
    success: true,
    data: {
      rewards,
      userPoints,
      userTier
    }
  });
});

// Get all rewards (admin)
export const getAllRewards = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 20, isActive } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const rewards = await LoyaltyReward.find(filter)
    .populate('applicableCategories', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await LoyaltyReward.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      rewards,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        hasNext: skip + rewards.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
});

// Create reward (admin only)
export const createReward = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const rewardData = req.body;

  // Validate dates
  if (new Date(rewardData.validFrom) >= new Date(rewardData.validTo)) {
    return next(new AppError('Valid from date must be before valid to date', 400));
  }

  const reward = await LoyaltyReward.create(rewardData);

  res.status(201).json({
    success: true,
    data: {
      reward
    }
  });
});

// Update reward (admin only)
export const updateReward = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { rewardId } = req.params;
  const updateData = req.body;

  const reward = await LoyaltyReward.findByIdAndUpdate(
    rewardId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!reward) {
    return next(new AppError('Reward not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      reward
    }
  });
});

// Redeem reward
export const redeemReward = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { rewardId } = req.params;
  
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  // Get reward details
  const reward = await LoyaltyReward.findById(rewardId);
  
  if (!reward) {
    return next(new AppError('Reward not found', 404));
  }

  // Check if reward is available
  const now = new Date();
  if (!reward.isActive || now < reward.validFrom || now > reward.validTo) {
    return next(new AppError('Reward is not currently available', 400));
  }

  // Check redemption limit
  if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
    return next(new AppError('Reward redemption limit reached', 400));
  }

  // Get user profile
  const profile = await UserProfile.findOne({ userId });
  
  if (!profile?.loyaltyProfile) {
    return next(new AppError('User loyalty profile not found', 404));
  }

  // Check if user has enough points
  if (profile.loyaltyProfile.points < reward.pointsCost) {
    return next(new AppError('Insufficient points for this reward', 400));
  }

  // Check if user's tier is eligible
  if (!reward.eligibleTiers.includes(profile.loyaltyProfile.tier)) {
    return next(new AppError('Your tier is not eligible for this reward', 400));
  }

  // Create redemption record
  const redemption = await UserRedemption.create({
    userId,
    rewardId,
    pointsUsed: reward.pointsCost,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  // Deduct points from user
  profile.loyaltyProfile.points -= reward.pointsCost;
  await profile.save();

  // Create point transaction record
  await PointTransaction.create({
    userId,
    type: 'redeemed',
    amount: -reward.pointsCost,
    reason: `Redeemed reward: ${reward.name}`,
    rewardId
  });

  // Increment reward redemption count
  reward.currentRedemptions += 1;
  await reward.save();

  await redemption.populate('rewardId', 'name description type value');

  res.status(201).json({
    success: true,
    message: 'Reward redeemed successfully!',
    data: {
      redemption,
      remainingPoints: profile.loyaltyProfile.points
    }
  });
});

// Get user redemptions
export const getUserRedemptions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { page = 1, limit = 20, status } = req.query;
  
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const skip = (Number(page) - 1) * Number(limit);
  const filter: any = { userId };
  
  if (status) {
    filter.status = status;
  }

  const redemptions = await UserRedemption.find(filter)
    .populate('rewardId', 'name description type value')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await UserRedemption.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      redemptions,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        hasNext: skip + redemptions.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
});

// POINT TRANSACTIONS

// Get user point transactions
export const getPointTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { page = 1, limit = 20, type } = req.query;
  
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const skip = (Number(page) - 1) * Number(limit);
  const filter: any = { userId };
  
  if (type) {
    filter.type = type;
  }

  const transactions = await PointTransaction.find(filter)
    .populate('orderId', 'orderNumber total')
    .populate('rewardId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await PointTransaction.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      transactions,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        hasNext: skip + transactions.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
});

// Award points for order (internal use)
export const awardPointsForOrder = async (userId: Types.ObjectId, orderId: Types.ObjectId, orderTotal: number) => {
  try {
    // Get user profile to determine tier multiplier
    const profile = await UserProfile.findOne({ userId });
    
    if (!profile?.loyaltyProfile) {
      return;
    }

    // Get tier benefits
    const tier = await LoyaltyTier.findOne({ 
      name: profile.loyaltyProfile.tier,
      isActive: true 
    });

    const basePoints = Math.floor(orderTotal); // 1 point per dollar
    const multiplier = tier?.benefits.pointsMultiplier || 1;
    const totalPoints = Math.floor(basePoints * multiplier);

    if (totalPoints > 0) {
      // Update user points
      profile.loyaltyProfile.points += totalPoints;
      profile.loyaltyProfile.lifetimePoints += totalPoints;

      // Update tier if necessary
      await updateUserTier(profile);
      await profile.save();

      // Create transaction record
      await PointTransaction.create({
        userId,
        type: 'earned',
        amount: totalPoints,
        reason: `Order purchase (${multiplier}x multiplier)`,
        orderId,
        metadata: {
          multiplier,
          originalAmount: basePoints,
          tier: profile.loyaltyProfile.tier
        }
      });
    }

    return totalPoints;
  } catch (error) {
    console.error('Error awarding points for order:', error);
    return 0;
  }
};

// Helper function to update user tier
async function updateUserTier(profile: any) {
  const lifetimePoints = profile.loyaltyProfile.lifetimePoints;
  
  // Get all tiers to determine correct tier
  const tiers = await LoyaltyTier.find({ isActive: true }).sort({ level: -1 });
  
  let newTier = 'bronze';
  for (const tier of tiers) {
    if (lifetimePoints >= tier.minLifetimePoints) {
      if (!tier.maxLifetimePoints || lifetimePoints <= tier.maxLifetimePoints) {
        newTier = tier.name;
        break;
      }
    }
  }

  profile.loyaltyProfile.tier = newTier;
}

// Award bonus points (admin)
export const awardBonusPoints = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const { points, reason } = req.body;

  if (!points || typeof points !== 'number' || points <= 0) {
    return next(new AppError('Valid points amount is required', 400));
  }

  if (!reason) {
    return next(new AppError('Reason is required', 400));
  }

  const profile = await UserProfile.findOne({ userId });
  
  if (!profile) {
    return next(new AppError('User not found', 404));
  }

  if (!profile.loyaltyProfile) {
    profile.loyaltyProfile = {
      tier: 'bronze',
      points: 0,
      lifetimePoints: 0,
      referralCode: generateReferralCode()
    };
  }

  // Add bonus points
  profile.loyaltyProfile.points += points;
  profile.loyaltyProfile.lifetimePoints += points;

  // Update tier
  await updateUserTier(profile);
  await profile.save();

  // Create transaction record
  await PointTransaction.create({
    userId,
    type: 'bonus',
    amount: points,
    reason
  });

  res.status(200).json({
    success: true,
    message: `Awarded ${points} bonus points successfully`,
    data: {
      loyaltyProfile: profile.loyaltyProfile
    }
  });
});

// Get loyalty dashboard data
export const getLoyaltyDashboard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  // Get user profile
  let profile = await UserProfile.findOne({ userId });
  
  if (!profile?.loyaltyProfile) {
    // Create default loyalty profile
    await UserProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          loyaltyProfile: {
            tier: 'bronze',
            points: 0,
            lifetimePoints: 0,
            referralCode: generateReferralCode()
          }
        }
      },
      { upsert: true, new: true }
    );
    
    profile = await UserProfile.findOne({ userId });
  }

  // Get current tier info
  const currentTierInfo = await LoyaltyTier.findOne({ 
    name: profile!.loyaltyProfile!.tier,
    isActive: true 
  });

  // Get next tier info
  const nextTierInfo = await LoyaltyTier.findOne({
    level: { $gt: currentTierInfo?.level || 1 },
    isActive: true
  }).sort({ level: 1 });

  // Get recent transactions
  const recentTransactions = await PointTransaction.find({ userId })
    .populate('orderId', 'orderNumber')
    .populate('rewardId', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

  // Get available rewards count
  const availableRewardsCount = await LoyaltyReward.countDocuments({
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() },
    eligibleTiers: { $in: [profile!.loyaltyProfile!.tier] },
    pointsCost: { $lte: profile!.loyaltyProfile!.points },
    $expr: {
      $or: [
        { $eq: ['$maxRedemptions', null] },
        { $lt: ['$currentRedemptions', '$maxRedemptions'] }
      ]
    }
  });

  // Calculate points to next tier
  let pointsToNextTier = null;
  if (nextTierInfo) {
    pointsToNextTier = nextTierInfo.minLifetimePoints - profile!.loyaltyProfile!.lifetimePoints;
  }

  res.status(200).json({
    success: true,
    data: {
      loyaltyProfile: profile!.loyaltyProfile,
      currentTier: currentTierInfo,
      nextTier: nextTierInfo,
      pointsToNextTier,
      recentTransactions,
      availableRewardsCount,
      stats: {
        totalPointsEarned: profile!.loyaltyProfile!.lifetimePoints,
        pointsThisMonth: await getPointsThisMonth(new Types.ObjectId(userId)),
        totalRedemptions: await UserRedemption.countDocuments({ userId })
      }
    }
  });
});

// Helper function to get points earned this month
async function getPointsThisMonth(userId: Types.ObjectId): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const transactions = await PointTransaction.find({
    userId,
    type: { $in: ['earned', 'bonus'] },
    createdAt: { $gte: startOfMonth }
  });

  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

// Apply redemption code
export const applyRedemptionCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { redemptionCode, orderId } = req.body;
  
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!redemptionCode) {
    return next(new AppError('Redemption code is required', 400));
  }

  // Find the redemption
  const redemption = await UserRedemption.findOne({
    userId,
    redemptionCode,
    status: 'pending'
  }).populate('rewardId');

  if (!redemption) {
    return next(new AppError('Invalid or expired redemption code', 400));
  }

  // Check if redemption is expired
  if (redemption.expiresAt < new Date()) {
    redemption.status = 'expired';
    await redemption.save();
    return next(new AppError('Redemption code has expired', 400));
  }

  // Apply redemption
  redemption.status = 'applied';
  redemption.usedAt = new Date();
  if (orderId) {
    redemption.orderId = orderId;
  }
  await redemption.save();

  res.status(200).json({
    success: true,
    message: 'Redemption code applied successfully!',
    data: {
      redemption
    }
  });
});

// Get loyalty analytics (admin)
export const getLoyaltyAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);

  // Points statistics
  const pointsStats = await PointTransaction.aggregate([
    ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);

  // User tier distribution
  const tierDistribution = await UserProfile.aggregate([
    { $match: { loyaltyProfile: { $exists: true } } },
    {
      $group: {
        _id: '$loyaltyProfile.tier',
        count: { $sum: 1 },
        avgPoints: { $avg: '$loyaltyProfile.points' },
        avgLifetimePoints: { $avg: '$loyaltyProfile.lifetimePoints' }
      }
    }
  ]);

  // Reward redemption stats
  const rewardStats = await UserRedemption.aggregate([
    ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
    {
      $lookup: {
        from: 'loyaltyrewards',
        localField: 'rewardId',
        foreignField: '_id',
        as: 'reward'
      }
    },
    { $unwind: '$reward' },
    {
      $group: {
        _id: '$reward.name',
        totalRedemptions: { $sum: 1 },
        totalPointsUsed: { $sum: '$pointsUsed' },
        rewardType: { $first: '$reward.type' }
      }
    },
    { $sort: { totalRedemptions: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      pointsStats,
      tierDistribution,
      rewardStats,
      summary: {
        totalActiveUsers: await UserProfile.countDocuments({ loyaltyProfile: { $exists: true } }),
        totalPointsInCirculation: await getTotalPointsInCirculation(),
        totalRedemptions: await UserRedemption.countDocuments(),
        averagePointsPerUser: await getAveragePointsPerUser()
      }
    }
  });
});

// Helper functions
async function getTotalPointsInCirculation(): Promise<number> {
  const result = await UserProfile.aggregate([
    { $match: { loyaltyProfile: { $exists: true } } },
    { $group: { _id: null, total: { $sum: '$loyaltyProfile.points' } } }
  ]);
  return result[0]?.total || 0;
}

async function getAveragePointsPerUser(): Promise<number> {
  const result = await UserProfile.aggregate([
    { $match: { loyaltyProfile: { $exists: true } } },
    { $group: { _id: null, avg: { $avg: '$loyaltyProfile.points' } } }
  ]);
  return Math.round(result[0]?.avg || 0);
}

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Process expired points (scheduled job)
export const processExpiredPoints = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const now = new Date();
  
  // Find expired point transactions
  const expiredTransactions = await PointTransaction.find({
    type: 'earned',
    expiresAt: { $lte: now }
  });

  let totalExpiredPoints = 0;
  
  for (const transaction of expiredTransactions) {
    // Deduct points from user profile
    const profile = await UserProfile.findOne({ userId: transaction.userId });
    
    if (profile?.loyaltyProfile) {
      const pointsToDeduct = Math.min(transaction.amount, profile.loyaltyProfile.points);
      
      if (pointsToDeduct > 0) {
        profile.loyaltyProfile.points -= pointsToDeduct;
        await profile.save();

        // Create expiration transaction
        await PointTransaction.create({
          userId: transaction.userId,
          type: 'expired',
          amount: -pointsToDeduct,
          reason: 'Points expired',
          metadata: {
            originalTransactionId: transaction._id
          }
        });

        totalExpiredPoints += pointsToDeduct;
      }
    }
  }

  res.status(200).json({
    success: true,
    message: `Processed ${expiredTransactions.length} expired transactions`,
    data: {
      totalExpiredPoints,
      expiredTransactions: expiredTransactions.length
    }
  });
});
