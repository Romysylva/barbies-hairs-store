import mongoose, { Schema, Document, Types } from 'mongoose';

// Address Model
export interface IAddress extends Document {
  _id: string;
  type: 'shipping' | 'billing';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  instructions?: string;
}

const AddressSchema = new Schema<IAddress>({
  type: {
    type: String,
    enum: ['shipping', 'billing'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  address1: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  address2: {
    type: String,
    trim: true,
    maxlength: 200
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'United States'
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[\d+\-\s()]+$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Virtual for full name
AddressSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted address
AddressSchema.virtual('formattedAddress').get(function() {
  let address = this.address1;
  if (this.address2) address += `, ${this.address2}`;
  address += `\n${this.city}, ${this.state} ${this.zipCode}`;
  address += `\n${this.country}`;
  return address;
});

export const Address = mongoose.model<IAddress>('Address', AddressSchema);

// Payment Method Model
export interface IPaymentMethod extends Document {
  _id: string;
  type: 'card' | 'paypal' | 'applepay' | 'googlepay' | 'banktransfer';
  isDefault: boolean;
  name: string;
  // Card details (tokenized/encrypted)
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  cardToken?: string; // For secure storage
  // PayPal
  paypalEmail?: string;
  paypalToken?: string;
  // Bank transfer
  bankName?: string;
  accountLast4?: string;
  routingNumber?: string;
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>({
  type: {
    type: String,
    enum: ['card', 'paypal', 'applepay', 'googlepay', 'banktransfer'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  // Card details (should be tokenized in production)
  cardLast4: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^\d{4}$/.test(v);
      },
      message: 'Card last 4 digits must be exactly 4 numbers'
    }
  },
  cardBrand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'other'],
    trim: true
  },
  cardExpiry: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^(0[1-9]|1[0-2])\/\d{2}$/.test(v);
      },
      message: 'Card expiry must be in MM/YY format'
    }
  },
  cardToken: {
    type: String,
    trim: true,
    select: false // Never return in queries
  },
  // PayPal
  paypalEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid PayPal email'
    }
  },
  paypalToken: {
    type: String,
    trim: true,
    select: false
  },
  // Bank transfer
  bankName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  accountLast4: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^\d{4}$/.test(v);
      },
      message: 'Account last 4 digits must be exactly 4 numbers'
    }
  },
  routingNumber: {
    type: String,
    trim: true,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one default payment method per user
PaymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // Remove default from other payment methods for this user
    // Note: This requires the parent user reference, which we'll handle in the controller
  }
  next();
});

export const PaymentMethod = mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);

// User Profile Extension Model (to store addresses and payment methods)
export interface IUserProfile extends Document {
  _id: string;
  userId: Types.ObjectId;
  addresses: IAddress[];
  paymentMethods: IPaymentMethod[];
  preferences: {
    defaultShippingAddress?: Types.ObjectId;
    defaultBillingAddress?: Types.ObjectId;
    defaultPaymentMethod?: Types.ObjectId;
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    marketingEmails: boolean;
  };
  loyaltyProfile?: {
    tier: string;
    points: number;
    lifetimePoints: number;
    referralCode: string;
    referredBy?: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  addresses: [AddressSchema],
  paymentMethods: [PaymentMethodSchema],
  preferences: {
    defaultShippingAddress: {
      type: Schema.Types.ObjectId
    },
    defaultBillingAddress: {
      type: Schema.Types.ObjectId
    },
    defaultPaymentMethod: {
      type: Schema.Types.ObjectId
    },
    newsletter: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: true
    }
  },
  loyaltyProfile: {
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    lifetimePoints: {
      type: Number,
      default: 0,
      min: 0
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UserProfileSchema.index({ userId: 1 });
UserProfileSchema.index({ 'loyaltyProfile.referralCode': 1 });

// Generate referral code
UserProfileSchema.pre('save', function(next) {
  if (this.isNew && !this.loyaltyProfile?.referralCode) {
    if (!this.loyaltyProfile) {
      this.loyaltyProfile = {
        tier: 'bronze',
        points: 0,
        lifetimePoints: 0,
        referralCode: generateReferralCode()
      };
    } else {
      this.loyaltyProfile.referralCode = generateReferralCode();
    }
  }
  next();
});

// Ensure only one default address per type
UserProfileSchema.pre('save', function(next) {
  const addressTypes = ['shipping', 'billing'];
  
  for (const type of addressTypes) {
    const addressesOfType = this.addresses.filter(addr => addr.type === type);
    const defaultAddresses = addressesOfType.filter(addr => addr.isDefault);
    
    if (defaultAddresses.length > 1) {
      // Keep only the first default, remove default from others
      for (let i = 1; i < defaultAddresses.length; i++) {
        defaultAddresses[i].isDefault = false;
      }
    }
  }
  
  // Same for payment methods
  const defaultPaymentMethods = this.paymentMethods.filter(pm => pm.isDefault);
  if (defaultPaymentMethods.length > 1) {
    for (let i = 1; i < defaultPaymentMethods.length; i++) {
      defaultPaymentMethods[i].isDefault = false;
    }
  }
  
  next();
});

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
