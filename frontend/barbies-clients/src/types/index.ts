/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReactNode } from "react";

// User Types
export interface User {
  tierLevel: ReactNode;
  _id: string;
  name: string;
  email: string;
  roles: ("admin" | "manager" | "user" | "customer")[];
  isAdmin?: boolean;
  photo?: string;
  active: boolean;
  phone?: string;
  location: string;
  preferences?: UserPreferences;
  loyaltyPoints: number;
  status: "active" | "inactive" | "suspended";
  lastLogin?: string;
  totalOrders: number;
  totalSpent: number;
  verified: boolean;
  preferredServices: string[];
  notes?: string;
  permissions?: string[];
  joinDate: string;
  createdAt: string;
  updatedAt: string;
  // user: string;
  // token: string;
}

export interface UserPreferences {
  theme?: string;
  notification?: boolean;
  language?: string;
}

export interface AuthResponse {
  data: AuthResponse | PromiseLike<AuthResponse>;
  token: string;
  user: User;
}

export interface Address {
  _id: string;
  type: "shipping" | "billing";
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

export interface PaymentMethod {
  _id: string;
  type: "card" | "paypal" | "applepay" | "googlepay" | "banktransfer";
  isDefault: boolean;
  // Card details (tokenized/encrypted)
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  // PayPal
  paypalEmail?: string;
  // Bank transfer
  bankName?: string;
  accountLast4?: string;
  // Metadata
  name: string;
  createdAt: string;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  category: Category;
  subcategory?: Category;
  price: number;
  priceDiscount?: number;
  discountPercentage?: number;
  images: string[];
  imageCover: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  quantity: number;
  sold: number;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
  photos: string[];
  data?: string;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
  parentCategory?: string;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
  discount?: number;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
    type?: "home" | "work" | "other";
  };
  paymentMethod: "card" | "paypal" | "cash" | "bank_transfer";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  _id: string;
  product: string | Product;
  user: string | User;
  rating: number;
  comment: string;
  helpful: number;
  images?: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: "success" | "fail" | "error";
  data?: T;
  message?: string;
  results?: number;
  pagination?: {
    page: number;
    limit: number;
    pages: number;
    total: number;
  };
}

// Enhanced Cart Types
export interface CartItem {
  _id: string;
  product: Product;
  variation?: ProductVariation;
  quantity: number;
  price: number; // Price at time of adding to cart
  selectedAttributes?: Record<string, string>;
  personalization?: Record<string, string>;
  addedAt: string;
  savedForLater: boolean;
}

export interface Cart {
  _id?: string;
  userId?: string;
  items: CartItem[];
  savedItems: CartItem[]; // Saved for later
  totalItems: number;
  subtotal: number;
  taxes: number;
  shipping: number;
  discounts: number;
  totalAmount: number;
  appliedCoupons: AppliedCoupon[];
  estimatedDelivery?: string;
  currency: string;
  lastUpdated: string;
}

// Enhanced Product Types
export interface ProductVariation {
  _id: string;
  attributes: Record<string, string>;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  images?: string[];
}

export interface ProductAttribute {
  _id: string;
  name: string;
  slug: string;
  type: "color" | "size" | "material" | "style" | "custom";
  values: AttributeValue[];
  required: boolean;
  visible: boolean;
}

export interface AttributeValue {
  _id: string;
  value: string;
  colorCode?: string;
  image?: string;
  priceModifier?: number;
}

// Wishlist Types
export interface WishlistItem {
  _id: string;
  product: Product;
  variation?: ProductVariation;
  addedAt: string;
  notes?: string;
  priceAlert?: {
    enabled: boolean;
    targetPrice: number;
  };
  stockAlert?: boolean;
}

export interface Wishlist {
  _id: string;
  userId: string;
  items: WishlistItem[];
  name: string;
  privacy: "private" | "public" | "shared";
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Order Types
export interface OrderItemWithDetails extends OrderItem {
  _id: string;
  variation?: ProductVariation;
  selectedAttributes?: Record<string, string>;
  personalization?: Record<string, string>;
  unitPrice: number;
  totalPrice: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  tracking?: {
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
  };
}

export interface EnhancedOrder {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItemWithDetails[];

  // Pricing
  subtotal: number;
  taxes: TaxBreakdown[];
  shipping: ShippingCost;
  discounts: DiscountBreakdown[];
  totalAmount: number;
  currency: string;

  // Status and Tracking
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  paymentStatus:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
  fulfillmentStatus: "unfulfilled" | "partial" | "fulfilled";

  // Addresses
  shippingAddress: Address;
  billingAddress: Address;

  // Payment and Shipping
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;

  // Tracking and Timeline
  tracking?: OrderTracking;
  timeline: OrderTimelineEvent[];

  // Additional Info
  notes?: string;
  giftMessage?: string;
  isGift: boolean;
  estimatedDelivery?: string;
  actualDelivery?: string;

  // Returns and Refunds
  returns?: OrderReturn[];
  refunds?: OrderRefund[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface TaxBreakdown {
  name: string;
  rate: number;
  amount: number;
}

export interface ShippingCost {
  method: string;
  cost: number;
  estimatedDays: number;
  carrier: string;
}

export interface DiscountBreakdown {
  type: "coupon" | "loyalty" | "bulk" | "seasonal";
  name: string;
  code?: string;
  amount: number;
  percentage?: number;
}

export interface ShippingMethod {
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
}

export interface OrderTracking {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  status: string;
  estimatedDelivery: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location?: string;
  description: string;
}

export interface OrderTimelineEvent {
  _id: string;
  type:
    | "created"
    | "confirmed"
    | "payment"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  status: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface OrderReturn {
  _id: string;
  items: Array<{
    orderItemId: string;
    quantity: number;
    reason: string;
  }>;
  status: "requested" | "approved" | "received" | "processed" | "rejected";
  reason: string;
  notes?: string;
  refundAmount: number;
  createdAt: string;
  processedAt?: string;
}

export interface OrderRefund {
  _id: string;
  amount: number;
  reason: string;
  status: "pending" | "processed" | "failed";
  transactionId?: string;
  createdAt: string;
  processedAt?: string;
}

// Coupon and Discount Types
export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  firstTimeCustomerOnly: boolean;
  autoApply: boolean;
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
  appliedAt: string;
}

// Subscription Types
export interface Subscription {
  _id: string;
  userId: string;
  product: Product;
  variation?: ProductVariation;
  quantity: number;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
  nextDelivery: string;
  status: "active" | "paused" | "cancelled" | "expired";
  billingCycle: "weekly" | "monthly" | "annually";
  price: number;
  discountPercentage?: number;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  orders: string[]; // Order IDs
  pausedUntil?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Review Types
export interface EnhancedReview {
  _id: string;
  product: string | Product;
  user: string | User;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  videos?: string[];
  verifiedPurchase: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  userVote?: "helpful" | "unhelpful";
  status: "pending" | "approved" | "rejected";
  moderationNotes?: string;
  replies?: ReviewReply[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReply {
  _id: string;
  user: User;
  content: string;
  isOfficial: boolean; // From store owner/admin
  createdAt: string;
}

export interface ReviewFilter {
  rating?: number[];
  verifiedOnly?: boolean;
  withImages?: boolean;
  sortBy?:
    | "newest"
    | "oldest"
    | "highest_rating"
    | "lowest_rating"
    | "most_helpful";
  page?: number;
  limit?: number;
}

export type SortBy =
  | "rating"
  | "relevance"
  | "price_low"
  | "price_high"
  | "newest"
  | "popularity";
// Search and Filter Types
export interface ProductFilter {
  categories?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
  brands?: string[];
  attributes?: Record<string, string[]>;
  sortBy?:
    | "relevance"
    | "price_low"
    | "price_high"
    | "newest"
    | "rating"
    | "popularity";
  page?: number;
  limit?: number;
  search?: string;
}

export interface SearchSuggestion {
  type: "product" | "category" | "brand" | "query";
  id: string;
  text: string;
  image?: string;
  price?: number;
  popularity: number;
}

export interface SearchResult {
  products: Product[];
  suggestions: SearchSuggestion[];
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ id: string; name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    attributes: Record<string, Array<{ value: string; count: number }>>;
  };
  total: number;
  page: number;
  totalPages: number;
  query?: string;
}

// Loyalty and Rewards Types
export interface LoyaltyProgram {
  _id: string;
  name: string;
  description: string;
  pointsPerDollar: number;
  tiers: LoyaltyTier[];
  rewards: LoyaltyReward[];
  isActive: boolean;
}

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: string[];
  multiplier: number;
  color: string;
}

export interface LoyaltyReward {
  _id: string;
  name: string;
  description: string;
  type: "discount" | "free_product" | "free_shipping" | "early_access";
  pointsCost: number;
  value?: number; // For discounts
  productId?: string; // For free products
  validDays: number;
  usageLimit?: number;
  tierRequired?: string;
  isActive: boolean;
}

export interface UserLoyalty {
  userId: string;
  currentPoints: number;
  lifetimePoints: number;
  currentTier: string;
  pointsToNextTier: number;
  redeemedRewards: Array<{
    reward: LoyaltyReward;
    redeemedAt: string;
    expiresAt: string;
    used: boolean;
    usedAt?: string;
  }>;
  pointsHistory: Array<{
    type: "earned" | "redeemed" | "expired";
    points: number;
    description: string;
    orderId?: string;
    createdAt: string;
  }>;
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type:
    | "order_update"
    | "stock_alert"
    | "promotion"
    | "review_reminder"
    | "loyalty_update"
    | "system";
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: "low" | "medium" | "high";
  channel: "in_app" | "email" | "sms" | "push";
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

// Recommendation Types
export interface ProductRecommendation {
  product: Product;
  score: number;
  reason:
    | "viewed_together"
    | "bought_together"
    | "similar_customers"
    | "trending"
    | "personalized"
    | "similar_products";
  context?: string;
  confidence: number;
}

export interface RecommendationSection {
  title: string;
  type:
    | "cross_sell"
    | "up_sell"
    | "related"
    | "trending"
    | "recently_viewed"
    | "recommended_for_you";
  products: ProductRecommendation[];
  displayLimit: number;
}

// Recently Viewed Types
export interface RecentlyViewedItem {
  product: Product;
  viewedAt: string;
  viewCount: number;
}

// Comparison Types
export interface ProductComparison {
  products: Product[];
  attributes: ProductAttribute[];
  comparisonMatrix: Record<string, Record<string, any>>;
}

// Stock Alert Types
export interface StockAlert {
  _id: string;
  userId: string;
  productId: string;
  variationId?: string;
  email: string;
  phone?: string;
  notifyEmail: boolean;
  notifySms: boolean;
  isActive: boolean;
  notifiedAt?: string;
  createdAt: string;
}

// Gift Card Types
export interface GiftCard {
  _id: string;
  code: string;
  amount: number;
  balance: number;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
  status: "active" | "redeemed" | "expired" | "cancelled";
  expiresAt?: string;
  createdAt: string;
  redeemedAt?: string;
}

// Quick Order Types
export interface QuickOrderItem {
  sku: string;
  quantity: number;
}

export interface QuickOrder {
  items: QuickOrderItem[];
  errors?: Array<{
    sku: string;
    error: string;
  }>;
}

// Bundle and Kit Types
export interface ProductBundle {
  _id: string;
  name: string;
  description: string;
  products: Array<{
    product: Product;
    quantity: number;
    required: boolean;
  }>;
  bundlePrice: number;
  individualPrice: number;
  savings: number;
  savingsPercentage: number;
  images: string[];
  isActive: boolean;
}

// Social Features Types
export interface ProductShare {
  platform:
    | "facebook"
    | "twitter"
    | "pinterest"
    | "whatsapp"
    | "email"
    | "copy_link";
  url: string;
  title: string;
  description: string;
  image: string;
}

export interface UserGeneratedContent {
  _id: string;
  type: "photo" | "video" | "story";
  user: User;
  product: Product;
  content: {
    url: string;
    caption?: string;
    tags?: string[];
  };
  likes: number;
  comments: UGCComment[];
  featured: boolean;
  approved: boolean;
  createdAt: string;
}

export interface UGCComment {
  _id: string;
  user: User;
  content: string;
  likes: number;
  createdAt: string;
}

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "file";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  options?: { label: string; value: string | number }[];
}

export interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
  popularProducts: Product[];
  revenueChart: { date: string; revenue: number }[];
  ordersChart: { date: string; orders: number }[];
}

// Search & Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  sortBy?: "name" | "price" | "rating" | "created" | "popularity";
  sortOrder?: "asc" | "desc";
}

// Settings Types
export interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    orderUpdates: boolean;
    productUpdates: boolean;
  };
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
    profileVisible: boolean;
    showLastActive: boolean;
    allowDataCollection: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    theme: "light" | "dark" | "system";
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
}

// Analytics Types
export interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
  popularProducts: Product[];
  revenueChart: { date: string; revenue: number }[];
  ordersChart: { date: string; orders: number }[];
}

// Address Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  // isDefault?: boolean;
  // type?: "home" | "work" | "other";
}
