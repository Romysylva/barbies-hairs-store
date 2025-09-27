import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICartItem extends Document {
  _id: string;
  product: Types.ObjectId;
  variation?: Types.ObjectId;
  quantity: number;
  price: number; // Price at time of adding to cart
  selectedAttributes?: Record<string, string>;
  personalization?: Record<string, string>;
  addedAt: Date;
  savedForLater: boolean;
}

export interface IAppliedCoupon extends Document {
  coupon: Types.ObjectId;
  discountAmount: number;
  appliedAt: Date;
}

export interface ICart extends Document {
  _id: string;
  userId?: Types.ObjectId;
  sessionId?: string; // For guest carts
  items: ICartItem[];
  savedItems: ICartItem[]; // Saved for later
  totalItems: number;
  subtotal: number;
  taxes: number;
  shipping: number;
  discounts: number;
  totalAmount: number;
  appliedCoupons: IAppliedCoupon[];
  shippingMethod?: Types.ObjectId;
  estimatedDelivery?: Date;
  currency: string;
  lastUpdated: Date;
  expiresAt?: Date; // For guest carts
}

const CartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variation: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariation'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 99
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  selectedAttributes: {
    type: Map,
    of: String
  },
  personalization: {
    type: Map,
    of: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  savedForLater: {
    type: Boolean,
    default: false
  }
});

const AppliedCouponSchema = new Schema<IAppliedCoupon>({
  coupon: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const CartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  sessionId: {
    type: String,
    sparse: true
  },
  items: [CartItemSchema],
  savedItems: [CartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  taxes: {
    type: Number,
    default: 0,
    min: 0
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  discounts: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  appliedCoupons: [AppliedCouponSchema],
  shippingMethod: {
    type: Schema.Types.ObjectId,
    ref: 'ShippingMethod'
  },
  estimatedDelivery: {
    type: Date
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    // Guest carts expire after 30 days
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
CartSchema.index({ userId: 1 }, { sparse: true });
CartSchema.index({ sessionId: 1 }, { sparse: true });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
CartSchema.index({ lastUpdated: 1 });

// Ensure either userId or sessionId exists
CartSchema.pre('validate', function(next) {
  if (!this.userId && !this.sessionId) {
    const error = new Error('Cart must have either userId or sessionId');
    return next(error);
  }
  next();
});

// Calculate totals before saving
CartSchema.pre('save', function(next) {
  // Calculate total items
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate discounts from applied coupons
  this.discounts = this.appliedCoupons.reduce((total, applied) => total + applied.discountAmount, 0);
  
  // Calculate tax (8% for now - should be configurable)
  const taxRate = 0.08;
  this.taxes = Math.round((this.subtotal - this.discounts) * taxRate * 100) / 100;
  
  // Calculate total
  this.totalAmount = this.subtotal + this.taxes + this.shipping - this.discounts;
  
  // Update last updated timestamp
  this.lastUpdated = new Date();
  
  next();
});

// Virtual for active items (not saved for later)
CartSchema.virtual('activeItems').get(function() {
  return this.items.filter(item => !item.savedForLater);
});

// Static methods
CartSchema.statics.findUserCart = function(userId: string) {
  return this.findOne({ userId }).populate('items.product appliedCoupons.coupon shippingMethod');
};

CartSchema.statics.findGuestCart = function(sessionId: string) {
  return this.findOne({ sessionId }).populate('items.product appliedCoupons.coupon shippingMethod');
};

CartSchema.statics.createUserCart = function(userId: string) {
  return this.create({ userId, items: [], savedItems: [], appliedCoupons: [] });
};

CartSchema.statics.createGuestCart = function(sessionId: string) {
  return this.create({ sessionId, items: [], savedItems: [], appliedCoupons: [] });
};

export const Cart = mongoose.model<ICart>('Cart', CartSchema);

// Coupon Model
export interface ICoupon extends Document {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableProducts?: Types.ObjectId[];
  applicableCategories?: Types.ObjectId[];
  excludedProducts?: Types.ObjectId[];
  excludedCategories?: Types.ObjectId[];
  firstTimeCustomerOnly: boolean;
  autoApply: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumAmount: {
    type: Number,
    min: 0
  },
  maximumDiscount: {
    type: Number,
    min: 0
  },
  usageLimit: {
    type: Number,
    min: 1
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  userUsageLimit: {
    type: Number,
    min: 1,
    default: 1
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  firstTimeCustomerOnly: {
    type: Boolean,
    default: false
  },
  autoApply: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });
CouponSchema.index({ autoApply: 1, isActive: 1 });

// Validate date range
CouponSchema.pre('validate', function(next) {
  if (this.validFrom >= this.validTo) {
    const error = new Error('Valid from date must be before valid to date');
    return next(error);
  }
  next();
});

// Virtual for checking if coupon is currently valid
CouponSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validTo >= now &&
         (!this.usageLimit || this.usageCount < this.usageLimit);
});

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);

// Shipping Method Model
export interface IShippingMethod extends Document {
  _id: string;
  name: string;
  description: string;
  carrier: string;
  cost: number;
  estimatedDays: number;
  trackingIncluded: boolean;
  insuranceIncluded: boolean;
  signatureRequired: boolean;
  restrictions?: string[];
  isActive: boolean;
  freeShippingThreshold?: number;
  weightLimit?: number;
  sizeLimit?: {
    length: number;
    width: number;
    height: number;
  };
}

const ShippingMethodSchema = new Schema<IShippingMethod>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  carrier: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDays: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  trackingIncluded: {
    type: Boolean,
    default: true
  },
  insuranceIncluded: {
    type: Boolean,
    default: false
  },
  signatureRequired: {
    type: Boolean,
    default: false
  },
  restrictions: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  freeShippingThreshold: {
    type: Number,
    min: 0
  },
  weightLimit: {
    type: Number,
    min: 0
  },
  sizeLimit: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  }
}, {
  timestamps: true
});

ShippingMethodSchema.index({ isActive: 1, cost: 1 });

export const ShippingMethod = mongoose.model<IShippingMethod>('ShippingMethod', ShippingMethodSchema);
