import mongoose, { Schema, Document, Types } from 'mongoose';

// Review Media Model
export interface IReviewMedia extends Document {
  _id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  altText?: string;
  uploadedAt: Date;
}

const ReviewMediaSchema = new Schema<IReviewMedia>({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  altText: {
    type: String,
    trim: true,
    maxlength: 200
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Enhanced Review Model
export interface IEnhancedReview extends Document {
  _id: string;
  user: Types.ObjectId;
  product: Types.ObjectId;
  order?: Types.ObjectId; // Link to order for verified purchases
  rating: number;
  title: string;
  comment: string;
  media: IReviewMedia[];
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  verifiedPurchase: boolean;
  helpfulVotes: {
    helpful: number;
    notHelpful: number;
    voters: Types.ObjectId[]; // Users who voted
  };
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
  moderatedBy?: Types.ObjectId;
  moderatedAt?: Date;
  flags: {
    inappropriate: number;
    spam: number;
    fake: number;
    flaggedBy: Types.ObjectId[];
  };
  response?: {
    message: string;
    respondedBy: Types.ObjectId;
    respondedAt: Date;
  };
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EnhancedReviewSchema = new Schema<IEnhancedReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  media: [ReviewMediaSchema],
  pros: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    helpful: {
      type: Number,
      default: 0,
      min: 0
    },
    notHelpful: {
      type: Number,
      default: 0,
      min: 0
    },
    voters: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderationNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  flags: {
    inappropriate: {
      type: Number,
      default: 0,
      min: 0
    },
    spam: {
      type: Number,
      default: 0,
      min: 0
    },
    fake: {
      type: Number,
      default: 0,
      min: 0
    },
    flaggedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    message: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Review Analytics Model
export interface IReviewAnalytics extends Document {
  _id: string;
  productId: Types.ObjectId;
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;
  metrics: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    verifiedPurchasePercentage: number;
    withMediaPercentage: number;
    averageHelpfulness: number;
    recommendationRate: number;
  };
}

const ReviewAnalyticsSchema = new Schema<IReviewAnalytics>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  metrics: {
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingDistribution: {
      1: { type: Number, default: 0, min: 0 },
      2: { type: Number, default: 0, min: 0 },
      3: { type: Number, default: 0, min: 0 },
      4: { type: Number, default: 0, min: 0 },
      5: { type: Number, default: 0, min: 0 }
    },
    verifiedPurchasePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    withMediaPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageHelpfulness: {
      type: Number,
      default: 0,
      min: 0
    },
    recommendationRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// Review Template Model (for guided reviews)
export interface IReviewTemplate extends Document {
  _id: string;
  name: string;
  description: string;
  categoryId?: Types.ObjectId;
  questions: {
    question: string;
    type: 'rating' | 'text' | 'boolean' | 'multiple_choice';
    required: boolean;
    options?: string[]; // For multiple choice
    placeholder?: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewTemplateSchema = new Schema<IReviewTemplate>({
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
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  questions: [{
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    type: {
      type: String,
      enum: ['rating', 'text', 'boolean', 'multiple_choice'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [{
      type: String,
      trim: true
    }],
    placeholder: {
      type: String,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
EnhancedReviewSchema.index({ product: 1, moderationStatus: 1 });
EnhancedReviewSchema.index({ user: 1, createdAt: -1 });
EnhancedReviewSchema.index({ verifiedPurchase: 1 });
EnhancedReviewSchema.index({ rating: 1 });
EnhancedReviewSchema.index({ 'helpfulVotes.helpful': -1 });
EnhancedReviewSchema.index({ moderationStatus: 1, createdAt: -1 });

ReviewAnalyticsSchema.index({ productId: 1, period: 1, date: -1 });

ReviewTemplateSchema.index({ categoryId: 1, isActive: 1 });

// Ensure one review per user per product
EnhancedReviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Virtual for helpfulness score
EnhancedReviewSchema.virtual('helpfulnessScore').get(function() {
  const total = this.helpfulVotes.helpful + this.helpfulVotes.notHelpful;
  if (total === 0) return 0;
  return this.helpfulVotes.helpful / total;
});

// Virtual for total flags
EnhancedReviewSchema.virtual('totalFlags').get(function() {
  return this.flags.inappropriate + this.flags.spam + this.flags.fake;
});

// Pre-save middleware to set verified purchase
EnhancedReviewSchema.pre('save', async function(next) {
  if (this.isNew && this.order) {
    this.verifiedPurchase = true;
  }
  next();
});

// Pre-save middleware for auto-moderation
EnhancedReviewSchema.pre('save', function(next) {
  // Calculate total flags
  const totalFlags = this.flags.inappropriate + this.flags.spam + this.flags.fake;
  
  // Auto-approve reviews from verified purchases with no flags
  if (this.isNew && this.verifiedPurchase && totalFlags === 0) {
    this.moderationStatus = 'approved';
  }
  
  // Auto-flag reviews with excessive flags
  if (totalFlags >= 5) {
    this.moderationStatus = 'flagged';
  }
  
  next();
});

export const EnhancedReview = mongoose.model<IEnhancedReview>('EnhancedReview', EnhancedReviewSchema);
export const ReviewAnalytics = mongoose.model<IReviewAnalytics>('ReviewAnalytics', ReviewAnalyticsSchema);
export const ReviewTemplate = mongoose.model<IReviewTemplate>('ReviewTemplate', ReviewTemplateSchema);
