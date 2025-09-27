/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// ADVANCED USER PROFILE TYPES
// =============================================================================

import { DatabaseEntity, Address } from "./index";

// =============================================================================
// CORE USER PROFILE
// =============================================================================

export interface UserProfile extends DatabaseEntity {
  // Basic information (extends base User)
  email: string;
  customerName: string;

  // Personal details
  personalInfo: PersonalInfo;

  // Contact information
  contactInfo: ContactInfo;

  // Account settings
  accountSettings: AccountSettings;

  // Preferences
  preferences: UserPreferences;

  // Addresses
  addresses: UserAddress[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;

  // Payment methods
  paymentMethods: SavedPaymentMethod[];

  // Wishlist & favorites
  wishlist: WishlistItem[];
  favorites: FavoriteItem[];

  // Purchase history
  orderHistory: UserOrderSummary[];

  // Loyalty & rewards
  loyaltyProfile?: LoyaltyProfile;

  // Communication preferences
  communications: CommunicationPreferences;

  // Privacy settings
  privacy: PrivacySettings;

  // Account status
  accountStatus: AccountStatus;
  verification: AccountVerification;

  // Activity tracking
  activity: UserActivity;

  // Segmentation
  segments: CustomerSegment[];

  // Profile analytics
  analytics: UserAnalytics;
}

export interface PersonalInfo {
  // Name details
  firstName?: string;
  lastName?: string;
  middleName?: string;
  displayName?: string;

  // Personal details
  dateOfBirth?: string;
  gender?: Gender;
  title?: PersonalTitle;

  // Demographics
  occupation?: string;
  company?: string;

  // Profile image
  avatar?: string;

  // Language & locale
  preferredLanguage: string;
  locale: string;
  timezone: string;
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  NON_BINARY = "non_binary",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
  OTHER = "other",
}

export enum PersonalTitle {
  MR = "mr",
  MRS = "mrs",
  MS = "ms",
  DR = "dr",
  PROF = "prof",
  OTHER = "other",
}

export interface ContactInfo {
  // Phone numbers
  phones: PhoneNumber[];
  primaryPhoneId?: string;

  // Emergency contact
  emergencyContact?: EmergencyContact;

  // Social profiles
  socialProfiles?: SocialProfile[];

  // Communication methods ranking
  preferredContactMethod: ContactMethod;
}

export interface PhoneNumber {
  id: string;
  number: string;
  type: PhoneType;
  countryCode: string;
  isVerified: boolean;
  isPrimary: boolean;

  // Verification
  verificationCode?: string;
  verificationSentAt?: string;
  verifiedAt?: string;
}

export enum PhoneType {
  MOBILE = "mobile",
  HOME = "home",
  WORK = "work",
  FAX = "fax",
  OTHER = "other",
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface SocialProfile {
  platform: SocialPlatform;
  username: string;
  url: string;
  isPublic: boolean;
}

export enum SocialPlatform {
  FACEBOOK = "facebook",
  TWITTER = "twitter",
  INSTAGRAM = "instagram",
  LINKEDIN = "linkedin",
  TIKTOK = "tiktok",
  YOUTUBE = "youtube",
  PINTEREST = "pinterest",
}

export enum ContactMethod {
  EMAIL = "email",
  SMS = "sms",
  PHONE = "phone",
  PUSH_NOTIFICATION = "push_notification",
  MAIL = "mail",
}

// =============================================================================
// ACCOUNT SETTINGS & SECURITY
// =============================================================================

export interface AccountSettings {
  // Security settings
  security: SecuritySettings;

  // Billing settings
  billing: BillingSettings;

  // Shipping settings
  shipping: ShippingSettings;

  // Notification settings
  notifications: NotificationSettings;

  // Data & privacy
  dataSettings: DataSettings;

  // Accessibility
  accessibility: AccessibilitySettings;
}

export interface SecuritySettings {
  // Authentication
  twoFactorEnabled: boolean;
  twoFactorMethod?: TwoFactorMethod;

  // Password
  passwordLastChanged: string;
  passwordStrength: PasswordStrength;

  // Sessions
  activeSessions: UserSession[];
  maxConcurrentSessions: number;

  // Login security
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;

  // Device management
  trustedDevices: TrustedDevice[];

  // Recovery options
  recoveryEmails: string[];
  recoveryPhones: string[];
  securityQuestions?: SecurityQuestion[];
}

export enum TwoFactorMethod {
  SMS = "sms",
  TOTP = "totp",
  EMAIL = "email",
  HARDWARE_KEY = "hardware_key",
  BIOMETRIC = "biometric",
}

export enum PasswordStrength {
  WEAK = "weak",
  FAIR = "fair",
  GOOD = "good",
  STRONG = "strong",
  VERY_STRONG = "very_strong",
}

export interface UserSession {
  id: string;
  deviceInfo: DeviceInfo;
  location: SessionLocation;
  startedAt: string;
  lastActivity: string;
  isActive: boolean;
  ipAddress: string;
}

export interface DeviceInfo {
  type: DeviceType;
  os: string;
  browser?: string;
  model?: string;
  fingerprint: string;
}

export enum DeviceType {
  DESKTOP = "desktop",
  MOBILE = "mobile",
  TABLET = "tablet",
  TV = "tv",
  OTHER = "other",
}

export interface SessionLocation {
  country: string;
  region?: string;
  city?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface TrustedDevice {
  id: string;
  name: string;
  deviceInfo: DeviceInfo;
  addedAt: string;
  lastUsed: string;
  isActive: boolean;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answerHash: string; // encrypted/hashed
  createdAt: string;
}

export interface BillingSettings {
  // Default currency
  currency: string;

  // Tax information
  taxId?: string;
  taxExempt: boolean;

  // Billing preferences
  paperlessStatements: boolean;
  autoPayEnabled: boolean;

  // Invoice settings
  invoiceEmail?: string;
  invoiceFrequency: InvoiceFrequency;
}

export enum InvoiceFrequency {
  IMMEDIATE = "immediate",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export interface ShippingSettings {
  // Default preferences
  defaultShippingMethod?: string;
  signatureRequired: boolean;

  // Special instructions
  defaultInstructions?: string;

  // Pickup preferences
  allowPickup: boolean;
  preferredPickupLocation?: string;

  // Address validation
  requireAddressValidation: boolean;
}

export interface NotificationSettings {
  // Email notifications
  email: EmailNotificationSettings;

  // SMS notifications
  sms: SMSNotificationSettings;

  // Push notifications
  push: PushNotificationSettings;

  // In-app notifications
  inApp: InAppNotificationSettings;

  // Frequency settings
  frequency: NotificationFrequency;

  // Quiet hours
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  };
}

export interface EmailNotificationSettings {
  // Order notifications
  orderConfirmation: boolean;
  orderUpdates: boolean;
  orderDelivered: boolean;

  // Marketing
  promotions: boolean;
  newsletters: boolean;
  productRecommendations: boolean;

  // Account
  accountUpdates: boolean;
  securityAlerts: boolean;
  passwordReset: boolean;

  // Reviews
  reviewInvitations: boolean;
  reviewResponses: boolean;

  // Inventory
  backInStock: boolean;
  priceDropAlerts: boolean;

  // Social
  followedBrands: boolean;
  wishlistUpdates: boolean;
}

export interface SMSNotificationSettings {
  // Order notifications
  orderUpdates: boolean;
  deliveryAlerts: boolean;

  // Security
  twoFactorCodes: boolean;
  securityAlerts: boolean;

  // Marketing
  promotions: boolean;
  flashSales: boolean;

  // Inventory
  backInStock: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;

  // Categories
  orders: boolean;
  marketing: boolean;
  social: boolean;
  security: boolean;

  // Timing
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface InAppNotificationSettings {
  enabled: boolean;
  showBadges: boolean;
  playSound: boolean;

  // Categories
  messages: boolean;
  updates: boolean;
  recommendations: boolean;
}

export enum NotificationFrequency {
  IMMEDIATE = "immediate",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  NEVER = "never",
}

export interface DataSettings {
  // Data sharing
  allowDataSharing: boolean;
  allowAnalytics: boolean;
  allowPersonalization: boolean;

  // Marketing
  allowMarketingEmails: boolean;
  allowMarketingSMS: boolean;
  allowTargetedAds: boolean;

  // Third party
  allowThirdPartySharing: boolean;

  // Data retention
  dataRetentionPeriod?: number; // days

  // Export & deletion
  dataDownloadRequests: DataRequest[];
  dataDeletionRequests: DataRequest[];
}

export interface DataRequest {
  id: string;
  type: "download" | "deletion";
  status: RequestStatus;
  requestedAt: string;
  processedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
}

export enum RequestStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  EXPIRED = "expired",
}

export interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;

  // Audio
  audioDescriptions: boolean;
  soundEnabled: boolean;

  // Navigation
  keyboardNavigation: boolean;
  screenReader: boolean;

  // Display
  colorBlindnessType?: ColorBlindnessType;

  // Language
  rightToLeft: boolean;
}

export enum ColorBlindnessType {
  NONE = "none",
  PROTANOPIA = "protanopia",
  DEUTERANOPIA = "deuteranopia",
  TRITANOPIA = "tritanopia",
  ACHROMATOPSIA = "achromatopsia",
}

// =============================================================================
// USER PREFERENCES & BEHAVIOR
// =============================================================================

export interface UserPreferences {
  // Shopping preferences
  shopping: ShoppingPreferences;

  // Display preferences
  display: DisplayPreferences;

  // Product preferences
  products: ProductPreferences;

  // Communication preferences
  communication: CommunicationStyle;

  // Recommendation settings
  recommendations: RecommendationSettings;
}

export interface ShoppingPreferences {
  // Default settings
  defaultCurrency: string;
  defaultCountry: string;

  // Cart behavior
  saveCartForLater: boolean;
  cartExpirationDays: number;

  // Checkout preferences
  expressCheckout: boolean;
  oneClickPurchase: boolean;
  savePaymentMethods: boolean;

  // Shipping preferences
  preferredShippingMethod?: string;
  deliveryPreference: DeliveryPreference;

  // Purchase behavior
  budgetLimits?: BudgetLimit[];
  spendingAlerts: boolean;
}

export enum DeliveryPreference {
  FASTEST = "fastest",
  CHEAPEST = "cheapest",
  MOST_RELIABLE = "most_reliable",
  ECO_FRIENDLY = "eco_friendly",
  NO_PREFERENCE = "no_preference",
}

export interface BudgetLimit {
  category: string;
  period: "daily" | "weekly" | "monthly";
  amount: number;
  alertThreshold: number; // percentage
}

export interface DisplayPreferences {
  // Product display
  productViewMode: "grid" | "list";
  productsPerPage: number;

  // Theme & appearance
  theme: "light" | "dark" | "auto";
  accentColor?: string;

  // Layout
  compactMode: boolean;
  sidebarCollapsed: boolean;

  // Content
  showPrices: boolean;
  showDiscounts: boolean;
  showRatings: boolean;

  // Units & formats
  temperatureUnit: "celsius" | "fahrenheit";
  measurementUnit: "metric" | "imperial";
  dateFormat: string;
  timeFormat: "12h" | "24h";
}

export interface ProductPreferences {
  // Categories of interest
  favoriteCategories: string[];
  dislikedCategories: string[];

  // Brands
  favoriteBrands: string[];
  blockedBrands: string[];

  // Price sensitivity
  priceRange: PriceRange;

  // Quality preferences
  qualityOverPrice: boolean;

  // Product features
  importantFeatures: string[];

  // Size preferences (for applicable categories)
  sizes?: SizePreferences;

  // Style preferences
  styles?: StylePreferences;

  // Allergens & restrictions
  allergens?: string[];
  dietaryRestrictions?: string[];

  // Sustainability preferences
  ecoFriendly: boolean;
  sustainabilityImportance: number; // 1-10 scale
}

export interface PriceRange {
  categoryRanges: Record<string, { min?: number; max?: number }>;
  globalBudget?: number;
}

export interface SizePreferences {
  clothing?: ClothingSize;
  shoes?: ShoeSize;
  accessories?: Record<string, string>;
}

export interface ClothingSize {
  shirt: string;
  pants: string;
  dress?: string;
  jacket?: string;
  measurements?: BodyMeasurements;
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  inseam?: number;
  unit: "in" | "cm";
}

export interface ShoeSize {
  size: string;
  width?: string;
  unit: "us" | "eu" | "uk" | "cm";
}

export interface StylePreferences {
  fashionStyle?: FashionStyle[];
  colorPalette?: string[];
  patterns?: Pattern[];
  materials?: Material[];
}

export enum FashionStyle {
  CASUAL = "casual",
  FORMAL = "formal",
  SPORTY = "sporty",
  BOHEMIAN = "bohemian",
  VINTAGE = "vintage",
  MINIMALIST = "minimalist",
  EDGY = "edgy",
  CLASSIC = "classic",
}

export enum Pattern {
  SOLID = "solid",
  STRIPES = "stripes",
  POLKA_DOTS = "polka_dots",
  FLORAL = "floral",
  GEOMETRIC = "geometric",
  ANIMAL_PRINT = "animal_print",
  ABSTRACT = "abstract",
}

export enum Material {
  COTTON = "cotton",
  SILK = "silk",
  WOOL = "wool",
  LEATHER = "leather",
  DENIM = "denim",
  SYNTHETIC = "synthetic",
  BAMBOO = "bamboo",
  ORGANIC = "organic",
}

export interface CommunicationStyle {
  // Tone preferences
  formalCommunication: boolean;
  verboseCommunication: boolean;

  // Content preferences
  includeRecommendations: boolean;
  includeEducationalContent: boolean;
  includeIndustryNews: boolean;

  // Frequency
  maxEmailsPerWeek: number;
  maxSMSPerMonth: number;
}

export interface RecommendationSettings {
  // Algorithm preferences
  baseRecommendationsOn: RecommendationBasis[];

  // Personalization level
  personalizationLevel: PersonalizationLevel;

  // Content types
  enableTrendingProducts: boolean;
  enableSeasonalProducts: boolean;
  enableClearanceProducts: boolean;

  // Diversity
  diversityPreference: number; // 1-10 scale

  // Exclusions
  excludeOutOfStock: boolean;
  excludePreviouslyPurchased: boolean;
  excludeWishlisted: boolean;
}

export enum RecommendationBasis {
  PURCHASE_HISTORY = "purchase_history",
  BROWSING_BEHAVIOR = "browsing_behavior",
  WISHLIST = "wishlist",
  SIMILAR_CUSTOMERS = "similar_customers",
  TRENDING = "trending",
  SEASONAL = "seasonal",
}

export enum PersonalizationLevel {
  MINIMAL = "minimal",
  MODERATE = "moderate",
  HIGH = "high",
  MAXIMUM = "maximum",
}

// =============================================================================
// ADDRESSES & PAYMENT METHODS
// =============================================================================

export interface UserAddress extends Address {
  // Address metadata
  label?: string; // e.g., "Home", "Work", "Mom's House"
  type: AddressType;

  // Usage tracking
  isDefault: boolean;
  lastUsed?: string;
  usageCount: number;

  // Validation
  isValidated: boolean;
  validationSource?: string;

  // Special instructions
  deliveryInstructions?: string;
  accessCodes?: string;

  // Location data
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Restrictions
  restrictions?: AddressRestriction[];
}

export enum AddressType {
  HOME = "home",
  WORK = "work",
  GIFT = "gift",
  TEMPORARY = "temporary",
  PO_BOX = "po_box",
  PICKUP_POINT = "pickup_point",
  OTHER = "other",
}

export interface AddressRestriction {
  type:
    | "delivery_time"
    | "signature_required"
    | "access_code"
    | "no_weekend"
    | "business_hours_only";
  details: string;
}

export interface SavedPaymentMethod {
  id: string;

  // Method details
  type: PaymentMethodType;
  displayName: string;

  // Card details (if applicable)
  brand?: string;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;

  // Bank details (if applicable)
  bankName?: string;
  accountType?: string;

  // Settings
  isDefault: boolean;
  isExpired: boolean;

  // Security
  token: string;
  fingerprint?: string;

  // Usage
  lastUsed?: string;
  usageCount: number;

  // Verification
  verified: boolean;
  verifiedAt?: string;

  // Billing address
  billingAddressId?: string;

  // Auto-billing settings
  autoPayEnabled?: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export enum PaymentMethodType {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  BANK_ACCOUNT = "bank_account",
  DIGITAL_WALLET = "digital_wallet",
  GIFT_CARD = "gift_card",
  STORE_CREDIT = "store_credit",
}

// =============================================================================
// WISHLIST & FAVORITES
// =============================================================================

export interface WishlistItem {
  id: string;
  productId: string;

  // Product snapshot
  productName: string;
  productImage?: string;
  currentPrice: number;

  // Wishlist metadata
  addedAt: string;
  notes?: string;
  priority: WishlistPriority;

  // Price tracking
  priceTracking: PriceTracking;

  // Sharing
  isPublic: boolean;
  shareableUrl?: string;

  // Variants
  selectedVariantId?: string;

  // Category/organization
  category?: string;
  tags?: string[];
}

export enum WishlistPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface PriceTracking {
  enabled: boolean;
  targetPrice?: number;
  priceHistory: PriceHistoryEntry[];
  lastChecked: string;

  // Alerts
  alertOnDiscount: boolean;
  alertOnBackInStock: boolean;
  minimumDiscountPercentage: number;
}

export interface PriceHistoryEntry {
  price: number;
  timestamp: string;
  source: string;
}

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  itemId: string;

  // Item details
  name: string;
  image?: string;

  // Metadata
  addedAt: string;
  category?: string;

  // Sharing
  isPublic: boolean;
}

export enum FavoriteType {
  PRODUCT = "product",
  BRAND = "brand",
  CATEGORY = "category",
  STORE = "store",
  REVIEW = "review",
}

// =============================================================================
// LOYALTY & REWARDS
// =============================================================================

export interface LoyaltyProfile {
  // Program membership
  programId: string;
  memberNumber: string;
  tier: LoyaltyTier;

  // Points & balance
  points: PointsBalance;

  // Achievements
  badges: LoyaltyBadge[];
  milestones: Milestone[];

  // Referral program
  referral: ReferralData;

  // Birthday & anniversary
  birthday?: string;
  memberSince: string;

  // Preferences
  preferences: LoyaltyPreferences;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  level: number;

  // Tier benefits
  benefits: TierBenefit[];

  // Tier requirements
  requirements: TierRequirement[];

  // Progress to next tier
  nextTier?: {
    tierId: string;
    tierName: string;
    progress: TierProgress;
  };
}

export interface TierBenefit {
  type: BenefitType;
  description: string;
  value?: number;
  unit?: string;
}

export enum BenefitType {
  DISCOUNT_PERCENTAGE = "discount_percentage",
  FREE_SHIPPING = "free_shipping",
  EARLY_ACCESS = "early_access",
  EXCLUSIVE_PRODUCTS = "exclusive_products",
  PRIORITY_SUPPORT = "priority_support",
  BIRTHDAY_DISCOUNT = "birthday_discount",
  BONUS_POINTS = "bonus_points",
  EXTENDED_RETURNS = "extended_returns",
}

export interface TierRequirement {
  type: "spending" | "points" | "purchases" | "reviews";
  value: number;
  period: "lifetime" | "annual" | "monthly";
}

export interface TierProgress {
  current: number;
  required: number;
  percentage: number;
  estimatedTimeToNext?: string;
}

export interface PointsBalance {
  available: number;
  pending: number;
  lifetime: number;

  // Expiration
  expiringPoints?: ExpiringPoints[];

  // History
  recentActivity: PointsTransaction[];
}

export interface ExpiringPoints {
  points: number;
  expirationDate: string;
}

export interface PointsTransaction {
  id: string;
  type: PointsTransactionType;
  points: number;
  description: string;
  orderId?: string;
  timestamp: string;
  expiresAt?: string;
}

export enum PointsTransactionType {
  EARNED_PURCHASE = "earned_purchase",
  EARNED_REVIEW = "earned_review",
  EARNED_REFERRAL = "earned_referral",
  EARNED_BIRTHDAY = "earned_birthday",
  EARNED_BONUS = "earned_bonus",
  REDEEMED = "redeemed",
  EXPIRED = "expired",
  ADJUSTED = "adjusted",
}

export interface LoyaltyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: BadgeCategory;

  // Requirements
  requirements: BadgeRequirement[];

  // Benefits
  benefits?: TierBenefit[];
}

export enum BadgeCategory {
  PURCHASE = "purchase",
  ENGAGEMENT = "engagement",
  SOCIAL = "social",
  MILESTONE = "milestone",
  SEASONAL = "seasonal",
  SPECIAL = "special",
}

export interface BadgeRequirement {
  type: string;
  value: number;
  description: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  achievedAt?: string;
  progress?: number; // 0-100
}

export interface ReferralData {
  // Referral code
  referralCode: string;

  // Statistics
  totalReferrals: number;
  successfulReferrals: number;

  // Earnings
  totalEarnings: number;
  pendingEarnings: number;

  // Recent referrals
  recentReferrals: ReferralEntry[];
}

export interface ReferralEntry {
  id: string;
  refereeEmail: string;
  refereeName?: string;
  status: ReferralStatus;
  reward: number;
  createdAt: string;
  convertedAt?: string;
}

export enum ReferralStatus {
  PENDING = "pending",
  CONVERTED = "converted",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export interface LoyaltyPreferences {
  // Earning preferences
  earnPointsOnPurchase: boolean;
  earnPointsOnReviews: boolean;
  earnPointsOnReferrals: boolean;

  // Communication
  pointsBalanceUpdates: boolean;
  tierProgressUpdates: boolean;
  expirationReminders: boolean;

  // Redemption
  autoRedeemEnabled: boolean;
  autoRedeemThreshold?: number;

  // Privacy
  showTierPublicly: boolean;
  shareActivityWithFriends: boolean;
}

// =============================================================================
// USER ACTIVITY & ANALYTICS
// =============================================================================

export interface UserActivity {
  // Session data
  lastLogin: string;
  lastActivity: string;
  sessionCount: number;
  totalTimeSpent: number; // minutes

  // Browsing behavior
  browsing: BrowsingBehavior;

  // Purchase behavior
  purchasing: PurchasingBehavior;

  // Engagement
  engagement: EngagementMetrics;

  // Device usage
  devices: DeviceUsageStats[];
}

export interface BrowsingBehavior {
  // Page views
  totalPageViews: number;
  uniquePageViews: number;
  averageSessionDuration: number;
  bounceRate: number;

  // Product interactions
  productsViewed: number;
  categoriesViewed: string[];
  searchQueries: SearchQuery[];

  // Recently viewed
  recentlyViewed: RecentlyViewedItem[];

  // Browsing patterns
  peakActivityHours: number[];
  preferredDevices: DeviceType[];
}

export interface SearchQuery {
  query: string;
  results: number;
  clicked: boolean;
  timestamp: string;
}

export interface RecentlyViewedItem {
  productId: string;
  productName: string;
  productImage?: string;
  viewedAt: string;
  timeSpent: number; // seconds
}

export interface PurchasingBehavior {
  // Purchase statistics
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;

  // Purchase patterns
  frequentCategories: CategoryPurchaseData[];
  seasonalPatterns: SeasonalPattern[];

  // Timing patterns
  preferredPurchaseDays: number[];
  preferredPurchaseHours: number[];

  // Decision making
  averageDecisionTime: number; // time from first view to purchase
  cartAbandonmentRate: number;

  // Return behavior
  returnRate: number;
  averageReturnTime: number; // days

  // Payment preferences
  preferredPaymentMethods: PaymentMethodType[];
}

export interface CategoryPurchaseData {
  categoryId: string;
  categoryName: string;
  orderCount: number;
  totalSpent: number;
  averageRating: number;
  lastPurchase: string;
}

export interface SeasonalPattern {
  season: Season;
  orderCount: number;
  totalSpent: number;
  topCategories: string[];
}

export enum Season {
  SPRING = "spring",
  SUMMER = "summer",
  FALL = "fall",
  WINTER = "winter",
}

export interface EngagementMetrics {
  // Reviews & ratings
  reviewsWritten: number;
  averageReviewRating: number;
  helpfulVotes: number;

  // Social engagement
  sharesCount: number;
  likesGiven: number;
  commentsWritten: number;

  // Program participation
  programParticipation: ProgramParticipation[];

  // Support interactions
  supportTickets: number;
  supportSatisfactionRating: number;
}

export interface ProgramParticipation {
  programType: string;
  programName: string;
  participationDate: string;
  completionDate?: string;
  status: ParticipationStatus;
}

export enum ParticipationStatus {
  ENROLLED = "enrolled",
  ACTIVE = "active",
  COMPLETED = "completed",
  DROPPED = "dropped",
  SUSPENDED = "suspended",
}

export interface DeviceUsageStats {
  deviceType: DeviceType;
  usagePercentage: number;
  lastUsed: string;
  ordersMade: number;
  averageSessionDuration: number;
}

// =============================================================================
// ACCOUNT STATUS & VERIFICATION
// =============================================================================

export interface AccountStatus {
  status: UserAccountStatus;

  // Status history
  statusHistory: StatusChange[];

  // Account health
  healthScore: number; // 0-100
  healthFactors: HealthFactor[];

  // Restrictions
  restrictions?: AccountRestriction[];

  // Warnings
  warnings?: AccountWarning[];
}

export enum UserAccountStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  BANNED = "banned",
  PENDING_VERIFICATION = "pending_verification",
  DEACTIVATED = "deactivated",
  MERGED = "merged",
}

export interface StatusChange {
  from: UserAccountStatus;
  to: UserAccountStatus;
  reason: string;
  changedBy: string;
  timestamp: string;
  notes?: string;
}

export interface HealthFactor {
  factor: string;
  score: number;
  weight: number;
  description: string;
}

export interface AccountRestriction {
  type: RestrictionType;
  description: string;
  expiresAt?: string;
  appliedAt: string;
  appliedBy: string;
  reason: string;
}

export enum RestrictionType {
  PURCHASE_LIMIT = "purchase_limit",
  COMMUNICATION_BLOCKED = "communication_blocked",
  REVIEW_BLOCKED = "review_blocked",
  RETURN_RESTRICTED = "return_restricted",
  PAYMENT_METHOD_RESTRICTED = "payment_method_restricted",
}

export interface AccountWarning {
  type: WarningType;
  message: string;
  severity: WarningSeverity;
  issuedAt: string;
  expiresAt?: string;
  acknowledged: boolean;
}

export enum WarningType {
  PAYMENT_FAILED = "payment_failed",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  POLICY_VIOLATION = "policy_violation",
  SECURITY_CONCERN = "security_concern",
  DATA_BREACH = "data_breach",
}

export enum WarningSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export interface AccountVerification {
  // Email verification
  emailVerified: boolean;
  emailVerifiedAt?: string;

  // Phone verification
  phoneVerified: boolean;
  phoneVerifiedAt?: string;

  // Identity verification
  identityVerified: boolean;
  identityVerification?: IdentityVerification;

  // Document verification
  documentsVerified: boolean;
  documentVerification?: DocumentVerification[];

  // Address verification
  addressVerified: boolean;
  addressVerificationMethod?: string;
}

export interface IdentityVerification {
  provider: string;
  verifiedAt: string;
  verificationId: string;
  documentType: string;

  // Extracted information
  fullName: string;
  dateOfBirth: string;
  address?: Address;

  // Confidence score
  confidenceScore: number;

  // Status
  status: VerificationStatus;
}

export interface DocumentVerification {
  id: string;
  type: DocumentType;
  status: VerificationStatus;

  // Document details
  documentNumber?: string;
  expiryDate?: string;
  issuingAuthority?: string;

  // Verification details
  verifiedAt?: string;
  verificationMethod: string;

  // File references
  fileUrls: string[];
}

export enum DocumentType {
  DRIVERS_LICENSE = "drivers_license",
  PASSPORT = "passport",
  NATIONAL_ID = "national_id",
  UTILITY_BILL = "utility_bill",
  BANK_STATEMENT = "bank_statement",
  BUSINESS_LICENSE = "business_license",
  TAX_DOCUMENT = "tax_document",
}

export enum VerificationStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  VERIFIED = "verified",
  FAILED = "failed",
  EXPIRED = "expired",
  REJECTED = "rejected",
}

// =============================================================================
// USER ANALYTICS & INSIGHTS
// =============================================================================

export interface UserAnalytics {
  // Customer lifetime value
  customerLifetimeValue: number;
  predictedLifetimeValue: number;

  // Segmentation
  primarySegment: string;
  allSegments: string[];

  // Behavior scores
  engagementScore: number; // 0-100
  loyaltyScore: number; // 0-100
  satisfactionScore: number; // 0-100
  churnRisk: number; // 0-100

  // Purchase predictions
  nextPurchasePrediction?: PurchasePrediction;

  // Recommendations
  topRecommendations: string[];

  // Value classification
  customerValue: CustomerValue;

  // Last updated
  lastUpdated: string;
}

export interface PurchasePrediction {
  likelihood: number; // 0-100
  timeframe: string; // "next 30 days"
  predictedValue: number;
  confidence: number;
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  factor: string;
  weight: number;
  value: any;
}

export enum CustomerValue {
  LOW_VALUE = "low_value",
  MEDIUM_VALUE = "medium_value",
  HIGH_VALUE = "high_value",
  VIP = "vip",
  CHAMPION = "champion",
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;

  // Segment criteria
  criteria: SegmentCriteria[];

  // Segment size & composition
  memberCount: number;
  averageValue: number;

  // Assignment
  assignedAt: string;
  confidence: number; // How well user fits this segment

  // Targeting
  targetingEnabled: boolean;
}

export interface SegmentCriteria {
  field: string;
  operator: string;
  value: any;
  weight: number;
}

// =============================================================================
// PRIVACY & COMPLIANCE
// =============================================================================

export interface PrivacySettings {
  // Data processing consent
  dataProcessingConsent: ConsentRecord[];

  // Marketing consent
  marketingConsent: ConsentRecord[];

  // Cookie preferences
  cookiePreferences: CookiePreferences;

  // Data sharing
  dataSharingSettings: DataSharingSettings;

  // Right to be forgotten
  deletionRequests: DeletionRequest[];

  // Data portability
  dataExports: DataExportRequest[];
}

export interface ConsentRecord {
  type: ConsentType;
  granted: boolean;
  timestamp: string;
  source: string;
  ipAddress?: string;

  // Legal basis
  legalBasis: LegalBasis;

  // Withdrawal
  withdrawnAt?: string;
  withdrawalReason?: string;
}

export enum ConsentType {
  DATA_PROCESSING = "data_processing",
  MARKETING_EMAIL = "marketing_email",
  MARKETING_SMS = "marketing_sms",
  ANALYTICS = "analytics",
  PERSONALIZATION = "personalization",
  THIRD_PARTY_SHARING = "third_party_sharing",
  COOKIES = "cookies",
}

export enum LegalBasis {
  CONSENT = "consent",
  CONTRACT = "contract",
  LEGAL_OBLIGATION = "legal_obligation",
  VITAL_INTERESTS = "vital_interests",
  PUBLIC_TASK = "public_task",
  LEGITIMATE_INTERESTS = "legitimate_interests",
}

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  thirdParty: boolean;

  // Last updated
  lastUpdated: string;

  // Consent method
  consentMethod: "banner" | "form" | "settings";
}

export interface DataSharingSettings {
  allowAnalyticsSharing: boolean;
  allowMarketingPartners: boolean;
  allowRecommendationEngines: boolean;
  allowSocialMediaIntegration: boolean;

  // Specific partners
  approvedPartners: string[];
  blockedPartners: string[];
}

export interface DeletionRequest {
  id: string;
  requestedAt: string;
  reason?: string;

  // Processing
  status: DeletionStatus;
  processedAt?: string;

  // Retention
  retentionPeriod?: number; // days
  permanentDeletionDate?: string;

  // Verification
  verificationRequired: boolean;
  verifiedAt?: string;
}

export enum DeletionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface DataExportRequest {
  id: string;
  requestedAt: string;
  format: "json" | "csv" | "xml";

  // Processing
  status: ExportStatus;
  processedAt?: string;

  // Download
  downloadUrl?: string;
  expiresAt?: string;
  downloaded: boolean;
  downloadedAt?: string;
}

export enum ExportStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  READY = "ready",
  EXPIRED = "expired",
  FAILED = "failed",
}

// Order summary for user profile
export interface UserOrderSummary {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  itemCount: number;

  // Quick access
  canReorder: boolean;
  canReturn: boolean;
  canReview: boolean;

  // Top item for display
  topItem?: {
    productId: string;
    productName: string;
    productImage?: string;
  };
}

// Communication preferences
export interface CommunicationPreferences {
  // Channel preferences
  channels: ChannelPreference[];

  // Content preferences
  content: ContentPreference[];

  // Frequency limits
  frequency: FrequencyLimits;

  // Personalization
  personalization: PersonalizationPreferences;

  // Opt-out settings
  globalOptOut: boolean;
  optOutCategories: string[];
  optOutHistory: OptOutRecord[];
}

export interface ChannelPreference {
  channel: ContactMethod;
  enabled: boolean;
  priority: number;

  // Time restrictions
  allowedHours?: {
    start: string;
    end: string;
  };

  // Day restrictions
  allowedDays?: number[];

  // Contact details
  contactValue: string; // email, phone, etc.
}

export interface ContentPreference {
  type: string;
  enabled: boolean;
  frequency: string;

  // Customization
  topics?: string[];
  brands?: string[];
  categories?: string[];
}

export interface FrequencyLimits {
  // Global limits
  maxEmailsPerDay: number;
  maxEmailsPerWeek: number;
  maxSMSPerDay: number;
  maxSMSPerWeek: number;

  // Category-specific limits
  categoryLimits: Record<string, number>;

  // Time-based limits
  respectQuietHours: boolean;
  respectTimezone: boolean;
}

export interface PersonalizationPreferences {
  useNameInCommunications: boolean;
  includePurchaseHistory: boolean;
  includeRecommendations: boolean;
  includePriceAlerts: boolean;

  // Content depth
  detailedContent: boolean;
  summaryOnly: boolean;
}

export interface OptOutRecord {
  category?: string;
  optedOutAt: string;
  reason?: string;
  source: string;
}
