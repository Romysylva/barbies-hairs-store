/* eslint-disable @typescript-eslint/no-unused-vars */
// =============================================================================
// REVIEW & RATING SYSTEM TYPES
// =============================================================================

import { DatabaseEntity, User } from "./index";
import { Product } from "./product";

// =============================================================================
// CORE REVIEW TYPES
// =============================================================================

export interface ProductReview extends DatabaseEntity {
  // Basic information
  title: string;
  content: string;
  rating: number; // 1-5 scale

  // Author information
  author: ReviewAuthor;

  // Product reference
  productId: string;
  productName: string; // Snapshot for historical purposes
  productVariantId?: string;

  // Purchase verification
  verifiedPurchase: boolean;
  orderId?: string;
  purchaseDate?: string;

  // Review status
  status: ReviewStatus;
  moderationStatus: ModerationStatus;

  // Engagement metrics
  helpfulVotes: number;
  totalVotes: number;
  helpfulnessRatio: number; // helpfulVotes / totalVotes

  // Media attachments
  media?: ReviewMedia[];

  // Review metadata
  source: ReviewSource;
  language?: string;

  // Moderation
  moderation?: ReviewModeration;

  // Response from merchant
  merchantResponse?: MerchantResponse;

  // Analytics
  analytics: ReviewAnalytics;
}

export interface ReviewAuthor {
  // Identity (can be anonymous)
  id?: string;
  displayName: string;
  isAnonymous: boolean;

  // Customer details (if not anonymous)
  customerId?: string;
  email?: string;

  // Author credibility
  totalReviews: number;
  averageRating: number;
  verifiedPurchaseCount: number;
  accountAge?: number; // days since account creation

  // Location (optional)
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };

  // Author badges/labels
  badges?: ReviewerBadge[];
}

export interface ReviewerBadge {
  type: BadgeType;
  label: string;
  description?: string;
  icon?: string;
  earnedAt: string;
}

export enum BadgeType {
  TOP_REVIEWER = "top_reviewer",
  VERIFIED_BUYER = "verified_buyer",
  EXPERT_REVIEWER = "expert_reviewer",
  FREQUENT_REVIEWER = "frequent_reviewer",
  HELPFUL_REVIEWER = "helpful_reviewer",
  EARLY_ADOPTER = "early_adopter",
  VINE_REVIEWER = "vine_reviewer",
}

export enum ReviewStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  PUBLISHED = "published",
  HIDDEN = "hidden",
  DELETED = "deleted",
  ARCHIVED = "archived",
}

export enum ModerationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  FLAGGED = "flagged",
  UNDER_REVIEW = "under_review",
  AUTO_APPROVED = "auto_approved",
}

export interface ReviewMedia {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;

  // Media metadata
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number; // for videos

  // Captions and descriptions
  caption?: string;
  altText?: string;

  // Moderation
  moderationStatus: ModerationStatus;
  moderationFlags?: string[];

  // Upload info
  uploadedAt: string;
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
}

export enum ReviewSource {
  WEBSITE = "website",
  MOBILE_APP = "mobile_app",
  EMAIL_INVITATION = "email_invitation",
  POST_PURCHASE = "post_purchase",
  SOCIAL_MEDIA = "social_media",
  THIRD_PARTY = "third_party",
  ADMIN = "admin",
  IMPORT = "import",
}

// =============================================================================
// REVIEW MODERATION
// =============================================================================

export interface ReviewModeration {
  // Moderation history
  history: ModerationHistoryEntry[];

  // Flags and issues
  flags: ReviewFlag[];

  // Automated analysis
  aiAnalysis?: AIReviewAnalysis;

  // Manual review
  manualReview?: ManualReviewEntry;

  // Decision
  decision: ModerationDecision;
  decisionReason?: string;

  // Timing
  submittedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
}

export interface ModerationHistoryEntry {
  action: ModerationAction;
  moderatorId?: string;
  moderatorName?: string;
  reason?: string;
  timestamp: string;

  // Context
  previousStatus?: ModerationStatus;
  newStatus: ModerationStatus;

  // Notes
  notes?: string;
}

export enum ModerationAction {
  SUBMIT = "submit",
  APPROVE = "approve",
  REJECT = "reject",
  FLAG = "flag",
  EDIT = "edit",
  DELETE = "delete",
  RESTORE = "restore",
  AUTO_APPROVE = "auto_approve",
  AUTO_REJECT = "auto_reject",
}

export interface ReviewFlag {
  id: string;
  type: FlagType;
  reason: string;

  // Reporter information
  reporterId?: string;
  reporterType: ReporterType;

  // Flag status
  status: FlagStatus;

  // Resolution
  resolution?: FlagResolution;

  // Timing
  flaggedAt: string;
  resolvedAt?: string;
}

export enum FlagType {
  SPAM = "spam",
  INAPPROPRIATE_CONTENT = "inappropriate_content",
  FAKE_REVIEW = "fake_review",
  WRONG_PRODUCT = "wrong_product",
  PERSONAL_INFORMATION = "personal_information",
  COPYRIGHT_VIOLATION = "copyright_violation",
  HARASSMENT = "harassment",
  OFF_TOPIC = "off_topic",
  DUPLICATE = "duplicate",
  COMPETITOR_REVIEW = "competitor_review",
}

export enum ReporterType {
  CUSTOMER = "customer",
  MODERATOR = "moderator",
  ADMIN = "admin",
  SYSTEM = "system",
  THIRD_PARTY = "third_party",
}

export enum FlagStatus {
  OPEN = "open",
  INVESTIGATING = "investigating",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export interface FlagResolution {
  action: ResolutionAction;
  reason: string;
  moderatorId?: string;
  notes?: string;
}

export enum ResolutionAction {
  NO_ACTION = "no_action",
  EDIT_REVIEW = "edit_review",
  HIDE_REVIEW = "hide_review",
  DELETE_REVIEW = "delete_review",
  WARNING_SENT = "warning_sent",
  ACCOUNT_SUSPENDED = "account_suspended",
  CONTENT_UPDATED = "content_updated",
}

export interface AIReviewAnalysis {
  // Content analysis
  sentiment: SentimentAnalysis;
  toxicity: ToxicityAnalysis;
  authenticity: AuthenticityAnalysis;

  // Language detection
  detectedLanguage: string;
  confidence: number;

  // Topic extraction
  topics: string[];
  keywords: string[];

  // Quality metrics
  quality: ContentQualityScore;

  // Recommendations
  recommendations: AIRecommendation[];

  // Analysis metadata
  model: string;
  version: string;
  analyzedAt: string;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: "positive" | "neutral" | "negative";
  confidence: number;
  aspects?: AspectSentiment[];
}

export interface AspectSentiment {
  aspect: string;
  sentiment: number;
  confidence: number;
}

export interface ToxicityAnalysis {
  score: number; // 0 to 1
  categories: ToxicityCategory[];
  isAcceptable: boolean;
}

export interface ToxicityCategory {
  category: string;
  score: number;
  threshold: number;
}

export interface AuthenticityAnalysis {
  score: number; // 0 to 1 (1 = likely authentic)
  signals: AuthenticitySignal[];
  isLikelyFake: boolean;
}

export interface AuthenticitySignal {
  type: string;
  score: number;
  description: string;
}

export interface ContentQualityScore {
  overall: number; // 0 to 1
  factors: QualityFactor[];
}

export interface QualityFactor {
  factor: string;
  score: number;
  weight: number;
  description: string;
}

export interface AIRecommendation {
  type: RecommendationType;
  confidence: number;
  reason: string;
  suggestedAction?: string;
}

export enum RecommendationType {
  AUTO_APPROVE = "auto_approve",
  MANUAL_REVIEW = "manual_review",
  AUTO_REJECT = "auto_reject",
  REQUEST_VERIFICATION = "request_verification",
  FLAG_FOR_REVIEW = "flag_for_review",
}

export interface ManualReviewEntry {
  moderatorId: string;
  moderatorName: string;

  // Review decision
  decision: ModerationDecision;
  confidence: ReviewConfidence;

  // Feedback
  feedback?: string;
  notes?: string;

  // Time spent
  timeSpent?: number; // minutes

  // Review timestamp
  reviewedAt: string;
}

export enum ModerationDecision {
  APPROVE = "approve",
  APPROVE_WITH_EDITS = "approve_with_edits",
  REJECT = "reject",
  REQUEST_CLARIFICATION = "request_clarification",
  ESCALATE = "escalate",
  DEFER = "defer",
}

export enum ReviewConfidence {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

export interface MerchantResponse {
  id: string;
  responderId: string;
  responderName: string;
  responderTitle?: string;

  // Response content
  content: string;

  // Status
  isPublic: boolean;
  status: ResponseStatus;

  // Engagement
  helpfulVotes: number;
  totalVotes: number;

  // Timing
  respondedAt: string;
  lastEditedAt?: string;

  // Moderation
  moderated: boolean;
  moderationNotes?: string;
}

export enum ResponseStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  HIDDEN = "hidden",
  DELETED = "deleted",
}

// =============================================================================
// REVIEW ENGAGEMENT & INTERACTION
// =============================================================================

export interface ReviewVote {
  id: string;
  reviewId: string;
  voterId?: string; // null for anonymous votes

  // Vote details
  voteType: VoteType;
  isHelpful: boolean;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;

  // Fraud detection
  isVerified: boolean;
  suspiciousActivity?: boolean;
}

export enum VoteType {
  HELPFUL = "helpful",
  NOT_HELPFUL = "not_helpful",
  REPORT = "report",
  SHARE = "share",
}

export interface ReviewComment {
  id: string;
  reviewId: string;

  // Author
  authorId?: string;
  authorName: string;
  authorType: CommentAuthorType;

  // Content
  content: string;

  // Status
  status: CommentStatus;

  // Engagement
  likes: number;

  // Moderation
  flagged: boolean;
  moderationStatus: ModerationStatus;

  // Timing
  createdAt: string;
  updatedAt?: string;
}

export enum CommentAuthorType {
  CUSTOMER = "customer",
  MERCHANT = "merchant",
  VERIFIED_BUYER = "verified_buyer",
  MODERATOR = "moderator",
}

export enum CommentStatus {
  PUBLISHED = "published",
  PENDING = "pending",
  HIDDEN = "hidden",
  DELETED = "deleted",
}

// =============================================================================
// REVIEW ANALYTICS & INSIGHTS
// =============================================================================

export interface ReviewAnalytics {
  // Basic metrics
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;

  // Time-based metrics
  reviewsThisMonth: number;
  reviewsLastMonth: number;
  growthRate: number;

  // Quality metrics
  verifiedPurchaseRate: number;
  averageReviewLength: number;
  mediaAttachmentRate: number;

  // Engagement metrics
  averageHelpfulnessRatio: number;
  responseRate: number;
  averageResponseTime: number; // hours

  // Sentiment analysis
  sentimentBreakdown: SentimentBreakdown;

  // Review trends
  trends: ReviewTrend[];

  // Top issues and compliments
  topIssues: ReviewTheme[];
  topCompliments: ReviewTheme[];

  // Comparison data
  competitorComparison?: CompetitorReviewData;

  // Review sources
  sourceBreakdown: Record<ReviewSource, number>;

  // Moderation metrics
  moderationStats: ModerationStatistics;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;

  // Aspect-based sentiment
  aspects?: Record<string, AspectSentiment>;
}

export interface ReviewTrend {
  period: string; // 'daily', 'weekly', 'monthly'
  data: ReviewTrendData[];
}

export interface ReviewTrendData {
  date: string;
  reviewCount: number;
  averageRating: number;
  sentiment: number;
}

export interface ReviewTheme {
  theme: string;
  mentions: number;
  sentiment: number;
  keywords: string[];
  examples: string[]; // Sample review excerpts
}

export interface CompetitorReviewData {
  competitorName: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  lastUpdated: string;
}

export interface ModerationStatistics {
  // Volume metrics
  totalReviews: number;
  pendingReviews: number;

  // Approval metrics
  approvalRate: number;
  autoApprovalRate: number;

  // Rejection metrics
  rejectionRate: number;
  rejectionReasons: Record<string, number>;

  // Response times
  averageModerationTime: number; // hours
  slaCompliance: number; // percentage

  // Quality metrics
  falsePositiveRate: number;
  falseNegativeRate: number;

  // Flag metrics
  flaggedReviews: number;
  flagTypes: Record<FlagType, number>;
}

// =============================================================================
// REVIEW COLLECTION & CAMPAIGNS
// =============================================================================

export interface ReviewInvitation {
  id: string;

  // Target information
  customerId: string;
  customerEmail: string;
  customerName: string;

  // Product information
  productId: string;
  productName: string;
  orderId: string;
  orderDate: string;

  // Campaign information
  campaignId?: string;

  // Invitation details
  invitationType: InvitationType;
  templateId: string;

  // Scheduling
  scheduledAt: string;
  sentAt?: string;

  // Response tracking
  status: InvitationStatus;
  openedAt?: string;
  clickedAt?: string;
  reviewSubmittedAt?: string;
  reviewId?: string;

  // Reminder system
  reminders: InvitationReminder[];

  // Personalization
  personalizations?: Record<string, string>;

  // Preferences
  unsubscribed: boolean;
}

export enum InvitationType {
  EMAIL = "email",
  SMS = "sms",
  PUSH_NOTIFICATION = "push_notification",
  IN_APP = "in_app",
}

export enum InvitationStatus {
  SCHEDULED = "scheduled",
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  RESPONDED = "responded",
  EXPIRED = "expired",
  FAILED = "failed",
  UNSUBSCRIBED = "unsubscribed",
}

export interface InvitationReminder {
  id: string;
  reminderNumber: number;
  scheduledAt: string;
  sentAt?: string;
  status: InvitationStatus;
}

export interface ReviewCampaign {
  id: string;
  name: string;
  description?: string;

  // Campaign settings
  status: CampaignStatus;
  startDate: string;
  endDate?: string;

  // Targeting
  targeting: CampaignTargeting;

  // Templates
  templates: CampaignTemplate[];

  // Scheduling
  schedule: CampaignSchedule;

  // Performance
  performance: CampaignPerformance;

  // Settings
  settings: CampaignSettings;
}

export enum CampaignStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface CampaignTargeting {
  // Product targeting
  productIds?: string[];
  categoryIds?: string[];

  // Customer targeting
  customerSegments?: string[];
  customerGroups?: string[];

  // Purchase criteria
  minOrderValue?: number;
  purchaseDateRange?: {
    start: string;
    end: string;
  };

  // Geographic targeting
  countries?: string[];
  regions?: string[];

  // Behavioral targeting
  previousReviewers?: boolean;
  highValueCustomers?: boolean;
  frequentBuyers?: boolean;
}

export interface CampaignTemplate {
  id: string;
  type: InvitationType;
  subject?: string; // for email/SMS
  content: string;

  // Personalization variables
  variables: string[];

  // A/B testing
  variant?: string;
  weight?: number; // for testing distribution
}

export interface CampaignSchedule {
  // Trigger settings
  trigger: CampaignTrigger;
  delay: number; // hours after trigger event

  // Reminder settings
  sendReminders: boolean;
  reminderSchedule?: number[]; // days after initial invitation
  maxReminders: number;

  // Timing constraints
  sendingHours?: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  sendingDays?: number[]; // 0 = Sunday, 6 = Saturday
  timezone?: string;
}

export enum CampaignTrigger {
  MANUAL = "manual",
  ORDER_DELIVERED = "order_delivered",
  DAYS_AFTER_PURCHASE = "days_after_purchase",
  PRODUCT_USED = "product_used",
  SUBSCRIPTION_RENEWED = "subscription_renewed",
}

export interface CampaignPerformance {
  // Invitation metrics
  invitationsSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;

  // Response metrics
  responseRate: number;
  reviewsCollected: number;
  averageRating: number;

  // Quality metrics
  verifiedReviewRate: number;
  mediaAttachmentRate: number;

  // Engagement metrics
  averageReviewLength: number;
  helpfulnessRate: number;

  // Time metrics
  averageResponseTime: number; // hours

  // Cost metrics (if applicable)
  costPerInvitation?: number;
  costPerReview?: number;

  // A/B testing results
  variantPerformance?: Record<string, VariantPerformance>;
}

export interface VariantPerformance {
  variant: string;
  sent: number;
  responseRate: number;
  averageRating: number;
  confidence: number; // statistical significance
}

export interface CampaignSettings {
  // Frequency capping
  maxInvitationsPerCustomer: number;
  cooldownPeriod: number; // days between campaigns

  // Quality filters
  requireVerifiedPurchase: boolean;
  minOrderValue?: number;
  excludeReturns: boolean;

  // Opt-out management
  respectUnsubscribes: boolean;
  allowGlobalOptOut: boolean;

  // Legal compliance
  includeDisclosures: boolean;
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
}

// =============================================================================
// REVIEW AGGREGATION & DISPLAY
// =============================================================================

export interface ReviewSummary {
  // Overall statistics
  totalReviews: number;
  averageRating: number;
  recommendationRate: number;

  // Rating breakdown
  ratingDistribution: RatingDistribution;

  // Recent trends
  recentRatingTrend: "improving" | "declining" | "stable";

  // Review highlights
  highlights: ReviewHighlight[];

  // Common themes
  positiveThemes: string[];
  negativeThemes: string[];

  // Verification status
  verifiedReviewPercentage: number;

  // Media summary
  reviewsWithMedia: number;

  // Last updated
  lastUpdated: string;
}

export interface ReviewHighlight {
  type: "positive" | "negative" | "neutral";
  theme: string;
  excerpt: string;
  reviewId: string;
  rating: number;
  isVerified: boolean;
}

export interface ReviewFilters {
  // Rating filters
  minRating?: number;
  maxRating?: number;

  // Verification filters
  verifiedOnly?: boolean;

  // Media filters
  withMedia?: boolean;
  withImages?: boolean;
  withVideos?: boolean;

  // Author filters
  authorType?: CommentAuthorType[];

  // Content filters
  minLength?: number;
  language?: string;

  // Date filters
  dateRange?: {
    start: string;
    end: string;
  };

  // Sorting
  sortBy: ReviewSortBy;
  sortOrder: "asc" | "desc";
}

export enum ReviewSortBy {
  DATE = "date",
  RATING = "rating",
  HELPFULNESS = "helpfulness",
  RELEVANCE = "relevance",
  VERIFIED_FIRST = "verified_first",
}

// Review widgets and display
export interface ReviewWidget {
  id: string;
  productId: string;
  type: ReviewWidgetType;

  // Configuration
  config: ReviewWidgetConfig;

  // Display options
  display: ReviewWidgetDisplay;

  // Performance tracking
  performance: WidgetPerformance;
}

export enum ReviewWidgetType {
  SUMMARY = "summary",
  LIST = "list",
  CAROUSEL = "carousel",
  MODAL = "modal",
  EMBEDDED = "embedded",
  FLOATING = "floating",
}

export interface ReviewWidgetConfig {
  // Content settings
  maxReviews: number;
  showRatingDistribution: boolean;
  showVerifiedBadge: boolean;
  showReviewDates: boolean;
  showReviewerName: boolean;

  // Filtering
  defaultFilters?: ReviewFilters;
  allowFiltering: boolean;

  // Media
  showImages: boolean;
  showVideos: boolean;

  // Interaction
  allowVoting: boolean;
  allowSharing: boolean;
  allowReporting: boolean;
}

export interface ReviewWidgetDisplay {
  // Layout
  layout: "grid" | "list" | "compact";
  theme: "light" | "dark" | "auto";

  // Styling
  accentColor?: string;
  borderRadius?: number;

  // Responsive settings
  mobileLayout?: "grid" | "list" | "compact";
  breakpoints?: Record<string, number>;

  // Animation
  animations: boolean;
  loadingState?: string;
}

export interface WidgetPerformance {
  // Visibility metrics
  impressions: number;
  uniqueViews: number;

  // Engagement metrics
  clicks: number;
  clickThroughRate: number;

  // Conversion impact
  conversionLift?: number;
  purchaseInfluence?: number;

  // Last updated
  lastUpdated: string;
}
