import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWishlistItem extends Document {
  _id: string;
  product: Types.ObjectId;
  variation?: Types.ObjectId;
  addedAt: Date;
  notes?: string;
  priceAlert?: {
    enabled: boolean;
    targetPrice: number;
  };
  stockAlert?: boolean;
}

export interface IWishlist extends Document {
  _id: string;
  userId: Types.ObjectId;
  items: IWishlistItem[];
  name: string;
  privacy: 'private' | 'public' | 'shared';
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variation: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariation',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    priceAlert: {
      enabled: {
        type: Boolean,
        default: false,
      },
      targetPrice: {
        type: Number,
        min: 0,
      },
    },
    stockAlert: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [WishlistItemSchema],
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: 'My Wishlist',
    },
    privacy: {
      type: String,
      enum: ['private', 'public', 'shared'],
      default: 'private',
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
WishlistSchema.index({ userId: 1, name: 1 });
WishlistSchema.index({ shareToken: 1 });
WishlistSchema.index({ 'items.product': 1 });

// Virtual for total items count
WishlistSchema.virtual('totalItems').get(function () {
  return this.items.length;
});

// Generate share token when privacy is set to 'shared'
WishlistSchema.pre('save', function (next) {
  if (this.privacy === 'shared' && !this.shareToken) {
    this.shareToken = generateShareToken();
  } else if (this.privacy !== 'shared') {
    this.shareToken = undefined;
  }
  next();
});

// Remove duplicate products in wishlist
WishlistSchema.pre('save', function (next) {
  const uniqueItems = new Map();

  this.items.forEach((item) => {
    const key = `${item.product}_${item.variation || ''}`;
    if (!uniqueItems.has(key)) {
      uniqueItems.set(key, item);
    }
  });

  this.items = Array.from(uniqueItems.values());
  next();
});

// Helper function to generate share token
function generateShareToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Static methods
WishlistSchema.statics.findByShareToken = function (token: string) {
  return this.findOne({ shareToken: token, privacy: 'shared' });
};

WishlistSchema.statics.getUserWishlists = function (userId: string) {
  return this.find({ userId }).populate('items.product');
};

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);

// Stock Alert Model
export interface IStockAlert extends Document {
  _id: string;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  variationId?: Types.ObjectId;
  email: string;
  phone?: string;
  notifyEmail: boolean;
  notifySms: boolean;
  isActive: boolean;
  notifiedAt?: Date;
  createdAt: Date;
}

const StockAlertSchema = new Schema<IStockAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variationId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariation',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    notifyEmail: {
      type: Boolean,
      default: true,
    },
    notifySms: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate alerts
StockAlertSchema.index(
  { userId: 1, productId: 1, variationId: 1 },
  { unique: true },
);
StockAlertSchema.index({ productId: 1, isActive: 1 });

export const StockAlert = mongoose.model<IStockAlert>(
  'StockAlert',
  StockAlertSchema,
);
