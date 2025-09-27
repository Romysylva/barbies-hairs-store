/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// PAYMENT & CHECKOUT TYPES
// =============================================================================

import { Address, DatabaseEntity } from "./index";

// =============================================================================
// CHECKOUT FLOW TYPES
// =============================================================================

export interface CheckoutSession extends DatabaseEntity {
  // Session identification
  sessionId: string;
  customerId?: string;
  guestEmail?: string;

  // Cart data
  items: CheckoutItem[];

  // Pricing breakdown
  pricing: CheckoutPricing;

  // Customer information
  customer: CheckoutCustomer;

  // Shipping information
  shipping: CheckoutShipping;

  // Payment information
  payment: CheckoutPayment;

  // Checkout state
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];

  // Validation
  validation: CheckoutValidation;

  // Session management
  expiresAt: string;
  lastActivity: string;

  // Metadata
  metadata?: Record<string, any>;
  source: CheckoutSource;
}

export interface CheckoutItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;

  // Product details snapshot
  name: string;
  image?: string;
  sku?: string;

  // Customizations
  customizations?: ProductCustomization[];

  // Discounts applied to this item
  discounts?: CheckoutDiscount[];
}

export interface ProductCustomization {
  type: "text" | "image" | "option";
  label: string;
  value: string;
  additionalCost?: number;
}

export interface CheckoutPricing {
  // Item totals
  itemsTotal: number;
  itemsCount: number;

  // Discounts
  discounts: CheckoutDiscount[];
  totalDiscount: number;

  // Tax
  tax: TaxBreakdown;

  // Shipping
  shipping: ShippingCost;

  // Final totals
  subtotal: number;
  total: number;

  // Currency
  currency: string;

  // Savings summary
  totalSavings?: number;
}

export interface CheckoutDiscount {
  id: string;
  code?: string;
  type: DiscountType;
  amount: number;
  description: string;
  appliedTo: "cart" | "shipping" | "item";
  itemId?: string; // If applied to specific item
}

export enum DiscountType {
  FIXED_AMOUNT = "fixed_amount",
  PERCENTAGE = "percentage",
  BOGO = "buy_one_get_one",
  FREE_SHIPPING = "free_shipping",
  TIERED = "tiered",
}

export interface TaxBreakdown {
  enabled: boolean;
  totalTax: number;
  taxLines: TaxLine[];
  taxExempt: boolean;
  taxIncluded: boolean;
}

export interface TaxLine {
  title: string;
  rate: number;
  amount: number;
  jurisdiction: string;
}

export interface ShippingCost {
  enabled: boolean;
  amount: number;
  method?: ShippingMethod;
  estimatedDelivery?: string;
  freeShippingThreshold?: number;
  remainingForFreeShipping?: number;
}

export interface CheckoutCustomer {
  // Basic info
  email: string;
  phone?: string;

  // Names
  firstName?: string;
  lastName?: string;

  // Account
  isGuest: boolean;
  accountId?: string;

  // Marketing preferences
  marketingOptIn: boolean;
  smsOptIn?: boolean;

  // Customer type
  customerType: CustomerType;
  customerGroup?: string;
}

export enum CustomerType {
  GUEST = "guest",
  REGISTERED = "registered",
  RETURNING = "returning",
  VIP = "vip",
  WHOLESALE = "wholesale",
}

export interface CheckoutShipping {
  // Address
  address?: Address;

  // Method selection
  method?: ShippingMethod;
  availableMethods: ShippingMethod[];

  // Delivery options
  deliveryInstructions?: string;
  signatureRequired: boolean;

  // Pickup options
  pickupLocation?: PickupLocation;
  pickupInstructions?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  cost: number;

  // Delivery estimates
  estimatedDays: {
    min: number;
    max: number;
  };
  estimatedDeliveryDate?: string;

  // Method details
  carrier: string;
  service: string;
  trackingAvailable: boolean;

  // Restrictions
  restrictions?: ShippingRestriction[];

  // Features
  features: ShippingFeature[];
}

export interface ShippingRestriction {
  type: "weight" | "dimensions" | "value" | "location" | "item_type";
  condition: string;
  message: string;
}

export enum ShippingFeature {
  SIGNATURE_REQUIRED = "signature_required",
  INSURANCE_INCLUDED = "insurance_included",
  CARBON_NEUTRAL = "carbon_neutral",
  WEEKEND_DELIVERY = "weekend_delivery",
  EXPEDITED = "expedited",
}

export interface PickupLocation {
  id: string;
  name: string;
  address: Address;
  hours: StoreHours[];
  instructions?: string;
  availableFrom: string;
}

export interface StoreHours {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  openTime: string; // "09:00"
  closeTime: string; // "17:00"
  closed: boolean;
}

export interface CheckoutPayment {
  // Selected method
  method?: PaymentMethod;

  // Available methods
  availableMethods: PaymentMethod[];

  // Payment details
  paymentDetails?: PaymentDetails;

  // Processing state
  processing: PaymentProcessingState;

  // Split payments
  splitPayments?: SplitPayment[];

  // Saved payment methods
  savedMethods?: SavedPaymentMethod[];
}

export enum CheckoutStep {
  CART = "cart",
  INFORMATION = "information",
  SHIPPING = "shipping",
  PAYMENT = "payment",
  REVIEW = "review",
  PROCESSING = "processing",
  COMPLETE = "complete",
}

export interface CheckoutValidation {
  isValid: boolean;
  errors: CheckoutError[];
  warnings: CheckoutWarning[];

  // Step validation
  stepValidation: Record<CheckoutStep, StepValidation>;
}

export interface CheckoutError {
  field?: string;
  code: string;
  message: string;
  step: CheckoutStep;
}

export interface CheckoutWarning {
  code: string;
  message: string;
  step: CheckoutStep;
  dismissible: boolean;
}

export interface StepValidation {
  isValid: boolean;
  canProceed: boolean;
  errors: CheckoutError[];
  warnings: CheckoutWarning[];
}

export enum CheckoutSource {
  WEB = "web",
  MOBILE_APP = "mobile_app",
  POS = "pos",
  API = "api",
  ADMIN = "admin",
}

// =============================================================================
// PAYMENT METHOD TYPES
// =============================================================================

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  description?: string;

  // Provider details
  provider: PaymentProvider;

  // Availability
  enabled: boolean;
  availableCountries?: string[];
  availableCurrencies?: string[];

  // Limits
  minAmount?: number;
  maxAmount?: number;

  // Features
  features: PaymentMethodFeature[];

  // Processing fees
  fees?: PaymentFeeStructure;

  // UI configuration
  ui: PaymentMethodUI;

  // Risk assessment
  riskLevel: PaymentRiskLevel;
}

export enum PaymentMethodType {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  DIGITAL_WALLET = "digital_wallet",
  BANK_TRANSFER = "bank_transfer",
  BUY_NOW_PAY_LATER = "buy_now_pay_later",
  CRYPTOCURRENCY = "cryptocurrency",
  GIFT_CARD = "gift_card",
  STORE_CREDIT = "store_credit",
  CASH_ON_DELIVERY = "cash_on_delivery",
  CHECK = "check",
  MANUAL = "manual",
}

export interface PaymentProvider {
  id: string;
  name: string;
  slug: string;
  apiVersion?: string;

  // Configuration
  config: PaymentProviderConfig;

  // Capabilities
  capabilities: PaymentCapability[];

  // Webhooks
  webhookEndpoint?: string;
  webhookSecrets?: Record<string, string>;
}

export interface PaymentProviderConfig {
  // API credentials (encrypted)
  publicKey?: string;
  secretKey?: string;
  merchantId?: string;

  // Environment
  environment: "sandbox" | "production";

  // Custom settings
  settings?: Record<string, any>;
}

export enum PaymentCapability {
  AUTHORIZE = "authorize",
  CAPTURE = "capture",
  VOID = "void",
  REFUND = "refund",
  PARTIAL_REFUND = "partial_refund",
  RECURRING = "recurring",
  TOKENIZATION = "tokenization",
  WEBHOOKS = "webhooks",
  FRAUD_DETECTION = "fraud_detection",
}

export enum PaymentMethodFeature {
  INSTANT = "instant",
  SECURE = "secure",
  TOKENIZABLE = "tokenizable",
  REFUNDABLE = "refundable",
  RECURRING_CAPABLE = "recurring_capable",
  MOBILE_OPTIMIZED = "mobile_optimized",
  ONE_CLICK = "one_click",
}

export interface PaymentFeeStructure {
  type: "fixed" | "percentage" | "tiered";
  fixed?: number;
  percentage?: number;
  tiers?: PaymentFeeTier[];
  currency: string;
}

export interface PaymentFeeTier {
  minAmount: number;
  maxAmount?: number;
  fixed?: number;
  percentage?: number;
}

export interface PaymentMethodUI {
  icon?: string;
  color?: string;
  displayOrder: number;
  showInCheckout: boolean;
  showInAccount: boolean;

  // Form configuration
  fields?: PaymentFormField[];

  // Styling
  customCSS?: string;
}

export interface PaymentFormField {
  name: string;
  type: "text" | "email" | "tel" | "number" | "select" | "hidden";
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation;
  options?: SelectOption[];
}

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

export enum PaymentRiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

// =============================================================================
// PAYMENT PROCESSING TYPES
// =============================================================================

export interface PaymentDetails {
  // Card details (tokenized)
  card?: PaymentCardDetails;

  // Digital wallet
  digitalWallet?: DigitalWalletDetails;

  // Bank transfer
  bankTransfer?: BankTransferDetails;

  // Buy now, pay later
  bnpl?: BNPLDetails;

  // Gift card
  giftCard?: GiftCardDetails;

  // Generic details for other methods
  details?: Record<string, any>;
}

export interface PaymentCardDetails {
  // Tokenized card data
  token: string;

  // Display information
  brand: CardBrand;
  last4: string;
  expiryMonth: string;
  expiryYear: string;

  // Billing address
  billingAddress?: Address;

  // Verification
  cvvProvided: boolean;
  avsResult?: AVSResult;
  cvvResult?: CVVResult;

  // 3D Secure
  threeDSecure?: ThreeDSecureResult;
}

export enum CardBrand {
  VISA = "visa",
  MASTERCARD = "mastercard",
  AMERICAN_EXPRESS = "amex",
  DISCOVER = "discover",
  DINERS_CLUB = "diners",
  JCB = "jcb",
  UNIONPAY = "unionpay",
  MAESTRO = "maestro",
}

export interface AVSResult {
  code: string;
  message: string;
  matched: boolean;
}

export interface CVVResult {
  code: string;
  message: string;
  matched: boolean;
}

export interface ThreeDSecureResult {
  authenticated: boolean;
  version: string;
  status: string;
  cavv?: string;
  eci?: string;
  xid?: string;
}

export interface DigitalWalletDetails {
  provider: DigitalWalletProvider;
  walletToken: string;
  deviceData?: Record<string, any>;
}

export enum DigitalWalletProvider {
  APPLE_PAY = "apple_pay",
  GOOGLE_PAY = "google_pay",
  SAMSUNG_PAY = "samsung_pay",
  PAYPAL = "paypal",
  AMAZON_PAY = "amazon_pay",
}

export interface BankTransferDetails {
  bankName?: string;
  accountType?: string;
  routingNumber?: string;
  accountNumberMask?: string;
  verificationMethod?: string;
}

export interface BNPLDetails {
  provider: BNPLProvider;
  installmentPlan: InstallmentPlan;
  approvalCode?: string;
}

export enum BNPLProvider {
  KLARNA = "klarna",
  AFTERPAY = "afterpay",
  AFFIRM = "affirm",
  SEZZLE = "sezzle",
  QUADPAY = "quadpay",
}

export interface InstallmentPlan {
  numberOfPayments: number;
  paymentAmount: number;
  totalInterest: number;
  apr: number;
  schedule: InstallmentSchedule[];
}

export interface InstallmentSchedule {
  paymentNumber: number;
  amount: number;
  dueDate: string;
  status: InstallmentStatus;
}

export enum InstallmentStatus {
  PENDING = "pending",
  PAID = "paid",
  OVERDUE = "overdue",
  FAILED = "failed",
}

export interface GiftCardDetails {
  code: string;
  balance: number;
  appliedAmount: number;
  remainingBalance: number;
}

export interface PaymentProcessingState {
  status: PaymentStatus;
  step: PaymentProcessingStep;

  // Transaction details
  transactionId?: string;
  authorizationId?: string;
  captureId?: string;

  // Timing
  initiatedAt?: string;
  processedAt?: string;

  // Error handling
  error?: PaymentError;
  retryCount: number;
  maxRetries: number;

  // Fraud detection
  riskAssessment?: RiskAssessment;
}

export enum PaymentStatus {
  IDLE = "idle",
  PROCESSING = "processing",
  REQUIRES_CONFIRMATION = "requires_confirmation",
  REQUIRES_ACTION = "requires_action",
  AUTHORIZED = "authorized",
  CAPTURED = "captured",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

export enum PaymentProcessingStep {
  INITIALIZING = "initializing",
  VALIDATING = "validating",
  AUTHORIZING = "authorizing",
  FRAUD_CHECK = "fraud_check",
  CAPTURING = "capturing",
  CONFIRMING = "confirming",
  COMPLETED = "completed",
}

export interface PaymentError {
  code: string;
  message: string;
  type: PaymentErrorType;
  declineCode?: string;
  userMessage: string;
  retryable: boolean;
}

export enum PaymentErrorType {
  CARD_DECLINED = "card_declined",
  INSUFFICIENT_FUNDS = "insufficient_funds",
  EXPIRED_CARD = "expired_card",
  INCORRECT_CVC = "incorrect_cvc",
  PROCESSING_ERROR = "processing_error",
  FRAUD_SUSPECTED = "fraud_suspected",
  NETWORK_ERROR = "network_error",
  INVALID_REQUEST = "invalid_request",
}

export interface RiskAssessment {
  score: number; // 0-100
  level: RiskLevel;
  factors: RiskFactor[];
  recommendation: RiskRecommendation;

  // Provider-specific data
  providerData?: Record<string, any>;
}

export enum RiskLevel {
  VERY_LOW = "very_low",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

export interface RiskFactor {
  type: string;
  score: number;
  description: string;
}

export enum RiskRecommendation {
  APPROVE = "approve",
  REVIEW = "review",
  DECLINE = "decline",
  CHALLENGE = "challenge",
}

// =============================================================================
// ADVANCED PAYMENT FEATURES
// =============================================================================

export interface SplitPayment {
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
}

export interface SavedPaymentMethod {
  id: string;
  customerId: string;
  type: PaymentMethodType;

  // Display information
  displayName: string;
  brand?: string;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;

  // Tokenization
  token: string;
  fingerprint?: string;

  // Settings
  isDefault: boolean;
  isExpired: boolean;

  // Usage tracking
  lastUsed?: string;
  usageCount: number;

  // Verification
  verified: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Recurring payments
export interface RecurringPayment {
  id: string;
  customerId: string;
  paymentMethodId: string;

  // Schedule
  frequency: RecurringFrequency;
  interval: number;
  nextPaymentDate: string;

  // Amount
  amount: number;
  currency: string;

  // Status
  status: RecurringStatus;

  // Retry logic
  retryPolicy: RetryPolicy;

  // History
  paymentHistory: RecurringPaymentHistory[];

  // Metadata
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum RecurringFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUALLY = "annually",
}

export enum RecurringStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  CANCELLED = "cancelled",
  FAILED = "failed",
  EXPIRED = "expired",
}

export interface RetryPolicy {
  enabled: boolean;
  maxRetries: number;
  retryInterval: number; // hours
  backoffMultiplier: number;
}

export interface RecurringPaymentHistory {
  id: string;
  paymentDate: string;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  error?: PaymentError;
  retryCount: number;
}

// Payment disputes and chargebacks
export interface PaymentDispute {
  id: string;
  transactionId: string;

  // Dispute details
  type: DisputeType;
  reason: string;
  reasonCode: string;
  amount: number;
  currency: string;

  // Timeline
  disputeDate: string;
  responseDeadline: string;

  // Status
  status: DisputeStatus;

  // Evidence
  evidence: DisputeEvidence[];

  // Communication
  messages: DisputeMessage[];

  // Resolution
  resolution?: DisputeResolution;
}

export enum DisputeType {
  CHARGEBACK = "chargeback",
  INQUIRY = "inquiry",
  RETRIEVAL_REQUEST = "retrieval_request",
  FRAUD = "fraud",
}

export enum DisputeStatus {
  OPEN = "open",
  UNDER_REVIEW = "under_review",
  REQUIRES_ACTION = "requires_action",
  WON = "won",
  LOST = "lost",
  ACCEPTED = "accepted",
}

export interface DisputeEvidence {
  type: string;
  description: string;
  fileUrl?: string;
  submittedAt: string;
}

export interface DisputeMessage {
  id: string;
  from: "merchant" | "customer" | "processor";
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface DisputeResolution {
  outcome: "won" | "lost" | "accepted";
  amount: number;
  reason: string;
  resolvedAt: string;
}

// Payment analytics
export interface PaymentAnalytics {
  // Volume metrics
  totalTransactions: number;
  totalVolume: number;
  averageTransactionValue: number;

  // Success metrics
  successRate: number;
  authorizationRate: number;
  captureRate: number;

  // Decline analysis
  declineRate: number;
  declinesByReason: Record<string, number>;

  // Method performance
  methodPerformance: PaymentMethodPerformance[];

  // Geographic breakdown
  volumeByCountry: Record<string, number>;

  // Time-based analysis
  hourlyVolume: Record<string, number>;
  dailyVolume: Record<string, number>;

  // Risk metrics
  fraudRate: number;
  chargebackRate: number;

  // Processing costs
  totalFees: number;
  averageFeeRate: number;
}

export interface PaymentMethodPerformance {
  methodType: PaymentMethodType;
  transactions: number;
  volume: number;
  successRate: number;
  averageProcessingTime: number;
  customerPreferenceRank: number;
}

// Webhooks and notifications
export interface PaymentWebhook {
  id: string;
  event: PaymentWebhookEvent;
  data: PaymentWebhookData;

  // Delivery
  url: string;
  httpMethod: "POST" | "PUT";
  headers?: Record<string, string>;

  // Security
  signature?: string;
  secret?: string;

  // Retry logic
  attempts: WebhookAttempt[];
  maxAttempts: number;

  // Status
  status: WebhookStatus;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export enum PaymentWebhookEvent {
  PAYMENT_AUTHORIZED = "payment.authorized",
  PAYMENT_CAPTURED = "payment.captured",
  PAYMENT_FAILED = "payment.failed",
  PAYMENT_REFUNDED = "payment.refunded",
  CHARGEBACK_CREATED = "chargeback.created",
  DISPUTE_CREATED = "dispute.created",
}

export interface PaymentWebhookData {
  paymentId: string;
  orderId?: string;
  customerId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
}

export interface WebhookAttempt {
  attemptNumber: number;
  timestamp: string;
  httpStatus?: number;
  response?: string;
  error?: string;
  nextRetryAt?: string;
}

export enum WebhookStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  FAILED = "failed",
  RETRYING = "retrying",
  ABANDONED = "abandoned",
}
