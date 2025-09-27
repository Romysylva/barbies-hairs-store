import mongoose, { Schema, Document, Query } from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';

interface Preferences {
  theme?: string;
  notification?: boolean;
  language?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
  comparePassword: (enteredPassword: string) => Promise<boolean>;
  _id: string;
  roles: string[];
  preferences?: Preferences;
  photo: string;
  phone?: string;
  passwordConfirm?: string;
  passwordChangeAt?: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;
  active: boolean;
  createPasswordResetToken(): string;
  location: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  totalOrders: number;
  totalSpent: number;
  verified: boolean;
  loyaltyPoints: number;
  preferredServices: string[];
  notes?: string;
  permissions?: string[];
  joinDate: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, 'Please tell us your name'] },
    email: {
      type: String,
      required: [true, 'please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'please provide a password'],
      minlength: 8,
      maxlength: 20,
      select: false,
    },
    isAdmin: { type: Boolean, default: false },
    roles: {
      type: [String],
      enum: ['customer', 'admin', 'staff', 'mananger'],
      default: ['customer'],
    },
    preferences: {
      theme: { type: String, default: 'light' },
      notification: { type: Boolean, default: true },
      language: { type: String, default: 'en' },
    },
    photo: { type: String, defualt: 'default.jpg' },
    phone: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^[\d+\-\s()]+$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    location: {
      type: String,
      required: [true, 'Please add your location for fast delivery'],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'confirm your password'],
      validate: {
        validator: function (this: IUser, el: string): boolean {
          return el === this.password;
        },
        message: 'passwords do not match!',
      },
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },

    verified: {
      type: Boolean,
      default: false,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    preferredServices: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || typeof this.password !== 'string') {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = new Date(Date.now() - 1000);
  next();
});

userSchema.pre(/^find/, function (this: Query<any, IUser>, next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.changePasswordAfter = function (
  this: IUser,
  JWTTimestamp: number,
): boolean {
  if (this.passwordChangeAt) {
    const changedTimestamp = Math.floor(this.passwordChangeAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

export const User = mongoose.model<IUser>('User', userSchema);
