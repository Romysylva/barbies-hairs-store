/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// NOTIFICATION & COMMUNICATION TYPES
// =============================================================================

import { TimeRange } from "./admin";
import { DatabaseEntity } from "./index";

// =============================================================================
// CORE NOTIFICATION SYSTEM
// =============================================================================

export interface Notification extends DatabaseEntity {
  // Identification
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;

  // Content
  title: string;
  message: string;
  richContent?: RichNotificationContent;

  // Targeting
  recipients: NotificationRecipient[];

  // Delivery
  channels: NotificationChannel[];
  deliveryStatus: NotificationDeliveryStatus;

  // Timing
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  expiresAt?: string;

  // Interaction
  actions?: NotificationAction[];
  interactionData?: NotificationInteraction[];

  // Context
  contextData?: Record<string, any>;
  relatedEntityType?: string;
  relatedEntityId?: string;

  // Grouping
  groupId?: string;
  threadId?: string;

  // Metadata
  tags?: string[];
  source: NotificationSource;

  // Status
  status: NotificationStatus;
  isRead: boolean;
  isDismissed: boolean;
  isArchived: boolean;
}

export enum NotificationType {
  // Transactional
  ORDER_CONFIRMATION = "order_confirmation",
  ORDER_UPDATE = "order_update",
  SHIPPING_NOTIFICATION = "shipping_notification",
  DELIVERY_CONFIRMATION = "delivery_confirmation",
  PAYMENT_CONFIRMATION = "payment_confirmation",
  REFUND_NOTIFICATION = "refund_notification",

  // Account related
  WELCOME = "welcome",
  ACCOUNT_VERIFICATION = "account_verification",
  PASSWORD_RESET = "password_reset",
  SECURITY_ALERT = "security_alert",
  PROFILE_UPDATE = "profile_update",

  // Marketing
  PROMOTIONAL = "promotional",
  NEWSLETTER = "newsletter",
  PRODUCT_RECOMMENDATION = "product_recommendation",
  PRICE_DROP_ALERT = "price_drop_alert",
  BACK_IN_STOCK = "back_in_stock",
  ABANDONED_CART = "abandoned_cart",

  // Social
  REVIEW_REQUEST = "review_request",
  REVIEW_RESPONSE = "review_response",
  WISHLIST_UPDATE = "wishlist_update",
  SOCIAL_ACTIVITY = "social_activity",

  // System
  SYSTEM_MAINTENANCE = "system_maintenance",
  FEATURE_ANNOUNCEMENT = "feature_announcement",
  POLICY_UPDATE = "policy_update",

  // Custom
  CUSTOM = "custom",
}

export enum NotificationCategory {
  TRANSACTIONAL = "transactional",
  MARKETING = "marketing",
  OPERATIONAL = "operational",
  SOCIAL = "social",
  SECURITY = "security",
  SYSTEM = "system",
  PROMOTIONAL = "promotional",
}

export enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
  CRITICAL = "critical",
}

export interface RichNotificationContent {
  // Rich text content
  html?: string;
  markdown?: string;

  // Media
  images?: NotificationImage[];
  videos?: NotificationVideo[];

  // Interactive elements
  buttons?: NotificationButton[];

  // Structured data
  structuredData?: Record<string, any>;

  // Templates
  templateId?: string;
  templateVariables?: Record<string, any>;
}

export interface NotificationImage {
  url: string;
  altText: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface NotificationVideo {
  url: string;
  title: string;
  thumbnail?: string;
  duration?: number;
}

export interface NotificationButton {
  id: string;
  text: string;
  url?: string;
  action?: string;
  style: ButtonStyle;

  // Tracking
  trackClicks: boolean;
}

export enum ButtonStyle {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  DANGER = "danger",
  SUCCESS = "success",
  WARNING = "warning",
  INFO = "info",
  LINK = "link",
}

export interface NotificationRecipient {
  // Identity
  userId?: string;
  email?: string;
  phone?: string;
  deviceToken?: string;

  // Recipient type
  type: RecipientType;

  // Personalization
  personalizations?: Record<string, string>;

  // Delivery preferences
  preferredChannels: NotificationChannelType[];
  timezone?: string;
  locale?: string;

  // Opt-in status
  hasOptedIn: boolean;
  optInDate?: string;

  // Delivery status for this recipient
  deliveryStatus: RecipientDeliveryStatus;
}

export enum RecipientType {
  USER = "user",
  GUEST = "guest",
  ADMIN = "admin",
  GROUP = "group",
  SEGMENT = "segment",
  ALL_USERS = "all_users",
}

export interface RecipientDeliveryStatus {
  status: DeliveryStatusType;
  attempts: DeliveryAttempt[];

  // Channel-specific status
  channelStatus: Record<NotificationChannelType, ChannelDeliveryStatus>;

  // Interaction tracking
  opened: boolean;
  openedAt?: string;
  clicked: boolean;
  clickedAt?: string;

  // Errors
  lastError?: DeliveryError;
  retryCount: number;
}

export enum DeliveryStatusType {
  PENDING = "pending",
  QUEUED = "queued",
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  FAILED = "failed",
  BOUNCED = "bounced",
  UNSUBSCRIBED = "unsubscribed",
  BLOCKED = "blocked",
}

export interface DeliveryAttempt {
  attemptNumber: number;
  channel: NotificationChannelType;
  timestamp: string;
  status: DeliveryStatusType;
  error?: DeliveryError;
  responseTime?: number;
}

export interface ChannelDeliveryStatus {
  status: DeliveryStatusType;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  error?: DeliveryError;
}

export interface DeliveryError {
  code: string;
  message: string;
  retryable: boolean;
  category: ErrorCategory;
}

export enum ErrorCategory {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  RATE_LIMIT = "rate_limit",
  INVALID_RECIPIENT = "invalid_recipient",
  CONTENT_REJECTED = "content_rejected",
  QUOTA_EXCEEDED = "quota_exceeded",
  PROVIDER_ERROR = "provider_error",
}

export interface NotificationChannel {
  type: NotificationChannelType;
  enabled: boolean;

  // Configuration
  config: ChannelConfig;

  // Provider
  provider: NotificationProvider;

  // Delivery settings
  deliverySettings: ChannelDeliverySettings;

  // Fallback
  fallbackChannels?: NotificationChannelType[];
}

export enum NotificationChannelType {
  EMAIL = "email",
  SMS = "sms",
  PUSH_NOTIFICATION = "push_notification",
  IN_APP = "in_app",
  WEBHOOK = "webhook",
  SLACK = "slack",
  TEAMS = "teams",
  DISCORD = "discord",
  WHATSAPP = "whatsapp",
  TELEGRAM = "telegram",
}

export interface ChannelConfig {
  // Channel-specific settings
  settings: Record<string, any>;

  // Limits
  rateLimits?: RateLimit[];

  // Templates
  defaultTemplateId?: string;

  // Formatting
  contentFormat: ContentFormat;
}

export interface RateLimit {
  period: string; // 'minute', 'hour', 'day'
  limit: number;
  burst?: number;
}

export enum ContentFormat {
  PLAIN_TEXT = "plain_text",
  HTML = "html",
  MARKDOWN = "markdown",
  RICH_TEXT = "rich_text",
  JSON = "json",
}

export interface NotificationProvider {
  id: string;
  name: string;
  type: NotificationChannelType;

  // Configuration
  config: ProviderConfig;

  // Capabilities
  capabilities: ProviderCapability[];

  // Status
  status: ProviderStatus;

  // Performance
  performance: ProviderPerformance;
}

export interface ProviderConfig {
  // API configuration
  apiKey?: string;
  secretKey?: string;
  endpoint?: string;

  // Environment
  environment: "sandbox" | "production";

  // Custom settings
  customSettings?: Record<string, any>;
}

export enum ProviderCapability {
  DELIVERY_STATUS = "delivery_status",
  CLICK_TRACKING = "click_tracking",
  OPEN_TRACKING = "open_tracking",
  UNSUBSCRIBE_HANDLING = "unsubscribe_handling",
  TEMPLATES = "templates",
  PERSONALIZATION = "personalization",
  SCHEDULING = "scheduling",
  A_B_TESTING = "a_b_testing",
  ANALYTICS = "analytics",
}

export enum ProviderStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  ERROR = "error",
  RATE_LIMITED = "rate_limited",
}

export interface ProviderPerformance {
  deliveryRate: number;
  averageDeliveryTime: number; // seconds
  errorRate: number;

  // Recent performance
  last24Hours: PerformanceSnapshot;
  last7Days: PerformanceSnapshot;
  last30Days: PerformanceSnapshot;
}

export interface PerformanceSnapshot {
  sent: number;
  delivered: number;
  failed: number;
  averageTime: number;
  errorRate: number;
}

export interface ChannelDeliverySettings {
  // Retry configuration
  maxRetries: number;
  retryDelay: number; // seconds
  retryBackoff: RetryBackoffStrategy;

  // Timeout settings
  timeout: number; // seconds

  // Batch settings
  batchSize?: number;
  batchDelay?: number; // seconds between batches

  // Throttling
  throttleRate?: number; // messages per second
}

export enum RetryBackoffStrategy {
  FIXED = "fixed",
  LINEAR = "linear",
  EXPONENTIAL = "exponential",
  FIBONACCI = "fibonacci",
}

export interface NotificationDeliveryStatus {
  overall: DeliveryStatusType;

  // Per-channel status
  channels: Record<NotificationChannelType, ChannelDeliveryStatus>;

  // Timing
  queuedAt?: string;
  processingStartedAt?: string;
  completedAt?: string;

  // Statistics
  totalRecipients: number;
  successfulDeliveries: number;
  failedDeliveries: number;

  // Performance
  averageDeliveryTime?: number;

  // Errors
  errors: DeliveryError[];
}

export interface NotificationAction {
  id: string;
  type: ActionType;
  label: string;

  // Action configuration
  url?: string;
  payload?: Record<string, any>;

  // Styling
  style: ButtonStyle;
  icon?: string;

  // Behavior
  opensInNewTab?: boolean;
  requiresConfirmation?: boolean;

  // Tracking
  trackClicks: boolean;
  analyticsEvent?: string;
}

export enum ActionType {
  URL = "url",
  DEEP_LINK = "deep_link",
  API_CALL = "api_call",
  DISMISS = "dismiss",
  SNOOZE = "snooze",
  ARCHIVE = "archive",
  CUSTOM = "custom",
}

export interface NotificationInteraction {
  type: InteractionType;
  timestamp: string;

  // User context
  userId?: string;
  sessionId?: string;
  deviceInfo?: DeviceInfo;

  // Action context
  actionId?: string;
  additionalData?: Record<string, any>;
}

export interface DeviceInfo {
  type: "desktop" | "mobile" | "tablet";
  os: string;
  browser?: string;
  appVersion?: string;
}

export enum InteractionType {
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  DISMISSED = "dismissed",
  SNOOZED = "snoozed",
  ARCHIVED = "archived",
  UNSUBSCRIBED = "unsubscribed",
  REPORTED_SPAM = "reported_spam",
  ACTION_TAKEN = "action_taken",
}

export enum NotificationSource {
  SYSTEM = "system",
  USER_ACTION = "user_action",
  SCHEDULED = "scheduled",
  API = "api",
  WEBHOOK = "webhook",
  ADMIN = "admin",
  AUTOMATION = "automation",
}

export enum NotificationStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  QUEUED = "queued",
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

// =============================================================================
// EMAIL SYSTEM TYPES
// =============================================================================

export interface EmailNotification extends Notification {
  // Email-specific fields
  email: EmailContent;

  // Delivery tracking
  emailDeliveryData: EmailDeliveryData;
}

export interface EmailContent {
  // Basic content
  subject: string;
  preheader?: string;

  // Body content
  textContent: string;
  htmlContent?: string;

  // Email headers
  fromName: string;
  fromEmail: string;
  replyTo?: string;

  // Attachments
  attachments?: EmailAttachment[];

  // Template
  templateId?: string;
  templateVariables?: Record<string, any>;

  // Personalization
  personalizations?: EmailPersonalization[];

  // Tracking
  trackOpens: boolean;
  trackClicks: boolean;
  trackUnsubscribes: boolean;
}

export interface EmailAttachment {
  id: string;
  fileName: string;
  content?: string; // base64 encoded
  contentType: string;
  size: number;
  url?: string; // alternative to content

  // Metadata
  description?: string;
  isInline: boolean;
  contentId?: string; // for inline images
}

export interface EmailPersonalization {
  email: string;
  variables: Record<string, string>;

  // Custom content
  customSubject?: string;
  customContent?: string;

  // Timing
  sendAt?: string;
}

export interface EmailDeliveryData {
  // Provider data
  providerId: string;
  messageId?: string;

  // Bounce handling
  bounceType?: BounceType;
  bounceReason?: string;

  // Spam filtering
  spamScore?: number;
  spamFilterResult?: SpamFilterResult;

  // Engagement
  openCount: number;
  clickCount: number;
  uniqueOpens: number;
  uniqueClicks: number;

  // Unsubscribe
  unsubscribeClicks: number;
  unsubscribeReason?: string;

  // Geographic data
  openLocations?: LocationData[];
  clickLocations?: LocationData[];
}

export enum BounceType {
  HARD = "hard",
  SOFT = "soft",
  COMPLAINT = "complaint",
  SUPPRESSION = "suppression",
}

export interface SpamFilterResult {
  isSpam: boolean;
  score: number;
  reasons?: string[];
  action: SpamAction;
}

export enum SpamAction {
  DELIVER = "deliver",
  QUARANTINE = "quarantine",
  REJECT = "reject",
  FLAG = "flag",
}

export interface LocationData {
  country: string;
  region?: string;
  city?: string;
  timestamp: string;
}

// =============================================================================
// SMS SYSTEM TYPES
// =============================================================================

export interface SMSNotification extends Notification {
  // SMS-specific fields
  sms: SMSContent;

  // Delivery tracking
  smsDeliveryData: SMSDeliveryData;
}

export interface SMSContent {
  // Message content
  content: string;

  // Sender information
  fromNumber: string;

  // Message type
  messageType: SMSMessageType;

  // Encoding
  encoding: SMSEncoding;

  // Media (for MMS)
  mediaUrls?: string[];

  // Compliance
  optOutInstructions?: string;
}

export enum SMSMessageType {
  SMS = "sms",
  MMS = "mms",
  UNICODE = "unicode",
  FLASH = "flash",
}

export enum SMSEncoding {
  GSM_7BIT = "gsm_7bit",
  UCS2 = "ucs2",
  UTF8 = "utf8",
}

export interface SMSDeliveryData {
  // Provider data
  providerId: string;
  messageId?: string;

  // Segments (for long messages)
  segments: number;

  // Carrier information
  carrier?: string;
  country?: string;

  // Delivery status
  carrierStatus?: string;
  carrierTimestamp?: string;

  // Pricing
  cost?: number;
  currency?: string;

  // Error details
  errorCode?: string;
  errorMessage?: string;
}

// =============================================================================
// PUSH NOTIFICATION TYPES
// =============================================================================

export interface PushNotification extends Notification {
  // Push-specific fields
  push: PushContent;

  // Targeting
  pushTargeting: PushTargeting;

  // Delivery tracking
  pushDeliveryData: PushDeliveryData;
}

export interface PushContent {
  // Basic content
  title: string;
  body: string;

  // Visual elements
  icon?: string;
  image?: string;
  badge?: string;

  // Behavior
  sound?: string;
  vibration?: number[];

  // Actions
  actions?: PushAction[];

  // Click behavior
  clickAction?: string;
  url?: string;

  // Custom data
  data?: Record<string, any>;

  // Platform-specific
  android?: AndroidPushConfig;
  ios?: IOSPushConfig;
  web?: WebPushConfig;
}

export interface PushAction {
  id: string;
  title: string;
  icon?: string;
  action: string;

  // Input (for reply actions)
  input?: boolean;
  inputPlaceholder?: string;
}

export interface AndroidPushConfig {
  // Visual
  color?: string;

  // Behavior
  priority: AndroidPriority;
  visibility: AndroidVisibility;

  // Grouping
  tag?: string;
  group?: string;

  // Time to live
  ttl?: number; // seconds

  // Channel
  channelId?: string;

  // Custom data
  data?: Record<string, any>;
}

export enum AndroidPriority {
  NORMAL = "normal",
  HIGH = "high",
}

export enum AndroidVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
  SECRET = "secret",
}

export interface IOSPushConfig {
  // Badge
  badge?: number;

  // Sound
  sound?: string;

  // Content available
  contentAvailable?: boolean;

  // Mutable content
  mutableContent?: boolean;

  // Category
  category?: string;

  // Thread ID
  threadId?: string;

  // Custom data
  customData?: Record<string, any>;
}

export interface WebPushConfig {
  // Service worker
  requireInteraction?: boolean;

  // Visual
  dir?: "ltr" | "rtl" | "auto";
  lang?: string;

  // Behavior
  renotify?: boolean;
  silent?: boolean;

  // Grouping
  tag?: string;

  // Time to live
  ttl?: number;
}

export interface PushTargeting {
  // Device targeting
  platforms: PushPlatform[];
  deviceTypes: DeviceType[];

  // App version targeting
  appVersions?: string[];
  minAppVersion?: string;

  // Geographic targeting
  countries?: string[];
  regions?: string[];
  cities?: string[];

  // Time zone targeting
  timezones?: string[];

  // User segments
  segments?: string[];

  // Behavioral targeting
  lastActiveWithin?: number; // days
  hasCompletedAction?: string;
}

export enum PushPlatform {
  ANDROID = "android",
  IOS = "ios",
  WEB = "web",
  WINDOWS = "windows",
  MACOS = "macos",
}

export enum DeviceType {
  PHONE = "phone",
  TABLET = "tablet",
  DESKTOP = "desktop",
  TV = "tv",
  WATCH = "watch",
}

export interface PushDeliveryData {
  // Provider data
  providerId: string;
  messageId?: string;

  // Platform delivery
  platformDelivery: Record<PushPlatform, PlatformDeliveryData>;

  // Overall metrics
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;

  // Performance
  averageDeliveryTime: number;

  // Errors
  deliveryErrors: PushDeliveryError[];
}

export interface PlatformDeliveryData {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;

  // Platform-specific metrics
  impressions?: number;
  dismissals?: number;
}

export interface PushDeliveryError {
  platform: PushPlatform;
  errorCode: string;
  errorMessage: string;
  count: number;
  percentage: number;
}

// =============================================================================
// EMAIL TEMPLATE SYSTEM
// =============================================================================

export interface EmailTemplate extends DatabaseEntity {
  // Template identification
  name: string;
  slug: string;
  description?: string;

  // Template content
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent: string;

  // Template metadata
  category: TemplateCategory;
  type: NotificationType;

  // Variables
  variables: TemplateVariable[];

  // Design
  design: TemplateDesign;

  // Localization
  localization: TemplateLocalization[];

  // Version control
  version: string;
  parentTemplateId?: string;

  // Testing
  testData?: Record<string, any>;

  // Usage
  usageStats: TemplateUsageStats;

  // Status
  status: TemplateStatus;
  isDefault: boolean;

  // Approval workflow
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
}

export enum TemplateCategory {
  TRANSACTIONAL = "transactional",
  MARKETING = "marketing",
  SYSTEM = "system",
  NOTIFICATION = "notification",
  WELCOME = "welcome",
  PROMOTIONAL = "promotional",
}

export interface TemplateVariable {
  name: string;
  type: VariableType;
  description: string;

  // Validation
  required: boolean;
  defaultValue?: any;

  // Formatting
  format?: VariableFormat;

  // Examples
  examples?: string[];
}

export enum VariableType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  DATE = "date",
  CURRENCY = "currency",
  URL = "url",
  EMAIL = "email",
  PHONE = "phone",
  ARRAY = "array",
  OBJECT = "object",
}

export interface VariableFormat {
  // Number formatting
  decimals?: number;
  currency?: string;

  // Date formatting
  dateFormat?: string;

  // String formatting
  maxLength?: number;
  transform?: "uppercase" | "lowercase" | "capitalize";

  // Validation
  pattern?: string;
  minValue?: number;
  maxValue?: number;
}

export interface TemplateDesign {
  // Layout
  layout: TemplateLayout;

  // Branding
  branding: TemplateBranding;

  // Styling
  colors: TemplateColors;
  typography: TemplateTypography;

  // Components
  components: TemplateComponent[];

  // Responsive design
  responsive: boolean;
  mobileOptimized: boolean;
}

export interface TemplateLayout {
  type: LayoutType;
  width: number;
  maxWidth?: number;

  // Header & footer
  hasHeader: boolean;
  hasFooter: boolean;

  // Sidebar
  hasSidebar: boolean;
  sidebarPosition?: "left" | "right";
}

export enum LayoutType {
  SINGLE_COLUMN = "single_column",
  TWO_COLUMN = "two_column",
  THREE_COLUMN = "three_column",
  GRID = "grid",
  CUSTOM = "custom",
}

export interface TemplateBranding {
  // Logo
  logoUrl?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;

  // Company info
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;

  // Social links
  socialLinks?: SocialLink[];

  // Legal
  unsubscribeUrl: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  link: string;
  border: string;

  // Button colors
  buttonPrimary: string;
  buttonSecondary: string;
  buttonText: string;
}

export interface TemplateTypography {
  // Font families
  headingFont: string;
  bodyFont: string;

  // Font sizes
  headingSize: Record<string, number>;
  bodySize: number;
  captionSize: number;

  // Font weights
  headingWeight: number;
  bodyWeight: number;

  // Line heights
  headingLineHeight: number;
  bodyLineHeight: number;
}

export interface TemplateComponent {
  id: string;
  type: ComponentType;
  position: number;

  // Content
  content: ComponentContent;

  // Styling
  styling: ComponentStyling;

  // Behavior
  behavior: ComponentBehavior;

  // Conditions
  showConditions?: ComponentCondition[];
}

export enum ComponentType {
  HEADER = "header",
  HERO = "hero",
  TEXT_BLOCK = "text_block",
  IMAGE = "image",
  BUTTON = "button",
  PRODUCT_CARD = "product_card",
  PRODUCT_LIST = "product_list",
  SOCIAL_LINKS = "social_links",
  DIVIDER = "divider",
  SPACER = "spacer",
  FOOTER = "footer",
  CUSTOM_HTML = "custom_html",
}

export interface ComponentContent {
  // Text content
  text?: string;
  html?: string;

  // Media content
  imageUrl?: string;
  imageAlt?: string;
  videoUrl?: string;

  // Interactive content
  buttonText?: string;
  buttonUrl?: string;

  // Dynamic content
  variables?: string[];
}

export interface ComponentStyling {
  // Spacing
  margin?: Spacing;
  padding?: Spacing;

  // Colors
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;

  // Typography
  fontSize?: number;
  fontWeight?: number;
  textAlign?: "left" | "center" | "right";

  // Borders
  border?: BorderStyle;
  borderRadius?: number;

  // Responsive
  mobileStyles?: Partial<ComponentStyling>;
}

export interface Spacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface BorderStyle {
  width: number;
  style: "solid" | "dashed" | "dotted";
  color: string;
}

export interface ComponentBehavior {
  // Visibility
  isVisible: boolean;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;

  // Interaction
  isClickable: boolean;
  hoverEffect?: boolean;

  // Animation
  animation?: AnimationType;
  animationDelay?: number;
}

export enum AnimationType {
  NONE = "none",
  FADE_IN = "fade_in",
  SLIDE_IN = "slide_in",
  BOUNCE = "bounce",
  PULSE = "pulse",
}

export interface ComponentCondition {
  variable: string;
  operator: "equals" | "not_equals" | "contains" | "exists";
  value?: any;
}

export interface TemplateLocalization {
  locale: string;

  // Translated content
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent: string;

  // Component translations
  componentTranslations?: Record<string, Record<string, string>>;

  // Variable translations
  variableLabels?: Record<string, string>;

  // Status
  status: LocalizationStatus;
  translatedBy?: string;
  translatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export enum LocalizationStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  REVIEWED = "reviewed",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface TemplateUsageStats {
  // Usage metrics
  totalSent: number;
  lastUsed?: string;

  // Performance metrics
  averageOpenRate: number;
  averageClickRate: number;
  averageUnsubscribeRate: number;

  // A/B testing results
  testResults?: ABTestResult[];

  // Usage by channel
  channelUsage: Record<NotificationChannelType, number>;
}

export interface ABTestResult {
  testId: string;
  variant: string;
  sent: number;
  opens: number;
  clicks: number;
  conversions: number;

  // Statistical significance
  isSignificant: boolean;
  confidence: number;
  winner?: boolean;
}

export enum TemplateStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
  DEPRECATED = "deprecated",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CHANGES_REQUESTED = "changes_requested",
}

// =============================================================================
// NOTIFICATION CAMPAIGNS
// =============================================================================

export interface NotificationCampaign extends DatabaseEntity {
  // Campaign identification
  name: string;
  description?: string;

  // Campaign configuration
  type: CampaignType;
  category: NotificationCategory;

  // Targeting
  targeting: CampaignTargeting;

  // Content
  content: CampaignContent;

  // Scheduling
  schedule: CampaignSchedule;

  // A/B testing
  abTesting?: ABTestConfig;

  // Performance tracking
  performance: CampaignPerformance;

  // Status & lifecycle
  status: CampaignStatus;

  // Approval workflow
  approval?: CampaignApproval;

  // Budget & limits
  budget?: CampaignBudget;
}

export enum CampaignType {
  ONE_TIME = "one_time",
  RECURRING = "recurring",
  TRIGGERED = "triggered",
  DRIP = "drip",
  BEHAVIORAL = "behavioral",
  TRANSACTIONAL = "transactional",
}

export interface CampaignTargeting {
  // Audience
  audienceType: AudienceType;
  audienceSize: number;

  // Segments
  includedSegments: string[];
  excludedSegments: string[];

  // Filters
  filters: AudienceFilter[];

  // Geographic
  geoTargeting?: GeoTargeting;

  // Behavioral
  behavioralTargeting?: BehavioralTargeting;

  // Device targeting
  deviceTargeting?: DeviceTargeting;
}

export enum AudienceType {
  ALL_USERS = "all_users",
  SEGMENTS = "segments",
  CUSTOM = "custom",
  IMPORTED_LIST = "imported_list",
  LOOKALIKE = "lookalike",
}

export interface AudienceFilter {
  field: string;
  operator: FilterOperator;
  value: any;

  // Nested filters
  children?: AudienceFilter[];
  logic?: "and" | "or";
}

export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  IN = "in",
  NOT_IN = "not_in",
  CONTAINS = "contains",
  EXISTS = "exists",
  IS_NULL = "is_null",
}

export interface GeoTargeting {
  // Inclusion
  includedCountries?: string[];
  includedRegions?: string[];
  includedCities?: string[];

  // Exclusion
  excludedCountries?: string[];
  excludedRegions?: string[];
  excludedCities?: string[];

  // Radius targeting
  radiusTargeting?: RadiusTarget[];
}

export interface RadiusTarget {
  latitude: number;
  longitude: number;
  radius: number; // kilometers
  name?: string;
}

export interface BehavioralTargeting {
  // Purchase behavior
  has购买过: boolean;
  purchaseCategories?: string[];
  purchaseAmount?: { min?: number; max?: number };
  purchaseRecency?: number; // days

  // Engagement behavior
  emailEngagement?: EngagementLevel;
  appUsage?: AppUsagePattern;
  websiteActivity?: WebsiteActivityPattern;

  // Custom events
  customEvents?: CustomEventFilter[];
}

export enum EngagementLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

export interface AppUsagePattern {
  lastActiveWithin: number; // days
  sessionCount?: { min?: number; max?: number };
  averageSessionDuration?: { min?: number; max?: number };
  featuresUsed?: string[];
}

export interface WebsiteActivityPattern {
  pageViews?: { min?: number; max?: number };
  timeOnSite?: { min?: number; max?: number };
  pagesVisited?: string[];
  bounceRate?: { min?: number; max?: number };
}

export interface CustomEventFilter {
  eventName: string;
  eventCount?: { min?: number; max?: number };
  eventValue?: { min?: number; max?: number };
  timeframe?: number; // days
  properties?: Record<string, any>;
}

export interface DeviceTargeting {
  platforms: PushPlatform[];
  deviceTypes: DeviceType[];
  operatingSystems?: string[];
  browsers?: string[];
  appVersions?: string[];
}

export interface CampaignContent {
  // Multi-channel content
  channels: Record<NotificationChannelType, ChannelContent>;

  // Shared elements
  subject?: string;
  message: string;

  // Media
  images?: CampaignImage[];

  // Call-to-action
  callToAction?: CallToAction;

  // Personalization
  personalization: PersonalizationConfig;
}

export interface ChannelContent {
  enabled: boolean;
  templateId?: string;
  customContent?: string;

  // Channel-specific overrides
  subject?: string;
  message?: string;

  // Media
  images?: string[];

  // Actions
  actions?: NotificationAction[];
}

export interface CampaignImage {
  id: string;
  url: string;
  altText: string;
  caption?: string;

  // Usage
  usedInChannels: NotificationChannelType[];

  // Optimization
  optimizedVersions?: OptimizedImage[];
}

export interface OptimizedImage {
  size: "thumbnail" | "medium" | "large";
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface CallToAction {
  text: string;
  url: string;

  // Styling
  style: ButtonStyle;

  // Behavior
  opensInNewTab: boolean;

  // Tracking
  trackClicks: boolean;
  utmParameters?: UTMParameters;
}

export interface UTMParameters {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

export interface PersonalizationConfig {
  enabled: boolean;

  // Personalization fields
  fields: PersonalizationField[];

  // Dynamic content
  dynamicContent?: DynamicContentRule[];

  // Fallback values
  fallbackValues: Record<string, string>;
}

export interface PersonalizationField {
  field: string;
  source: PersonalizationSource;

  // Formatting
  format?: VariableFormat;

  // Conditions
  showConditions?: PersonalizationCondition[];
}

export enum PersonalizationSource {
  USER_PROFILE = "user_profile",
  ORDER_DATA = "order_data",
  PRODUCT_DATA = "product_data",
  CUSTOM_ATTRIBUTE = "custom_attribute",
  EXTERNAL_API = "external_api",
  CALCULATED = "calculated",
}

export interface PersonalizationCondition {
  field: string;
  operator: string;
  value: any;
}

export interface DynamicContentRule {
  id: string;
  name: string;

  // Conditions
  conditions: DynamicContentCondition[];
  logic: "and" | "or";

  // Content variations
  content: DynamicContentVariation[];

  // Priority
  priority: number;

  // Status
  enabled: boolean;
}

export interface DynamicContentCondition {
  field: string;
  operator: string;
  value: any;
  source: PersonalizationSource;
}

export interface DynamicContentVariation {
  id: string;
  name: string;
  content: string;

  // Media
  images?: string[];

  // Actions
  actions?: NotificationAction[];

  // Weight (for random selection)
  weight?: number;
}

export interface CampaignSchedule {
  // Basic scheduling
  type: ScheduleType;

  // One-time campaigns
  sendAt?: string;

  // Recurring campaigns
  frequency?: ScheduleFrequency;
  interval?: number;

  // Time constraints
  sendingHours?: TimeWindow;
  sendingDays?: number[];
  timezone: string;

  // Drip campaigns
  dripSequence?: DripStep[];

  // Triggered campaigns
  triggers?: CampaignTrigger[];

  // End conditions
  endDate?: string;
  maxSends?: number;
}

export enum ScheduleType {
  IMMEDIATE = "immediate",
  SCHEDULED = "scheduled",
  RECURRING = "recurring",
  TRIGGERED = "triggered",
  DRIP = "drip",
}

export enum ScheduleFrequency {
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUALLY = "annually",
}

export interface TimeWindow {
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface DripStep {
  stepNumber: number;
  delay: number; // hours from previous step or trigger

  // Content
  templateId: string;
  subject: string;

  // Conditions
  sendConditions?: DripCondition[];

  // Exit conditions
  exitConditions?: DripCondition[];
}

export interface DripCondition {
  type: DripConditionType;
  field: string;
  operator: string;
  value: any;
}

export enum DripConditionType {
  USER_ACTION = "user_action",
  TIME_BASED = "time_based",
  ENGAGEMENT = "engagement",
  PURCHASE = "purchase",
  CUSTOM = "custom",
}

export interface CampaignTrigger {
  id: string;
  type: TriggerType;

  // Event configuration
  event: string;
  conditions: TriggerCondition[];

  // Timing
  delay?: number; // minutes after trigger

  // Frequency limits
  maxTriggersPerUser?: number;
  cooldownPeriod?: number; // hours

  // Status
  enabled: boolean;
}

export enum TriggerType {
  USER_ACTION = "user_action",
  TIME_BASED = "time_based",
  DATA_CHANGE = "data_change",
  EXTERNAL_EVENT = "external_event",
  API_WEBHOOK = "api_webhook",
}

export interface TriggerCondition {
  field: string;
  operator: string;
  value: any;

  // Nested conditions
  children?: TriggerCondition[];
  logic?: "and" | "or";
}

export interface ABTestConfig {
  enabled: boolean;

  // Test configuration
  testName: string;
  hypothesis?: string;

  // Variants
  variants: ABTestVariant[];

  // Traffic allocation
  trafficAllocation: number; // percentage of audience

  // Success metrics
  primaryMetric: string;
  secondaryMetrics?: string[];

  // Test duration
  startDate: string;
  endDate?: string;
  minSampleSize: number;

  // Statistical settings
  confidenceLevel: number; // 90, 95, 99
  expectedLift: number; // percentage

  // Status
  status: ABTestStatus;
  results?: ABTestResults;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description?: string;

  // Traffic split
  trafficPercentage: number;

  // Content differences
  contentOverrides: Record<string, any>;

  // Template override
  templateId?: string;

  // Is this the control group?
  isControl: boolean;
}

export enum ABTestStatus {
  DRAFT = "draft",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
  STOPPED = "stopped",
  ANALYZING = "analyzing",
}

export interface ABTestResults {
  // Overall results
  totalParticipants: number;
  winner?: string;

  // Variant performance
  variantResults: ABTestVariantResults[];

  // Statistical analysis
  statisticalSignificance: boolean;
  confidenceLevel: number;

  // Recommendations
  recommendation: string;

  // Analysis date
  analyzedAt: string;
}

export interface ABTestVariantResults {
  variantId: string;
  variantName: string;

  // Basic metrics
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;

  // Conversion metrics
  conversions: number;
  conversionRate: number;
  revenue?: number;

  // Statistical metrics
  sampleSize: number;
  confidenceInterval: [number, number];
  pValue?: number;

  // Lift compared to control
  liftPercentage?: number;
  isSignificantlyBetter?: boolean;
}

export interface CampaignPerformance {
  // Basic metrics
  totalSent: number;
  totalDelivered: number;
  deliveryRate: number;

  // Engagement metrics
  opens: number;
  openRate: number;
  uniqueOpens: number;
  uniqueOpenRate: number;

  clicks: number;
  clickRate: number;
  uniqueClicks: number;
  uniqueClickRate: number;

  // Conversion metrics
  conversions: number;
  conversionRate: number;
  revenue?: number;
  revenuePerRecipient?: number;

  // Negative metrics
  unsubscribes: number;
  unsubscribeRate: number;
  spamReports: number;
  spamRate: number;
  bounces: number;
  bounceRate: number;

  // Channel breakdown
  channelPerformance: Record<NotificationChannelType, ChannelPerformance>;

  // Time-based analysis
  performanceOverTime: PerformanceTimeline[];

  // Geographic analysis
  performanceByCountry: Record<string, RegionalPerformance>;

  // Device analysis
  performanceByDevice: Record<DeviceType, DevicePerformance>;

  // Cost metrics
  totalCost?: number;
  costPerDelivery?: number;
  costPerConversion?: number;

  // ROI
  roi?: number;
  roas?: number; // Return on ad spend
}

export interface ChannelPerformance {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;

  // Rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;

  // Cost
  cost?: number;

  // Performance score
  performanceScore: number; // 0-100
}

export interface PerformanceTimeline {
  timestamp: string;

  // Cumulative metrics
  cumulativeSent: number;
  cumulativeOpened: number;
  cumulativeClicked: number;
  cumulativeConversions: number;

  // Hourly metrics
  hourlySent: number;
  hourlyOpened: number;
  hourlyClicked: number;
  hourlyConversions: number;
}

export interface RegionalPerformance {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;

  // Regional rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface DevicePerformance {
  sent: number;
  opened: number;
  clicked: number;
  conversions: number;

  // Device-specific rates
  openRate: number;
  clickRate: number;
  conversionRate: number;

  // Engagement quality
  averageTimeSpent?: number;
  interactionDepth?: number;
}

export enum CampaignStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  SENDING = "sending",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export interface CampaignApproval {
  // Approval workflow
  workflow: ApprovalWorkflow;

  // Current status
  status: ApprovalStatus;

  // Approvers
  approvers: CampaignApprover[];

  // Comments
  comments: ApprovalComment[];

  // History
  approvalHistory: ApprovalHistoryEntry[];
}

export interface ApprovalWorkflow {
  steps: ApprovalStep[];
  requiresLegalReview: boolean;
  requiresComplianceReview: boolean;
}

export interface ApprovalStep {
  stepNumber: number;
  name: string;
  requiredApprovers: number;
  approverRoles: string[];

  // Conditions
  conditions?: ApprovalCondition[];

  // Timing
  deadline?: string;
  reminderHours?: number[];
}

export interface ApprovalCondition {
  type: "campaign_type" | "audience_size" | "budget" | "content_type";
  operator: string;
  value: any;
}

export interface CampaignApprover {
  userId: string;
  userName: string;
  role: string;

  // Decision
  decision?: ApprovalDecision;
  decidedAt?: string;
  comments?: string;

  // Delegation
  delegatedTo?: string;
  delegatedAt?: string;
}

export enum ApprovalDecision {
  APPROVED = "approved",
  REJECTED = "rejected",
  CHANGES_REQUESTED = "changes_requested",
  ESCALATED = "escalated",
}

export interface ApprovalComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;

  // Attachments
  attachments?: string[];

  // Type
  type: CommentType;
}

export enum CommentType {
  GENERAL = "general",
  CHANGE_REQUEST = "change_request",
  APPROVAL_NOTE = "approval_note",
  ESCALATION = "escalation",
  REJECTION_REASON = "rejection_reason",
}

export interface ApprovalHistoryEntry {
  action: ApprovalAction;
  performedBy: string;
  timestamp: string;
  details?: Record<string, any>;
  comments?: string;
}

export enum ApprovalAction {
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  CHANGES_REQUESTED = "changes_requested",
  ESCALATED = "escalated",
  DELEGATED = "delegated",
  WITHDRAWN = "withdrawn",
  AUTO_APPROVED = "auto_approved",
}

export interface CampaignBudget {
  // Budget limits
  totalBudget?: number;
  dailyBudget?: number;

  // Cost tracking
  spentBudget: number;
  remainingBudget: number;

  // Cost breakdown
  costByChannel: Record<NotificationChannelType, number>;

  // Alerts
  budgetAlerts: BudgetAlert[];

  // Currency
  currency: string;
}

export interface BudgetAlert {
  threshold: number; // percentage of budget
  triggered: boolean;
  triggeredAt?: string;
  recipients: string[];
}

// =============================================================================
// NOTIFICATION PREFERENCES & SUBSCRIPTIONS
// =============================================================================

export interface NotificationPreferences {
  userId: string;

  // Global settings
  globalOptOut: boolean;
  globalFrequencyLimit: FrequencyLimit;

  // Channel preferences
  channelPreferences: Record<NotificationChannelType, ChannelPreference>;

  // Category preferences
  categoryPreferences: Record<NotificationCategory, CategoryPreference>;

  // Type preferences
  typePreferences: Record<NotificationType, TypePreference>;

  // Time preferences
  timePreferences: TimePreferences;

  // Content preferences
  contentPreferences: ContentPreferences;

  // Subscription history
  subscriptionHistory: SubscriptionHistoryEntry[];
}

export interface FrequencyLimit {
  // Per channel limits
  email: ChannelFrequencyLimit;
  sms: ChannelFrequencyLimit;
  push: ChannelFrequencyLimit;

  // Global limits
  maxPerDay: number;
  maxPerWeek: number;
  maxPerMonth: number;

  // Respect quiet hours
  respectQuietHours: boolean;
}

export interface ChannelFrequencyLimit {
  enabled: boolean;
  maxPerHour: number;
  maxPerDay: number;
  maxPerWeek: number;

  // Priority exceptions
  allowUrgent: boolean;
  allowTransactional: boolean;
}

export interface ChannelPreference {
  enabled: boolean;

  // Contact details
  contactValue: string; // email, phone, device token

  // Delivery settings
  deliverySettings: ChannelDeliveryPreferences;

  // Frequency
  frequencyLimit: ChannelFrequencyLimit;

  // Quality settings
  minPriority: NotificationPriority;

  // Verification
  isVerified: boolean;
  verificationDate?: string;
}

export interface ChannelDeliveryPreferences {
  // Timing
  allowedHours?: TimeWindow;
  allowedDays?: number[];

  // Batching
  allowBatching: boolean;
  batchDelay?: number; // minutes

  // Retry settings
  allowRetries: boolean;
  maxRetries?: number;
}

export interface CategoryPreference {
  enabled: boolean;

  // Frequency override
  frequencyOverride?: FrequencyLimit;

  // Channel restrictions
  allowedChannels: NotificationChannelType[];

  // Priority filter
  minPriority: NotificationPriority;
}

export interface TypePreference {
  enabled: boolean;

  // Channel preferences for this type
  preferredChannels: NotificationChannelType[];

  // Timing preferences
  timingPreference?: TypeTimingPreference;
}

export interface TypeTimingPreference {
  immediate: boolean;
  delayed?: number; // hours
  digest?: DigestPreference;
}

export interface DigestPreference {
  enabled: boolean;
  frequency: DigestFrequency;
  time: string; // "14:00"
  day?: number; // for weekly/monthly
}

export enum DigestFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export interface TimePreferences {
  // Quiet hours
  quietHours: QuietHours;

  // Time zones
  timezone: string;

  // Do not disturb
  doNotDisturb: DoNotDisturbSettings;

  // Peak hours
  preferredHours?: TimeWindow;
}

export interface QuietHours {
  enabled: boolean;
  start: string; // "22:00"
  end: string; // "07:00"

  // Exceptions
  allowUrgent: boolean;
  allowTransactional: boolean;
  emergencyOverride: boolean;

  // Days
  days: number[]; // 0 = Sunday, 6 = Saturday
}

export interface DoNotDisturbSettings {
  enabled: boolean;

  // Scheduled DND periods
  scheduledPeriods: ScheduledDNDPeriod[];

  // Automatic DND
  automaticDND: AutomaticDNDSettings;
}

export interface ScheduledDNDPeriod {
  name: string;
  startDate: string;
  endDate: string;

  // Exceptions
  allowedTypes: NotificationType[];
  emergencyOverride: boolean;
}

export interface AutomaticDNDSettings {
  // Based on device status
  deviceInFocus: boolean;
  deviceIdle: boolean;

  // Based on time patterns
  sleepHoursDetection: boolean;
  workHoursDetection: boolean;

  // Based on activity
  lowActivityPeriods: boolean;
}

export interface ContentPreferences {
  // Language
  language: string;
  secondaryLanguages?: string[];

  // Content style
  contentStyle: ContentStyle;

  // Personalization
  personalizationLevel: PersonalizationLevel;

  // Rich content
  allowRichContent: boolean;
  allowImages: boolean;
  allowVideos: boolean;

  // Accessibility
  accessibilitySettings: NotificationAccessibilitySettings;
}

export enum ContentStyle {
  FORMAL = "formal",
  CASUAL = "casual",
  MINIMAL = "minimal",
  DETAILED = "detailed",
}

export enum PersonalizationLevel {
  NONE = "none",
  BASIC = "basic",
  MODERATE = "moderate",
  HIGH = "high",
  MAXIMUM = "maximum",
}

export interface NotificationAccessibilitySettings {
  // Screen reader support
  screenReaderOptimized: boolean;

  // High contrast
  highContrast: boolean;

  // Large text
  largeText: boolean;

  // Reduce motion
  reduceMotion: boolean;

  // Audio cues
  audioDescriptions: boolean;
}

export interface SubscriptionHistoryEntry {
  action: SubscriptionAction;
  channel?: NotificationChannelType;
  category?: NotificationCategory;
  type?: NotificationType;

  // Context
  reason?: string;
  source: string;

  // Metadata
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export enum SubscriptionAction {
  OPTED_IN = "opted_in",
  OPTED_OUT = "opted_out",
  UPDATED_PREFERENCES = "updated_preferences",
  VERIFIED_CONTACT = "verified_contact",
  UNSUBSCRIBED_ALL = "unsubscribed_all",
  RESUBSCRIBED = "resubscribed",
  FREQUENCY_CHANGED = "frequency_changed",
  CHANNEL_ADDED = "channel_added",
  CHANNEL_REMOVED = "channel_removed",
}

// =============================================================================
// NOTIFICATION ANALYTICS
// =============================================================================

export interface NotificationAnalytics {
  // Overview metrics
  overview: NotificationOverviewMetrics;

  // Channel performance
  channelAnalytics: Record<NotificationChannelType, ChannelAnalytics>;

  // Campaign analytics
  campaignAnalytics: CampaignAnalytics[];

  // Template performance
  templateAnalytics: TemplateAnalytics[];

  // Audience insights
  audienceInsights: AudienceInsights;

  // Deliverability insights
  deliverabilityMetrics: DeliverabilityMetrics;

  // Engagement patterns
  engagementPatterns: EngagementPatterns;

  // Time period
  timeRange: TimeRange;
  lastUpdated: string;
}

export interface NotificationOverviewMetrics {
  // Volume metrics
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalConversions: number;

  // Rate metrics
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;

  // Growth metrics
  growth: NotificationGrowthMetrics;

  // Quality metrics
  qualityScore: number; // 0-100
  reputationScore: number; // 0-100
}

export interface NotificationGrowthMetrics {
  subscriberGrowth: GrowthMetric;
  volumeGrowth: GrowthMetric;
  engagementGrowth: GrowthMetric;
  revenueGrowth: GrowthMetric;
}

export interface GrowthMetric {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: "up" | "down" | "stable";
}

export interface ChannelAnalytics {
  // Basic metrics
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;

  // Performance
  deliveryRate: number;
  openRate: number;
  clickRate: number;

  // Cost metrics
  totalCost?: number;
  averageCostPerSend?: number;

  // Quality metrics
  bounceRate: number;
  unsubscribeRate: number;
  spamRate: number;

  // Trends
  performanceTrends: ChannelTrendData[];

  // Provider performance
  providerPerformance: ProviderPerformanceMetrics[];
}

export interface ChannelTrendData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

export interface ProviderPerformanceMetrics {
  providerId: string;
  providerName: string;

  // Volume
  messagesSent: number;
  messagesDelivered: number;

  // Quality
  deliveryRate: number;
  errorRate: number;

  // Speed
  averageDeliveryTime: number;

  // Cost
  totalCost: number;

  // Score
  performanceScore: number;
  reliability: number;
}

export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;

  // Performance summary
  performance: CampaignPerformance;

  // A/B test results
  abTestResults?: ABTestResults;

  // ROI analysis
  roiAnalysis: ROIAnalysis;
}

export interface ROIAnalysis {
  // Investment
  totalInvestment: number;
  timeInvestment: number; // hours

  // Returns
  directRevenue: number;
  indirectRevenue: number;
  totalRevenue: number;

  // Calculations
  roi: number;
  roas: number;
  paybackPeriod: number; // days

  // Attribution
  attributionModel: string;
  attributionWindow: number; // days
}

export interface TemplateAnalytics {
  templateId: string;
  templateName: string;

  // Usage metrics
  timesUsed: number;
  lastUsed: string;

  // Performance metrics
  averageOpenRate: number;
  averageClickRate: number;
  averageConversionRate: number;

  // A/B test history
  abTestHistory: ABTestHistoryEntry[];

  // Performance score
  performanceScore: number;

  // Comparison
  benchmarkComparison: TemplateBenchmark;
}

export interface ABTestHistoryEntry {
  testId: string;
  testName: string;
  testedAgainst: string;
  winner: boolean;
  liftPercentage: number;
  confidence: number;
  testDate: string;
}

export interface TemplateBenchmark {
  industryAverageOpenRate: number;
  industryAverageClickRate: number;
  performanceVsIndustry: number; // percentage above/below
  ranking: TemplateRanking;
}

export enum TemplateRanking {
  TOP_PERFORMER = "top_performer",
  ABOVE_AVERAGE = "above_average",
  AVERAGE = "average",
  BELOW_AVERAGE = "below_average",
  POOR_PERFORMER = "poor_performer",
}

export interface AudienceInsights {
  // Engagement patterns
  mostEngagedSegments: AudienceSegmentInsight[];
  leastEngagedSegments: AudienceSegmentInsight[];

  // Time patterns
  optimalSendTimes: OptimalTimeInsight[];

  // Channel preferences
  channelPreferences: AudienceChannelPreference[];

  // Content preferences
  contentPreferences: AudienceContentPreference[];

  // Demographic insights
  demographicBreakdown: DemographicInsight[];
}

export interface AudienceSegmentInsight {
  segmentId: string;
  segmentName: string;
  size: number;

  // Engagement metrics
  openRate: number;
  clickRate: number;
  conversionRate: number;

  // Value metrics
  averageOrderValue: number;
  lifetimeValue: number;

  // Characteristics
  topCharacteristics: string[];
}

export interface OptimalTimeInsight {
  // Time details
  timeWindow: TimeWindow;
  dayOfWeek?: number;

  // Performance
  openRate: number;
  clickRate: number;
  conversionRate: number;

  // Confidence
  dataPoints: number;
  confidence: number;

  // Audience
  audienceSize: number;
  segments?: string[];
}

export interface AudienceChannelPreference {
  channel: NotificationChannelType;
  preferenceScore: number; // 0-100

  // Usage patterns
  openRate: number;
  clickRate: number;
  responseTime: number; // average minutes to open

  // Demographics
  demographics: Record<string, any>;
}

export interface AudienceContentPreference {
  contentType: string;
  preferenceScore: number;

  // Performance
  engagementRate: number;
  conversionRate: number;

  // Examples
  topPerformingExamples: string[];
}

export interface DemographicInsight {
  dimension: string; // age, gender, location, etc.
  values: DemographicValue[];
}

export interface DemographicValue {
  value: string;
  count: number;
  percentage: number;

  // Performance for this demographic
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface DeliverabilityMetrics {
  // Overall deliverability
  overallDeliverabilityScore: number; // 0-100

  // Email deliverability
  emailDeliverability: EmailDeliverabilityMetrics;

  // SMS deliverability
  smsDeliverability: SMSDeliverabilityMetrics;

  // Push deliverability
  pushDeliverability: PushDeliverabilityMetrics;

  // Reputation metrics
  senderReputation: SenderReputationMetrics;

  // Blocklist monitoring
  blocklistStatus: BlocklistStatus[];
}

export interface EmailDeliverabilityMetrics {
  // Inbox placement
  inboxPlacementRate: number;
  spamPlacementRate: number;
  promotionsPlacementRate: number;

  // Authentication
  spfPassRate: number;
  dkimPassRate: number;
  dmarcPassRate: number;

  // Reputation
  ipReputation: number;
  domainReputation: number;

  // Provider-specific metrics
  providerMetrics: Record<string, ProviderDeliverabilityMetrics>;
}

export interface ProviderDeliverabilityMetrics {
  provider: string; // Gmail, Yahoo, Outlook, etc.
  inboxRate: number;
  spamRate: number;
  blockedRate: number;

  // Volume
  volumeSent: number;
  volumeDelivered: number;
}

export interface SMSDeliverabilityMetrics {
  // Delivery rates
  deliveryRate: number;

  // Carrier metrics
  carrierDeliveryRates: Record<string, number>;

  // Error analysis
  errorRateByCarrier: Record<string, number>;
  commonErrors: SMSError[];
}

export interface SMSError {
  errorCode: string;
  description: string;
  frequency: number;
  carriers: string[];
}

export interface PushDeliverabilityMetrics {
  // Platform delivery rates
  platformDeliveryRates: Record<PushPlatform, number>;

  // Token health
  validTokenPercentage: number;
  expiredTokens: number;
  invalidTokens: number;

  // Error analysis
  commonErrors: PushError[];
}

export interface PushError {
  platform: PushPlatform;
  errorType: string;
  description: string;
  frequency: number;
  impact: string;
}

export interface SenderReputationMetrics {
  // Overall reputation
  overallScore: number; // 0-100

  // IP reputation
  ipAddresses: IPReputationData[];

  // Domain reputation
  domains: DomainReputationData[];

  // Trends
  reputationTrends: ReputationTrendData[];

  // Factors affecting reputation
  reputationFactors: ReputationFactor[];
}

export interface IPReputationData {
  ipAddress: string;
  reputationScore: number;

  // Metrics affecting reputation
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
  volumeConsistency: number;

  // Status
  isWarming: boolean;
  warmingProgress?: number;

  // Blocklist status
  blocklistStatus: BlocklistStatus[];
}

export interface DomainReputationData {
  domain: string;
  reputationScore: number;

  // Authentication status
  spfStatus: "pass" | "fail" | "softfail";
  dkimStatus: "pass" | "fail" | "none";
  dmarcStatus: "pass" | "fail" | "none";

  // Certificate status
  tlsStatus: "valid" | "invalid" | "expired";

  // DNS status
  mxRecordStatus: "valid" | "invalid";
}

export interface ReputationTrendData {
  date: string;
  reputationScore: number;
  bounceRate: number;
  complaintRate: number;

  // Events affecting reputation
  events?: ReputationEvent[];
}

export interface ReputationEvent {
  type:
    | "blocklist_addition"
    | "blocklist_removal"
    | "high_bounce_rate"
    | "spam_complaints"
    | "volume_spike";
  description: string;
  impact: number; // reputation score change
}

export interface ReputationFactor {
  factor: string;
  currentValue: number;
  idealValue: number;
  impact: number; // weight in reputation calculation
  recommendation?: string;
}

export interface BlocklistStatus {
  blocklistName: string;
  isListed: boolean;
  listedSince?: string;

  // Removal process
  removalInProgress: boolean;
  removalRequestDate?: string;
  estimatedRemovalDate?: string;

  // Impact
  estimatedImpact: number; // percentage of affected emails
}

export interface EngagementPatterns {
  // Time-based patterns
  timePatterns: TimeEngagementPattern[];

  // Content patterns
  contentPatterns: ContentEngagementPattern[];

  // Frequency patterns
  frequencyPatterns: FrequencyEngagementPattern[];

  // Segmentation patterns
  segmentPatterns: SegmentEngagementPattern[];
}

export interface TimeEngagementPattern {
  timeType: "hour" | "day_of_week" | "day_of_month" | "month";
  timeValue: string;

  // Metrics
  openRate: number;
  clickRate: number;
  conversionRate: number;

  // Volume
  sentCount: number;
  audienceSize: number;

  // Confidence
  dataPoints: number;
  significance: number;
}

export interface ContentEngagementPattern {
  contentElement: string;
  elementType: "subject_line" | "call_to_action" | "image" | "personalization";

  // Performance
  engagementLift: number;
  conversionLift: number;

  // Usage
  usageFrequency: number;

  // Examples
  bestPerformingExamples: string[];
  worstPerformingExamples: string[];
}

export interface FrequencyEngagementPattern {
  frequency: string; // 'daily', 'weekly', etc.

  // Metrics by frequency
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;

  // Optimal range
  optimalRange: {
    min: number;
    max: number;
  };

  // Saturation point
  saturationPoint?: number;
}

export interface SegmentEngagementPattern {
  segmentId: string;
  segmentName: string;

  // Engagement metrics
  engagementScore: number;
  preferredChannels: NotificationChannelType[];
  preferredTimes: TimeWindow[];

  // Content preferences
  preferredContentTypes: string[];
  preferredMessageLength: "short" | "medium" | "long";

  // Response patterns
  averageResponseTime: number;
  peakEngagementHours: number[];
}
