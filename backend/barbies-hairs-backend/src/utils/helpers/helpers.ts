// src/utils/auth.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const generateToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };

  return jwt.sign({ id }, process.env.JWT_SECRET as string, options);
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const comparePasswords = async (input: string, hashed: string) => {
  return await bcrypt.compare(input, hashed);
};

export const createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  return { resetToken, hashedToken };
};

// src/utils/currency.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

export const calculateDiscount = (price: number, percent: number): number => {
  return Math.round(price - price * (percent / 100));
};

// src/utils/product.ts
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const isOutOfStock = (quantity: number): boolean => {
  return quantity <= 0;
};

// src/utils/order.ts
export const generateOrderId = (): string => {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const formatOrderDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const trackDeliveryStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Awaiting confirmation',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Order Cancelled',
  };
  return statusMap[status] || 'Processing';
};

// src/utils/review.ts
export const getAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
};

export const generateStars = (rating: number): string => {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
};

// src/utils/string.ts
export const capitalize = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const truncate = (text: string, length: number): string => {
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
