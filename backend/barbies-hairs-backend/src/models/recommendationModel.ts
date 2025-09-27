import mongoose, { Schema, Document, Types } from 'mongoose';

// User Interaction Model for tracking user behavior
export interface IUserInteraction extends Document {
  _id: string;
  userId?: Types.ObjectId; // Optional for guest users
  sessionId?: string; // For guest tracking
  productId: Types.ObjectId;
  interactionType: 'view' | 'cart_add' | 'cart_remove' | 'wishlist_add' | 'wishlist_remove' | 'purchase' | 'review' | 'search_click';
  metadata?: {
    searchQuery?: string;
    categoryId?: Types.ObjectId;
    fromPage?: string;
    duration?: number; // View duration in seconds
    quantity?: number; // For cart/purchase actions
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const UserInteractionSchema = new Schema<IUserInteraction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    trim: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  interactionType: {
    type: String,
    enum: ['view', 'cart_add', 'cart_remove', 'wishlist_add', 'wishlist_remove', 'purchase', 'review', 'search_click'],
    required: true
  },
  metadata: {
    searchQuery: String,
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },
    fromPage: String,
    duration: Number,
    quantity: Number
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Product Similarity Model
export interface IProductSimilarity extends Document {
  _id: string;
  productId: Types.ObjectId;
  similarProducts: {
    productId: Types.ObjectId;
    score: number;
    reasons: string[]; // ['same_category', 'price_similar', 'frequently_bought_together']
  }[];
  lastUpdated: Date;
}

const ProductSimilaritySchema = new Schema<IProductSimilarity>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  similarProducts: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    reasons: [{
      type: String,
      enum: ['same_category', 'same_brand', 'price_similar', 'frequently_bought_together', 'similar_ratings', 'similar_features']
    }]
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// User Preference Model
export interface IUserPreference extends Document {
  _id: string;
  userId: Types.ObjectId;
  preferences: {
    categories: {
      categoryId: Types.ObjectId;
      score: number; // Weighted preference score
      interactionCount: number;
    }[];
    priceRange: {
      min: number;
      max: number;
      preferred: number;
    };
    brands: {
      name: string;
      score: number;
    }[];
    features: {
      feature: string;
      importance: number; // 1-5 scale
    }[];
  };
  lastUpdated: Date;
}

const UserPreferenceSchema = new Schema<IUserPreference>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preferences: {
    categories: [{
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      },
      interactionCount: {
        type: Number,
        default: 1,
        min: 1
      }
    }],
    priceRange: {
      min: {
        type: Number,
        default: 0,
        min: 0
      },
      max: {
        type: Number,
        default: 1000,
        min: 0
      },
      preferred: {
        type: Number,
        default: 50,
        min: 0
      }
    },
    brands: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      }
    }],
    features: [{
      feature: {
        type: String,
        required: true,
        trim: true
      },
      importance: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      }
    }]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Recommendation Cache Model
export interface IRecommendationCache extends Document {
  _id: string;
  userId?: Types.ObjectId;
  sessionId?: string;
  type: 'homepage' | 'product_page' | 'cart' | 'checkout' | 'category' | 'search' | 'after_purchase';
  context?: {
    productId?: Types.ObjectId;
    categoryId?: Types.ObjectId;
    searchQuery?: string;
    orderId?: Types.ObjectId;
  };
  recommendations: {
    productId: Types.ObjectId;
    score: number;
    reason: string;
    position: number;
  }[];
  expiresAt: Date;
  createdAt: Date;
}

const RecommendationCacheSchema = new Schema<IRecommendationCache>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['homepage', 'product_page', 'cart', 'checkout', 'category', 'search', 'after_purchase'],
    required: true
  },
  context: {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },
    searchQuery: String,
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    }
  },
  recommendations: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Trending Products Model
export interface ITrendingProduct extends Document {
  _id: string;
  productId: Types.ObjectId;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metrics: {
    views: number;
    purchases: number;
    cartAdds: number;
    wishlistAdds: number;
    searchClicks: number;
    conversionRate: number;
    trendingScore: number;
  };
  date: Date;
}

const TrendingProductSchema = new Schema<ITrendingProduct>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  period: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    required: true
  },
  metrics: {
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    purchases: {
      type: Number,
      default: 0,
      min: 0
    },
    cartAdds: {
      type: Number,
      default: 0,
      min: 0
    },
    wishlistAdds: {
      type: Number,
      default: 0,
      min: 0
    },
    searchClicks: {
      type: Number,
      default: 0,
      min: 0
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    trendingScore: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
UserInteractionSchema.index({ userId: 1, createdAt: -1 });
UserInteractionSchema.index({ sessionId: 1, createdAt: -1 });
UserInteractionSchema.index({ productId: 1, interactionType: 1 });
UserInteractionSchema.index({ createdAt: -1 });

ProductSimilaritySchema.index({ productId: 1 });
ProductSimilaritySchema.index({ 'similarProducts.productId': 1 });
ProductSimilaritySchema.index({ lastUpdated: 1 });

UserPreferenceSchema.index({ userId: 1 });
UserPreferenceSchema.index({ lastUpdated: 1 });

RecommendationCacheSchema.index({ userId: 1, type: 1 });
RecommendationCacheSchema.index({ sessionId: 1, type: 1 });
RecommendationCacheSchema.index({ expiresAt: 1 });

TrendingProductSchema.index({ productId: 1, period: 1, date: -1 });
TrendingProductSchema.index({ period: 1, date: -1, 'metrics.trendingScore': -1 });

// Compound indexes for common queries
UserInteractionSchema.index({ userId: 1, productId: 1, interactionType: 1 });
RecommendationCacheSchema.index({ userId: 1, type: 1, 'context.productId': 1 });

// Virtual to calculate interaction strength
UserInteractionSchema.virtual('interactionStrength').get(function() {
  const weights = {
    view: 1,
    cart_add: 3,
    cart_remove: -1,
    wishlist_add: 2,
    wishlist_remove: -1,
    purchase: 5,
    review: 4,
    search_click: 2
  };
  return weights[this.interactionType] || 1;
});

export const UserInteraction = mongoose.model<IUserInteraction>('UserInteraction', UserInteractionSchema);
export const ProductSimilarity = mongoose.model<IProductSimilarity>('ProductSimilarity', ProductSimilaritySchema);
export const UserPreference = mongoose.model<IUserPreference>('UserPreference', UserPreferenceSchema);
export const RecommendationCache = mongoose.model<IRecommendationCache>('RecommendationCache', RecommendationCacheSchema);
export const TrendingProduct = mongoose.model<ITrendingProduct>('TrendingProduct', TrendingProductSchema);
