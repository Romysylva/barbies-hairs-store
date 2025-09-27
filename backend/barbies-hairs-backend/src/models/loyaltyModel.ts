import mongoose, { Schema, Document, Types } from 'mongoose';

// Loyalty Tier Configuration
export interface ILoyaltyTier extends Document {
  _id: string;
  name: string;
  level: number;
  minLifetimePoints: number;
  maxLifetimePoints?: number;
  benefits: {
    pointsMultiplier: number; // e.g., 1.5x points for gold tier
    freeShippingThreshold: number;
    earlyAccessDays: number;
    birthdayBonus: number;
    exclusiveOffers: boolean;
    prioritySupport: boolean;
  };
  badgeColor: string;
  description: string;
  isActive: boolean;
}

const LoyaltyTierSchema = new Schema<ILoyaltyTier>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  level: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  minLifetimePoints: {
    type: Number,
    required: true,
    min: 0
  },
  maxLifetimePoints: {
    type: Number,
    min: 0
  },
  benefits: {
    pointsMultiplier: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    freeShippingThreshold: {
      type: Number,
      default: 50,
      min: 0
    },
    earlyAccessDays: {
      type: Number,
      default: 0,
      min: 0,
      max: 30
    },
    birthdayBonus: {
      type: Number,
      default: 0,
      min: 0
    },
    exclusiveOffers: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    }
  },
  badgeColor: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Point Transaction Model
export interface IPointTransaction extends Document {
  _id: string;
  userId: Types.ObjectId;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'refund';
  amount: number;
  reason: string;
  orderId?: Types.ObjectId;
  rewardId?: Types.ObjectId;
  metadata?: {
    multiplier?: number;
    originalAmount?: number;
    tier?: string;
  };
  expiresAt?: Date;
  createdAt: Date;
}

const PointTransactionSchema = new Schema<IPointTransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'redeemed', 'expired', 'bonus', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  rewardId: {
    type: Schema.Types.ObjectId,
    ref: 'LoyaltyReward'
  },
  metadata: {
    multiplier: Number,
    originalAmount: Number,
    tier: String
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Loyalty Reward Model
export interface ILoyaltyReward extends Document {
  _id: string;
  name: string;
  description: string;
  type: 'discount_percentage' | 'discount_fixed' | 'free_shipping' | 'free_product' | 'bonus_points';
  pointsCost: number;
  value: number; // Discount amount or product value
  minimumOrderValue?: number;
  maxRedemptions?: number;
  currentRedemptions: number;
  eligibleTiers: string[];
  applicableCategories?: Types.ObjectId[];
  validFrom: Date;
  validTo: Date;
  terms: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LoyaltyRewardSchema = new Schema<ILoyaltyReward>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['discount_percentage', 'discount_fixed', 'free_shipping', 'free_product', 'bonus_points'],
    required: true
  },
  pointsCost: {
    type: Number,
    required: true,
    min: 1
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderValue: {
    type: Number,
    min: 0
  },
  maxRedemptions: {
    type: Number,
    min: 1
  },
  currentRedemptions: {
    type: Number,
    default: 0,
    min: 0
  },
  eligibleTiers: [{
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum']
  }],
  applicableCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  terms: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// User Reward Redemption Model
export interface IUserRedemption extends Document {
  _id: string;
  userId: Types.ObjectId;
  rewardId: Types.ObjectId;
  orderId?: Types.ObjectId;
  pointsUsed: number;
  status: 'pending' | 'applied' | 'expired' | 'cancelled';
  redemptionCode?: string;
  usedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

const UserRedemptionSchema = new Schema<IUserRedemption>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardId: {
    type: Schema.Types.ObjectId,
    ref: 'LoyaltyReward',
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  pointsUsed: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'applied', 'expired', 'cancelled'],
    default: 'pending'
  },
  redemptionCode: {
    type: String,
    unique: true,
    sparse: true
  },
  usedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Generate redemption code
UserRedemptionSchema.pre('save', function(next) {
  if (this.isNew && !this.redemptionCode) {
    this.redemptionCode = generateRedemptionCode();
  }
  next();
});

// Indexes
LoyaltyTierSchema.index({ level: 1 });
LoyaltyTierSchema.index({ minLifetimePoints: 1 });

PointTransactionSchema.index({ userId: 1, createdAt: -1 });
PointTransactionSchema.index({ type: 1 });
PointTransactionSchema.index({ expiresAt: 1 });

LoyaltyRewardSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });
LoyaltyRewardSchema.index({ pointsCost: 1 });
LoyaltyRewardSchema.index({ eligibleTiers: 1 });

UserRedemptionSchema.index({ userId: 1, createdAt: -1 });
UserRedemptionSchema.index({ status: 1 });
UserRedemptionSchema.index({ redemptionCode: 1 });

function generateRedemptionCode(): string {
  return 'RDM' + Math.random().toString(36).substring(2, 12).toUpperCase();
}

// Virtual to check if reward is available
LoyaltyRewardSchema.virtual('isAvailable').get(function() {
  const now = new Date();
  const isTimeValid = now >= this.validFrom && now <= this.validTo;
  const hasRedemptionsLeft = !this.maxRedemptions || this.currentRedemptions < this.maxRedemptions;
  return this.isActive && isTimeValid && hasRedemptionsLeft;
});

export const LoyaltyTier = mongoose.model<ILoyaltyTier>('LoyaltyTier', LoyaltyTierSchema);
export const PointTransaction = mongoose.model<IPointTransaction>('PointTransaction', PointTransactionSchema);
export const LoyaltyReward = mongoose.model<ILoyaltyReward>('LoyaltyReward', LoyaltyRewardSchema);
export const UserRedemption = mongoose.model<IUserRedemption>('UserRedemption', UserRedemptionSchema);
