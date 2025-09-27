/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// ADMIN DASHBOARD & ANALYTICS TYPES
// =============================================================================

import { DatabaseEntity } from "./index";

// =============================================================================
// ADMIN DASHBOARD TYPES
// =============================================================================

export interface AdminDashboard {
  // Dashboard configuration
  id: string;
  name: string;
  description?: string;

  // Layout & widgets
  layout: DashboardLayout;
  widgets: DashboardWidget[];

  // Access control
  permissions: DashboardPermissions;

  // Customization
  customization: DashboardCustomization;

  // Sharing
  isShared: boolean;
  sharedWith: string[];

  // Metadata
  createdBy: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
  createdAt: string;
}

export interface DashboardLayout {
  type: LayoutType;
  columns: number;
  rows: number;

  // Responsive breakpoints
  breakpoints: Record<string, LayoutBreakpoint>;

  // Grid configuration
  gridGap: number;
  padding: number;
}

export enum LayoutType {
  GRID = "grid",
  FLEXBOX = "flexbox",
  MASONRY = "masonry",
  TABS = "tabs",
  ACCORDION = "accordion",
}

export interface LayoutBreakpoint {
  columns: number;
  width: number;
  hideWidgets?: string[];
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;

  // Position & size
  position: WidgetPosition;
  size: WidgetSize;

  // Configuration
  config: WidgetConfig;

  // Data source
  dataSource: DataSource;

  // Refresh settings
  refreshInterval?: number; // seconds
  autoRefresh: boolean;

  // Visibility
  isVisible: boolean;
  conditionalVisibility?: ConditionalVisibility;

  // Permissions
  requiredPermissions: string[];
}

export interface WidgetPosition {
  x: number;
  y: number;

  // Responsive positions
  responsive?: Record<string, { x: number; y: number }>;
}

export interface WidgetSize {
  width: number;
  height: number;

  // Size constraints
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  // Responsive sizes
  responsive?: Record<string, WidgetSize>;
}

export enum WidgetType {
  // Metrics widgets
  KPI_CARD = "kpi_card",
  METRIC_CHART = "metric_chart",
  PROGRESS_BAR = "progress_bar",
  GAUGE = "gauge",

  // Data visualization
  LINE_CHART = "line_chart",
  BAR_CHART = "bar_chart",
  PIE_CHART = "pie_chart",
  AREA_CHART = "area_chart",
  HEATMAP = "heatmap",
  FUNNEL = "funnel",

  // Tables & lists
  DATA_TABLE = "data_table",
  TOP_LIST = "top_list",
  RECENT_ACTIVITY = "recent_activity",

  // Status & monitoring
  STATUS_MONITOR = "status_monitor",
  ALERT_LIST = "alert_list",
  SYSTEM_HEALTH = "system_health",

  // Custom widgets
  IFRAME = "iframe",
  HTML = "html",
  IMAGE = "image",
  TEXT = "text",

  // Ecommerce specific
  SALES_FUNNEL = "sales_funnel",
  PRODUCT_PERFORMANCE = "product_performance",
  CUSTOMER_JOURNEY = "customer_journey",
  INVENTORY_STATUS = "inventory_status",
}

export interface WidgetConfig {
  // Chart configuration
  chartType?: ChartType;
  colors?: string[];

  // Time period
  timeRange: TimeRange;

  // Filters
  filters: Record<string, any>;

  // Display options
  showLegend: boolean;
  showTooltips: boolean;
  showGrid: boolean;

  // Formatting
  numberFormat?: NumberFormat;
  dateFormat?: string;

  // Thresholds & alerts
  thresholds?: Threshold[];

  // Custom configuration
  customConfig?: Record<string, any>;
}

export enum ChartType {
  LINE = "line",
  AREA = "area",
  BAR = "bar",
  COLUMN = "column",
  PIE = "pie",
  DOUGHNUT = "doughnut",
  SCATTER = "scatter",
  BUBBLE = "bubble",
  HEATMAP = "heatmap",
  TREEMAP = "treemap",
}

export interface TimeRange {
  type: TimeRangeType;
  custom?: {
    start: string;
    end: string;
  };

  // Comparison
  compareWith?: TimeRange;

  // Timezone
  timezone: string;
}

export enum TimeRangeType {
  LAST_HOUR = "last_hour",
  LAST_24_HOURS = "last_24_hours",
  LAST_7_DAYS = "last_7_days",
  LAST_30_DAYS = "last_30_days",
  LAST_90_DAYS = "last_90_days",
  LAST_YEAR = "last_year",
  THIS_WEEK = "this_week",
  THIS_MONTH = "this_month",
  THIS_QUARTER = "this_quarter",
  THIS_YEAR = "this_year",
  CUSTOM = "custom",
  REAL_TIME = "real_time",
}

export interface NumberFormat {
  style: "decimal" | "currency" | "percent";
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

export interface Threshold {
  value: number;
  color: string;
  label: string;
  operator: "gt" | "lt" | "gte" | "lte" | "eq";
}

export interface DataSource {
  type: DataSourceType;
  endpoint?: string;
  query?: string;

  // Data transformation
  transformation?: DataTransformation[];

  // Caching
  cacheDuration?: number; // seconds

  // Parameters
  parameters?: Record<string, any>;
}

export enum DataSourceType {
  API = "api",
  DATABASE = "database",
  ELASTICSEARCH = "elasticsearch",
  GRAPHQL = "graphql",
  STATIC = "static",
  CALCULATED = "calculated",
}

export interface DataTransformation {
  type: TransformationType;
  config: Record<string, any>;
}

export enum TransformationType {
  AGGREGATE = "aggregate",
  FILTER = "filter",
  SORT = "sort",
  GROUP = "group",
  JOIN = "join",
  PIVOT = "pivot",
  CALCULATE = "calculate",
}

export interface ConditionalVisibility {
  conditions: VisibilityCondition[];
  operator: "and" | "or";
}

export interface VisibilityCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
  value: any;
}

export interface DashboardPermissions {
  // View permissions
  canView: string[]; // role names or user IDs

  // Edit permissions
  canEdit: string[];

  // Share permissions
  canShare: string[];

  // Widget-specific permissions
  widgetPermissions?: Record<string, string[]>;
}

export interface DashboardCustomization {
  // Theme
  theme: DashboardTheme;

  // Branding
  logo?: string;
  companyName?: string;

  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // Typography
  fontFamily?: string;
  fontSize?: number;

  // Layout options
  showHeader: boolean;
  showSidebar: boolean;
  sidebarCollapsed: boolean;

  // Export options
  allowExport: boolean;
  exportFormats: ExportFormat[];
}

export enum DashboardTheme {
  LIGHT = "light",
  DARK = "dark",
  AUTO = "auto",
  CUSTOM = "custom",
}

export enum ExportFormat {
  PDF = "pdf",
  PNG = "png",
  CSV = "csv",
  EXCEL = "excel",
  JSON = "json",
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;

  // Report configuration
  type: ReportType;
  category: ReportCategory;

  // Data configuration
  metrics: AnalyticsMetric[];
  dimensions: AnalyticsDimension[];
  filters: AnalyticsFilter[];

  // Time configuration
  timeRange: TimeRange;
  granularity: TimeGranularity;

  // Output configuration
  format: ReportFormat;

  // Scheduling
  schedule?: ReportSchedule;

  // Recipients
  recipients: ReportRecipient[];

  // Status
  status: ReportStatus;

  // Execution history
  executions: ReportExecution[];

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export enum ReportType {
  STANDARD = "standard",
  CUSTOM = "custom",
  SCHEDULED = "scheduled",
  REAL_TIME = "real_time",
  ADHOC = "adhoc",
}

export enum ReportCategory {
  SALES = "sales",
  PRODUCTS = "products",
  CUSTOMERS = "customers",
  MARKETING = "marketing",
  INVENTORY = "inventory",
  FINANCIAL = "financial",
  OPERATIONS = "operations",
  SECURITY = "security",
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  type: MetricType;

  // Calculation
  calculation: MetricCalculation;

  // Formatting
  format: MetricFormat;

  // Target values
  target?: number;
  benchmark?: number;

  // Alerts
  alerts?: MetricAlert[];
}

export enum MetricType {
  COUNT = "count",
  SUM = "sum",
  AVERAGE = "average",
  PERCENTAGE = "percentage",
  RATIO = "ratio",
  RATE = "rate",
  CURRENCY = "currency",
  DURATION = "duration",
}

export interface MetricCalculation {
  formula: string;
  aggregation: AggregationType;
  groupBy?: string[];

  // Advanced calculations
  rollingWindow?: number;
  compareToTime?: string;

  // Custom SQL or expression
  customExpression?: string;
}

export enum AggregationType {
  SUM = "sum",
  COUNT = "count",
  AVERAGE = "avg",
  MIN = "min",
  MAX = "max",
  MEDIAN = "median",
  DISTINCT_COUNT = "distinct_count",
  PERCENTILE = "percentile",
}

export interface MetricFormat {
  type: MetricFormatType;
  decimals: number;
  prefix?: string;
  suffix?: string;
  unit?: string;

  // Conditional formatting
  conditionalFormatting?: ConditionalFormat[];
}

export enum MetricFormatType {
  NUMBER = "number",
  CURRENCY = "currency",
  PERCENTAGE = "percentage",
  DURATION = "duration",
  BYTES = "bytes",
}

export interface ConditionalFormat {
  condition: FormatCondition;
  style: FormatStyle;
}

export interface FormatCondition {
  operator: "gt" | "lt" | "gte" | "lte" | "eq" | "between";
  value: number | [number, number];
}

export interface FormatStyle {
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
  icon?: string;
}

export interface MetricAlert {
  condition: AlertCondition;
  recipients: string[];
  message: string;

  // Alert settings
  enabled: boolean;
  frequency: AlertFrequency;

  // Escalation
  escalation?: AlertEscalation;
}

export interface AlertCondition {
  threshold: number;
  operator: "above" | "below" | "equals";
  duration?: number; // minutes - how long condition must persist
}

export enum AlertFrequency {
  IMMEDIATE = "immediate",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
}

export interface AlertEscalation {
  levels: EscalationLevel[];
  enabled: boolean;
}

export interface EscalationLevel {
  level: number;
  delayMinutes: number;
  recipients: string[];
  actions?: EscalationAction[];
}

export interface EscalationAction {
  type: "email" | "sms" | "webhook" | "ticket";
  config: Record<string, any>;
}

export interface AnalyticsDimension {
  id: string;
  name: string;
  field: string;

  // Grouping
  grouping: DimensionGrouping;

  // Hierarchy
  hierarchy?: DimensionHierarchy;

  // Filtering
  filterable: boolean;
  defaultFilters?: any[];
}

export interface DimensionGrouping {
  type: GroupingType;
  interval?: string; // for time-based grouping

  // Custom grouping
  customGroups?: CustomGroup[];
}

export enum GroupingType {
  NONE = "none",
  TIME = "time",
  CATEGORY = "category",
  RANGE = "range",
  CUSTOM = "custom",
}

export interface CustomGroup {
  name: string;
  conditions: GroupCondition[];
}

export interface GroupCondition {
  field: string;
  operator: string;
  value: any;
}

export interface DimensionHierarchy {
  levels: HierarchyLevel[];
  drillDownEnabled: boolean;
}

export interface HierarchyLevel {
  name: string;
  field: string;
  order: number;
}

export interface AnalyticsFilter {
  field: string;
  operator: FilterOperator;
  value: any;

  // Filter metadata
  label?: string;
  isRequired: boolean;

  // Dynamic filters
  isDynamic: boolean;
  dynamicSource?: string;
}

export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  GREATER_THAN_OR_EQUAL = "greater_than_or_equal",
  LESS_THAN_OR_EQUAL = "less_than_or_equal",
  IN = "in",
  NOT_IN = "not_in",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
  BETWEEN = "between",
}

export enum TimeGranularity {
  MINUTE = "minute",
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}

// =============================================================================
// ECOMMERCE ANALYTICS
// =============================================================================

export interface EcommerceAnalytics {
  // Sales analytics
  sales: SalesAnalytics;

  // Product analytics
  products: ProductAnalytics;

  // Customer analytics
  customers: CustomerAnalytics;

  // Marketing analytics
  marketing: MarketingAnalytics;

  // Operational analytics
  operations: OperationalAnalytics;

  // Financial analytics
  financial: FinancialAnalytics;

  // Time period
  timeRange: TimeRange;

  // Last updated
  lastUpdated: string;
}

export interface SalesAnalytics {
  // Revenue metrics
  totalRevenue: number;
  revenueGrowth: GrowthMetric;

  // Order metrics
  totalOrders: number;
  orderGrowth: GrowthMetric;
  averageOrderValue: number;
  aovGrowth: GrowthMetric;

  // Conversion metrics
  conversionRate: number;
  conversionGrowth: GrowthMetric;

  // Sales performance
  salesByChannel: ChannelPerformance[];
  salesByRegion: RegionalPerformance[];
  salesByCategory: CategoryPerformance[];

  // Trends
  revenueTrend: TrendData[];
  orderTrend: TrendData[];

  // Top performers
  topProducts: ProductPerformanceMetric[];
  topCategories: CategoryPerformanceMetric[];
  topCustomers: CustomerPerformanceMetric[];

  // Sales funnel
  salesFunnel: FunnelStage[];
}

export interface GrowthMetric {
  current: number;
  previous: number;
  growth: number; // percentage
  isPositive: boolean;
}

export interface ChannelPerformance {
  channel: SalesChannel;
  revenue: number;
  orders: number;
  conversionRate: number;
  averageOrderValue: number;
  growth: GrowthMetric;
}

export enum SalesChannel {
  WEB = "web",
  MOBILE_APP = "mobile_app",
  SOCIAL_MEDIA = "social_media",
  EMAIL = "email",
  DIRECT = "direct",
  ORGANIC_SEARCH = "organic_search",
  PAID_SEARCH = "paid_search",
  AFFILIATE = "affiliate",
  MARKETPLACE = "marketplace",
}

export interface RegionalPerformance {
  region: string;
  country?: string;
  revenue: number;
  orders: number;
  customers: number;
  growth: GrowthMetric;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orders: number;
  units: number;
  growth: GrowthMetric;
  margin: number;
}

export interface TrendData {
  date: string;
  value: number;

  // Additional context
  label?: string;
  events?: TrendEvent[];
}

export interface TrendEvent {
  type: EventType;
  description: string;
  impact?: number;
}

export enum EventType {
  PROMOTION = "promotion",
  HOLIDAY = "holiday",
  CAMPAIGN = "campaign",
  PRODUCT_LAUNCH = "product_launch",
  PRICE_CHANGE = "price_change",
  STOCK_OUT = "stock_out",
  EXTERNAL_EVENT = "external_event",
}

export interface ProductPerformanceMetric {
  productId: string;
  productName: string;
  revenue: number;
  units: number;
  conversionRate: number;
  rank: number;
  growth: GrowthMetric;
}

export interface CategoryPerformanceMetric {
  categoryId: string;
  categoryName: string;
  revenue: number;
  products: number;
  averageRating: number;
  rank: number;
  growth: GrowthMetric;
}

export interface CustomerPerformanceMetric {
  customerId: string;
  customerName: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: string;
  rank: number;
}

export interface FunnelStage {
  stage: FunnelStageType;
  name: string;
  count: number;
  percentage: number;
  conversionRate?: number; // to next stage
}

export enum FunnelStageType {
  AWARENESS = "awareness",
  INTEREST = "interest",
  CONSIDERATION = "consideration",
  INTENT = "intent",
  PURCHASE = "purchase",
  RETENTION = "retention",
  ADVOCACY = "advocacy",
}

// Product Analytics
export interface ProductAnalytics {
  // Catalog metrics
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;

  // Performance metrics
  topSellingProducts: ProductPerformanceMetric[];
  worstPerformingProducts: ProductPerformanceMetric[];

  // Inventory insights
  inventoryTurnover: number;
  averageDaysInStock: number;
  stockoutRate: number;

  // Pricing insights
  averagePrice: number;
  priceRange: { min: number; max: number };
  discountedProducts: number;

  // Review insights
  averageRating: number;
  reviewedProducts: number;
  reviewRate: number;

  // Category insights
  categoryPerformance: CategoryPerformance[];

  // Trends
  catalogGrowth: GrowthMetric;
  newProductsAdded: number;
  discontinuedProducts: number;
}

// Customer Analytics
export interface CustomerAnalytics {
  // Customer base metrics
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  customerGrowth: GrowthMetric;

  // Customer value metrics
  averageCustomerValue: number;
  customerLifetimeValue: number;
  topCustomers: CustomerPerformanceMetric[];

  // Segmentation
  customerSegments: CustomerSegmentMetrics[];

  // Behavior metrics
  repeatPurchaseRate: number;
  customerRetentionRate: number;
  churnRate: number;

  // Engagement metrics
  averageSessionDuration: number;
  averagePageViews: number;
  engagementScore: number;

  // Geographic distribution
  customersByCountry: Record<string, number>;

  // Acquisition channels
  acquisitionChannels: AcquisitionChannelMetrics[];

  // Customer journey
  journeyAnalytics: CustomerJourneyAnalytics;
}

export interface CustomerSegmentMetrics {
  segmentId: string;
  segmentName: string;
  customerCount: number;
  percentage: number;
  averageValue: number;
  growth: GrowthMetric;
}

export interface AcquisitionChannelMetrics {
  channel: string;
  newCustomers: number;
  cost: number;
  costPerAcquisition: number;
  lifetime_value: number;
  roi: number;
}

export interface CustomerJourneyAnalytics {
  // Journey stages
  stages: JourneyStage[];

  // Conversion rates between stages
  conversionRates: Record<string, number>;

  // Average time in each stage
  stageTime: Record<string, number>;

  // Drop-off points
  dropOffPoints: DropOffPoint[];

  // Journey paths
  topJourneyPaths: JourneyPath[];
}

export interface JourneyStage {
  stage: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  averageTimeSpent: number;
}

export interface DropOffPoint {
  fromStage: string;
  toStage: string;
  dropOffRate: number;
  dropOffCount: number;
  reasons?: DropOffReason[];
}

export interface DropOffReason {
  reason: string;
  percentage: number;
  count: number;
}

export interface JourneyPath {
  path: string[];
  count: number;
  conversionRate: number;
  averageTime: number;
  revenue: number;
}

// Marketing Analytics
export interface MarketingAnalytics {
  // Campaign performance
  campaigns: CampaignAnalytics[];

  // Email marketing
  emailMetrics: EmailMarketingMetrics;

  // Social media
  socialMediaMetrics: SocialMediaMetrics;

  // SEO metrics
  seoMetrics: SEOMetrics;

  // Advertising
  advertisingMetrics: AdvertisingMetrics;

  // Attribution
  attribution: AttributionAnalytics;

  // ROI metrics
  overallROI: number;
  channelROI: Record<string, number>;
}

export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  type: string;

  // Performance metrics
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  conversions: number;
  conversionRate: number;

  // Financial metrics
  spend: number;
  revenue: number;
  roi: number;
  costPerClick: number;
  costPerConversion: number;

  // Engagement
  engagementRate: number;

  // Status
  status: string;
  startDate: string;
  endDate?: string;
}

export interface EmailMarketingMetrics {
  // Send metrics
  emailsSent: number;
  deliveryRate: number;
  bounceRate: number;

  // Engagement metrics
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;

  // Conversion metrics
  conversionRate: number;
  revenue: number;

  // List health
  listGrowthRate: number;
  listChurnRate: number;

  // Segmentation performance
  segmentPerformance: Record<string, EmailSegmentMetrics>;
}

export interface EmailSegmentMetrics {
  segment: string;
  size: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
}

export interface SocialMediaMetrics {
  // Platform metrics
  platforms: SocialPlatformMetrics[];

  // Overall engagement
  totalFollowers: number;
  engagementRate: number;
  shareRate: number;

  // Traffic & conversions
  socialTraffic: number;
  socialConversions: number;
  socialRevenue: number;
}

export interface SocialPlatformMetrics {
  platform: string;
  followers: number;
  posts: number;
  engagement: number;
  reach: number;
  traffic: number;
  conversions: number;
}

export interface SEOMetrics {
  // Organic search
  organicTraffic: number;
  organicConversions: number;
  organicRevenue: number;

  // Rankings
  averagePosition: number;
  topKeywords: KeywordMetrics[];

  // Technical SEO
  crawlErrors: number;
  pageLoadSpeed: number;
  mobileUsability: number;

  // Content performance
  topPages: PageMetrics[];
}

export interface KeywordMetrics {
  keyword: string;
  position: number;
  impressions: number;
  clicks: number;
  ctr: number;

  // Trends
  positionChange: number;
  clickChange: number;
}

export interface PageMetrics {
  url: string;
  pageviews: number;
  uniquePageviews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  conversions: number;
}

export interface AdvertisingMetrics {
  // Overall metrics
  totalSpend: number;
  totalRevenue: number;
  overallROAS: number;

  // Platform performance
  platforms: AdPlatformMetrics[];

  // Ad performance
  topAds: AdPerformanceMetrics[];

  // Audience insights
  audienceMetrics: AudienceMetrics;
}

export interface AdPlatformMetrics {
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
}

export interface AdPerformanceMetrics {
  adId: string;
  adName: string;
  spend: number;
  impressions: number;
  ctr: number;
  conversions: number;
  roas: number;
}

export interface AudienceMetrics {
  // Demographics
  ageGroups: Record<string, number>;
  genderDistribution: Record<string, number>;
  incomeRanges: Record<string, number>;

  // Geographic
  topCountries: Record<string, number>;
  topCities: Record<string, number>;

  // Interests
  topInterests: string[];
  topBehaviors: string[];
}

export interface AttributionAnalytics {
  // Attribution models
  firstTouch: AttributionData;
  lastTouch: AttributionData;
  linear: AttributionData;
  timeDecay: AttributionData;
  positionBased: AttributionData;

  // Cross-channel analysis
  channelInteractions: ChannelInteraction[];

  // Customer journey attribution
  journeyAttribution: JourneyAttribution[];
}

export interface AttributionData {
  model: string;
  channels: ChannelAttribution[];
  totalRevenue: number;
  totalConversions: number;
}

export interface ChannelAttribution {
  channel: string;
  attribution: number; // percentage
  revenue: number;
  conversions: number;
}

export interface ChannelInteraction {
  fromChannel: string;
  toChannel: string;
  interactions: number;
  conversionRate: number;
  averageTimeBetween: number; // hours
}

export interface JourneyAttribution {
  journeyPath: string[];
  occurrences: number;
  conversions: number;
  revenue: number;
  attribution: ChannelAttribution[];
}

// Operational Analytics
export interface OperationalAnalytics {
  // Inventory metrics
  inventory: InventoryAnalytics;

  // Fulfillment metrics
  fulfillment: FulfillmentAnalytics;

  // Support metrics
  support: SupportAnalytics;

  // System performance
  system: SystemPerformanceAnalytics;

  // Quality metrics
  quality: QualityAnalytics;
}

export interface InventoryAnalytics {
  // Stock levels
  totalSKUs: number;
  inStockSKUs: number;
  lowStockSKUs: number;
  outOfStockSKUs: number;

  // Turnover metrics
  inventoryTurnover: number;
  daysInStock: number;
  stockoutFrequency: number;

  // Value metrics
  totalInventoryValue: number;
  deadStockValue: number;
  fastMovingStockValue: number;

  // Forecasting accuracy
  forecastAccuracy: number;
  demandPredictionAccuracy: number;

  // Trends
  inventoryTrends: InventoryTrendData[];
}

export interface InventoryTrendData {
  date: string;
  stockLevel: number;
  value: number;
  turnover: number;
}

export interface FulfillmentAnalytics {
  // Order processing
  averageProcessingTime: number;
  processingTimeByType: Record<string, number>;

  // Shipping metrics
  averageShippingTime: number;
  onTimeDeliveryRate: number;
  shippingCosts: ShippingCostAnalytics;

  // Quality metrics
  accuracyRate: number;
  damageRate: number;
  returnRate: number;

  // Carrier performance
  carrierPerformance: CarrierPerformanceMetrics[];

  // Geographic performance
  fulfillmentByRegion: FulfillmentRegionMetrics[];
}

export interface ShippingCostAnalytics {
  totalCosts: number;
  averageCostPerShipment: number;
  costsByMethod: Record<string, number>;
  costsByRegion: Record<string, number>;

  // Cost trends
  costTrends: TrendData[];

  // Cost savings opportunities
  savings: CostSavingsOpportunity[];
}

export interface CostSavingsOpportunity {
  type: string;
  description: string;
  potentialSavings: number;
  implementation: string;
}

export interface CarrierPerformanceMetrics {
  carrierId: string;
  carrierName: string;

  // Performance metrics
  onTimeRate: number;
  damageRate: number;
  lostPackageRate: number;

  // Cost metrics
  averageCost: number;
  volumeDiscount: number;

  // Customer satisfaction
  customerRating: number;

  // Volume
  packageCount: number;
  revenue: number;
}

export interface FulfillmentRegionMetrics {
  region: string;

  // Performance
  averageDeliveryTime: number;
  onTimeRate: number;

  // Volume
  orders: number;

  // Costs
  averageCost: number;

  // Quality
  accuracyRate: number;
  customerSatisfaction: number;
}

export interface SupportAnalytics {
  // Ticket metrics
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;

  // Response metrics
  averageResponseTime: number;
  averageResolutionTime: number;
  firstContactResolutionRate: number;

  // Quality metrics
  customerSatisfactionScore: number;
  netPromoterScore: number;

  // Channel performance
  channelMetrics: SupportChannelMetrics[];

  // Agent performance
  agentMetrics: AgentPerformanceMetrics[];

  // Issue analysis
  topIssues: IssueAnalytics[];

  // Trends
  ticketTrends: TrendData[];
  satisfactionTrends: TrendData[];
}

export interface SupportChannelMetrics {
  channel: string;
  tickets: number;
  averageResponseTime: number;
  resolutionRate: number;
  satisfactionScore: number;
}

export interface AgentPerformanceMetrics {
  agentId: string;
  agentName: string;
  ticketsHandled: number;
  averageResolutionTime: number;
  customerSatisfactionScore: number;
  productivity: number;
}

export interface IssueAnalytics {
  issueType: string;
  count: number;
  percentage: number;
  averageResolutionTime: number;
  satisfactionScore: number;
  trend: "increasing" | "decreasing" | "stable";
}

export interface SystemPerformanceAnalytics {
  // Performance metrics
  averagePageLoadTime: number;
  serverResponseTime: number;
  uptime: number;

  // Error metrics
  errorRate: number;
  topErrors: ErrorMetrics[];

  // Traffic metrics
  totalPageViews: number;
  uniqueVisitors: number;
  bounceRate: number;

  // Infrastructure metrics
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;

  // API performance
  apiMetrics: APIPerformanceMetrics[];
}

export interface ErrorMetrics {
  errorCode: string;
  errorMessage: string;
  count: number;
  percentage: number;
  impact: ErrorImpact;
}

export enum ErrorImpact {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface APIPerformanceMetrics {
  endpoint: string;
  requests: number;
  averageResponseTime: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

export interface QualityAnalytics {
  // Product quality
  productQualityScore: number;
  defectRate: number;
  returnRate: number;

  // Service quality
  serviceQualityScore: number;
  complaintRate: number;

  // Process quality
  processEfficiency: number;
  automationRate: number;

  // Quality trends
  qualityTrends: QualityTrendData[];

  // Improvement opportunities
  improvements: QualityImprovement[];
}

export interface QualityTrendData {
  date: string;
  qualityScore: number;
  defectRate: number;
  customerSatisfaction: number;
}

export interface QualityImprovement {
  area: string;
  currentScore: number;
  targetScore: number;
  impact: string;
  effort: string;
  priority: number;
}

// Financial Analytics
export interface FinancialAnalytics {
  // Revenue metrics
  revenue: RevenueAnalytics;

  // Cost metrics
  costs: CostAnalytics;

  // Profitability
  profitability: ProfitabilityAnalytics;

  // Cash flow
  cashFlow: CashFlowAnalytics;

  // Financial health
  financialHealth: FinancialHealthMetrics;

  // Forecasting
  forecasting: FinancialForecast;
}

export interface RevenueAnalytics {
  // Total metrics
  totalRevenue: number;
  revenueGrowth: GrowthMetric;

  // Revenue breakdown
  revenueByProduct: Record<string, number>;
  revenueByCategory: Record<string, number>;
  revenueByChannel: Record<string, number>;
  revenueByRegion: Record<string, number>;

  // Revenue types
  newCustomerRevenue: number;
  returningCustomerRevenue: number;
  subscriptionRevenue: number;
  oneTimeRevenue: number;

  // Trends
  revenueTrends: TrendData[];

  // Seasonality
  seasonalPatterns: SeasonalRevenuePattern[];
}

export interface SeasonalRevenuePattern {
  season: string;
  averageRevenue: number;
  growth: number;
  contribution: number; // percentage of annual revenue
}

export interface CostAnalytics {
  // Total costs
  totalCosts: number;
  costGrowth: GrowthMetric;

  // Cost breakdown
  costByCategory: CostCategoryMetrics[];

  // Cost trends
  costTrends: TrendData[];

  // Cost optimization
  optimization: CostOptimizationOpportunity[];
}

export interface CostCategoryMetrics {
  category: CostCategory;
  amount: number;
  percentage: number;
  trend: GrowthMetric;

  // Subcategories
  subcategories?: Record<string, number>;
}

export enum CostCategory {
  COST_OF_GOODS_SOLD = "cogs",
  MARKETING = "marketing",
  OPERATIONS = "operations",
  TECHNOLOGY = "technology",
  PERSONNEL = "personnel",
  FACILITIES = "facilities",
  SHIPPING = "shipping",
  RETURNS = "returns",
  CUSTOMER_SUPPORT = "customer_support",
  PAYMENT_PROCESSING = "payment_processing",
}

export interface CostOptimizationOpportunity {
  area: string;
  currentCost: number;
  potentialSavings: number;
  implementation: string;
  timeframe: string;
  priority: number;
}

export interface ProfitabilityAnalytics {
  // Margin metrics
  grossMargin: number;
  netMargin: number;
  contributionMargin: number;

  // Profit breakdown
  profitByProduct: Record<string, ProfitMetrics>;
  profitByCategory: Record<string, ProfitMetrics>;
  profitByChannel: Record<string, ProfitMetrics>;

  // Unit economics
  unitEconomics: UnitEconomics;

  // Trends
  profitabilityTrends: TrendData[];
}

export interface ProfitMetrics {
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  units?: number;
}

export interface UnitEconomics {
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  paybackPeriod: number; // months

  // Cohort analysis
  cohortLTV: CohortLTVAnalysis[];
}

export interface CohortLTVAnalysis {
  cohort: string; // e.g., "2023-Q1"
  customerCount: number;
  ltv: number;
  paybackPeriod: number;
  retentionRate: number;
}

export interface CashFlowAnalytics {
  // Current cash flow
  operatingCashFlow: number;
  freeCashFlow: number;

  // Projections
  cashFlowProjection: CashFlowProjection[];

  // Working capital
  workingCapital: number;
  workingCapitalDays: number;

  // Receivables & payables
  accountsReceivable: number;
  averageCollectionDays: number;
  accountsPayable: number;
  averagePaymentDays: number;
}

export interface CashFlowProjection {
  period: string;
  projectedInflow: number;
  projectedOutflow: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  confidence: number; // percentage
}

export interface FinancialHealthMetrics {
  // Liquidity ratios
  currentRatio: number;
  quickRatio: number;

  // Profitability ratios
  grossMarginRatio: number;
  netMarginRatio: number;

  // Efficiency ratios
  inventoryTurnoverRatio: number;
  receivablesTurnoverRatio: number;

  // Growth metrics
  revenueGrowthRate: number;
  profitGrowthRate: number;

  // Health score
  overallHealthScore: number; // 0-100
  healthFactors: HealthFactorMetrics[];
}

export interface HealthFactorMetrics {
  factor: string;
  score: number;
  weight: number;
  trend: "improving" | "declining" | "stable";
}

export interface FinancialForecast {
  // Revenue forecast
  revenueForecast: ForecastData[];

  // Cost forecast
  costForecast: ForecastData[];

  // Profit forecast
  profitForecast: ForecastData[];

  // Scenario analysis
  scenarios: ScenarioAnalysis[];

  // Model performance
  forecastAccuracy: number;
  lastUpdated: string;
}

export interface ForecastData {
  period: string;
  value: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

export interface ScenarioAnalysis {
  name: string;
  description: string;
  assumptions: ScenarioAssumption[];
  forecast: ForecastData[];
  probability: number;
}

export interface ScenarioAssumption {
  parameter: string;
  value: number;
  unit: string;
  impact: string;
}

// =============================================================================
// REPORT GENERATION & SCHEDULING
// =============================================================================

export interface ReportFormat {
  type: ReportFormatType;

  // Layout options
  orientation?: "portrait" | "landscape";
  pageSize?: "A4" | "letter" | "legal";

  // Content options
  includeCharts: boolean;
  includeTables: boolean;
  includeSummary: boolean;

  // Styling
  template?: string;
  customCSS?: string;
}

export enum ReportFormatType {
  PDF = "pdf",
  EXCEL = "excel",
  CSV = "csv",
  JSON = "json",
  HTML = "html",
  PNG = "png",
}

export interface ReportSchedule {
  // Frequency
  frequency: ScheduleFrequency;
  interval: number;

  // Timing
  time: string; // "14:00"
  timezone: string;

  // Days (for weekly/monthly)
  daysOfWeek?: number[];
  dayOfMonth?: number;

  // Next execution
  nextExecution: string;

  // Status
  enabled: boolean;
  lastExecution?: string;

  // Retry settings
  retryOnFailure: boolean;
  maxRetries: number;
}

export enum ScheduleFrequency {
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUALLY = "annually",
}

export interface ReportRecipient {
  type: RecipientType;
  address: string;
  name?: string;

  // Delivery options
  deliveryMethod: DeliveryMethod;

  // Customization
  customMessage?: string;
  includeAttachment: boolean;

  // Status
  enabled: boolean;
  lastDelivered?: string;
}

export enum RecipientType {
  EMAIL = "email",
  SLACK = "slack",
  TEAMS = "teams",
  WEBHOOK = "webhook",
  FTP = "ftp",
  S3 = "s3",
}

export enum DeliveryMethod {
  ATTACHMENT = "attachment",
  LINK = "link",
  EMBEDDED = "embedded",
  WEBHOOK = "webhook",
}

export enum ReportStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  FAILED = "failed",
  ARCHIVED = "archived",
}

export interface ReportExecution {
  id: string;
  startedAt: string;
  completedAt?: string;

  // Status
  status: ExecutionStatus;

  // Results
  resultUrl?: string;
  resultSize?: number;

  // Performance
  executionTime: number; // milliseconds

  // Errors
  error?: ExecutionError;

  // Delivery status
  deliveryStatus: DeliveryStatus[];
}

export enum ExecutionStatus {
  QUEUED = "queued",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  TIMEOUT = "timeout",
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface DeliveryStatus {
  recipientAddress: string;
  status: "sent" | "delivered" | "failed" | "bounced";
  timestamp: string;
  error?: string;
}

// =============================================================================
// ADMIN USER MANAGEMENT
// =============================================================================

export interface AdminUser extends DatabaseEntity {
  // Basic info
  username: string;
  email: string;
  firstName: string;
  lastName: string;

  // Role & permissions
  roles: AdminRole[];
  permissions: Permission[];

  // Status
  status: AdminStatus;

  // Settings
  settings: AdminUserSettings;

  // Activity
  lastLogin?: string;
  loginCount: number;

  // Security
  securityProfile: AdminSecurityProfile;

  // Audit trail
  auditLog: AdminAuditEntry[];
}

export interface AdminRole {
  id: string;
  name: string;
  description?: string;

  // Permissions
  permissions: Permission[];

  // Hierarchy
  level: number;
  parentRoleId?: string;

  // Status
  isActive: boolean;

  // System role flag
  isSystemRole: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: PermissionAction;

  // Conditions
  conditions?: PermissionCondition[];

  // Scope
  scope: PermissionScope;

  // Description
  description?: string;
}

export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  EXPORT = "export",
  IMPORT = "import",
  PUBLISH = "publish",
  APPROVE = "approve",
  MODERATE = "moderate",
}

export interface PermissionCondition {
  field: string;
  operator: string;
  value: any;
}

export enum PermissionScope {
  GLOBAL = "global",
  ORGANIZATION = "organization",
  DEPARTMENT = "department",
  TEAM = "team",
  OWN = "own",
}

export enum AdminStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
  DEACTIVATED = "deactivated",
}

export interface AdminUserSettings {
  // Dashboard preferences
  defaultDashboard?: string;
  dashboardTheme: DashboardTheme;

  // Notification preferences
  emailNotifications: AdminNotificationSettings;

  // Display preferences
  timezone: string;
  dateFormat: string;
  numberFormat: NumberFormat;

  // Workspace
  workspaceLayout: "default" | "compact" | "expanded";
  sidebarCollapsed: boolean;

  // Quick actions
  favoriteActions: string[];
  recentlyUsed: RecentlyUsedItem[];
}

export interface AdminNotificationSettings {
  // System alerts
  systemAlerts: boolean;

  // Security alerts
  securityAlerts: boolean;

  // Business alerts
  salesAlerts: boolean;
  inventoryAlerts: boolean;
  customerServiceAlerts: boolean;

  // Report delivery
  reportDelivery: boolean;

  // Frequency
  digestFrequency: NotificationFrequency;
}

export enum NotificationFrequency {
  IMMEDIATE = "immediate",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  NEVER = "never",
}

export interface RecentlyUsedItem {
  type: string;
  id: string;
  name: string;
  url: string;
  timestamp: string;
}

export interface AdminSecurityProfile {
  // Login security
  lastPasswordChange: string;
  failedLoginAttempts: number;
  lastFailedLogin?: string;

  // Session management
  activeSessions: AdminSession[];
  maxSessions: number;
  sessionTimeout: number; // minutes

  // IP restrictions
  allowedIPs?: string[];

  // Device restrictions
  trustedDevices: TrustedAdminDevice[];

  // Audit requirements
  requireAuditLog: boolean;
  auditLogRetention: number; // days
}

export interface AdminSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  startedAt: string;
  lastActivity: string;
  isActive: boolean;
}

export interface SessionLocation {
  country: string;
  region?: string;
  city?: string;
}

export interface TrustedAdminDevice {
  id: string;
  name: string;
  fingerprint: string;
  addedAt: string;
  lastUsed: string;
  isActive: boolean;
}

export interface AdminAuditEntry {
  id: string;

  // Action details
  action: AuditAction;
  resource: string;
  resourceId?: string;

  // Context
  details: Record<string, any>;

  // Request info
  ipAddress: string;
  userAgent: string;

  // Changes (for update actions)
  changes?: AuditChange[];

  // Timestamp
  timestamp: string;

  // Result
  success: boolean;
  error?: string;
}

export enum AuditAction {
  LOGIN = "login",
  LOGOUT = "logout",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  VIEW = "view",
  EXPORT = "export",
  IMPORT = "import",
  APPROVE = "approve",
  REJECT = "reject",
  PUBLISH = "publish",
  UNPUBLISH = "unpublish",
  BACKUP = "backup",
  RESTORE = "restore",
  CONFIG_CHANGE = "config_change",
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}

// =============================================================================
// SYSTEM MONITORING & ALERTS
// =============================================================================

export interface SystemAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;

  // Alert details
  title: string;
  description: string;
  source: string;

  // Status
  status: AlertStatus;

  // Timing
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;

  // Assignment
  assignedTo?: string;

  // Actions taken
  actions: AlertAction[];

  // Related data
  relatedMetrics: Record<string, any>;

  // Escalation
  escalationLevel: number;
  escalatedAt?: string;
}

export enum AlertType {
  PERFORMANCE = "performance",
  ERROR = "error",
  SECURITY = "security",
  BUSINESS = "business",
  SYSTEM = "system",
  CAPACITY = "capacity",
  QUALITY = "quality",
  COMPLIANCE = "compliance",
}

export enum AlertSeverity {
  INFO = "info",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum AlertStatus {
  OPEN = "open",
  ACKNOWLEDGED = "acknowledged",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
  FALSE_POSITIVE = "false_positive",
}

export interface AlertAction {
  type: AlertActionType;
  description: string;
  performedBy: string;
  performedAt: string;
  result?: string;
}

export enum AlertActionType {
  ACKNOWLEDGE = "acknowledge",
  INVESTIGATE = "investigate",
  ESCALATE = "escalate",
  RESOLVE = "resolve",
  CLOSE = "close",
  COMMENT = "comment",
  ASSIGN = "assign",
  AUTO_RESOLVE = "auto_resolve",
}

export interface SystemHealthMetrics {
  // Overall health score
  overallHealth: number; // 0-100

  // Component health
  componentHealth: ComponentHealth[];

  // Performance metrics
  performance: SystemPerformanceMetrics;

  // Availability
  uptime: number; // percentage
  downtimeEvents: DowntimeEvent[];

  // Resource utilization
  resourceUtilization: ResourceUtilization;

  // Error rates
  errorRates: ErrorRateMetrics[];

  // Security metrics
  securityMetrics: SecurityMetrics;
}

export interface ComponentHealth {
  component: string;
  status: ComponentStatus;
  health: number; // 0-100
  responseTime?: number;
  lastCheck: string;

  // Dependencies
  dependencies?: ComponentDependency[];

  // Issues
  activeIssues: ComponentIssue[];
}

export enum ComponentStatus {
  HEALTHY = "healthy",
  WARNING = "warning",
  CRITICAL = "critical",
  DOWN = "down",
  MAINTENANCE = "maintenance",
  UNKNOWN = "unknown",
}

export interface ComponentDependency {
  componentName: string;
  status: ComponentStatus;
  isRequired: boolean;
}

export interface ComponentIssue {
  severity: AlertSeverity;
  description: string;
  detectedAt: string;
  estimatedResolution?: string;
}

export interface SystemPerformanceMetrics {
  // Response times
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;

  // Throughput
  requestsPerSecond: number;
  transactionsPerSecond: number;

  // Database performance
  databaseResponseTime: number;
  queryPerformance: QueryPerformanceMetrics[];

  // Cache performance
  cacheHitRate: number;
  cacheResponseTime: number;
}

export interface QueryPerformanceMetrics {
  queryType: string;
  averageTime: number;
  executionCount: number;
  slowQueries: number;
}

export interface DowntimeEvent {
  startTime: string;
  endTime?: string;
  duration: number; // minutes
  reason: string;
  impact: DowntimeImpact;

  // Recovery
  recoveryTime?: number; // minutes
  rootCause?: string;
}

export enum DowntimeImpact {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ResourceUtilization {
  cpu: ResourceMetrics;
  memory: ResourceMetrics;
  disk: ResourceMetrics;
  network: NetworkMetrics;
  database: DatabaseMetrics;
}

export interface ResourceMetrics {
  current: number; // percentage
  average: number;
  peak: number;
  capacity: number;

  // Trends
  trend: "increasing" | "decreasing" | "stable";

  // Predictions
  predictedPeak?: number;
  capacityAlert?: number;
}

export interface NetworkMetrics {
  // Bandwidth
  inbound: number; // Mbps
  outbound: number; // Mbps

  // Latency
  averageLatency: number; // ms

  // Errors
  errorRate: number;
  packetLoss: number;
}

export interface DatabaseMetrics {
  // Connections
  activeConnections: number;
  maxConnections: number;

  // Performance
  averageQueryTime: number;
  slowQueries: number;

  // Storage
  databaseSize: number; // GB
  indexSize: number; // GB

  // Backup status
  lastBackup: string;
  backupStatus: "success" | "failed" | "in_progress";
}

export interface ErrorRateMetrics {
  component: string;
  errorRate: number; // percentage
  errorCount: number;

  // Error breakdown
  errorTypes: Record<string, number>;

  // Recent errors
  recentErrors: RecentError[];
}

export interface RecentError {
  timestamp: string;
  type: string;
  message: string;
  count: number;
}

export interface SecurityMetrics {
  // Authentication metrics
  successfulLogins: number;
  failedLogins: number;
  suspiciousLogins: number;

  // Attack metrics
  attackAttempts: number;
  blockedIPs: number;

  // Vulnerability metrics
  vulnerabilityScore: number;
  openVulnerabilities: VulnerabilityInfo[];

  // Compliance
  complianceScore: number;
  complianceChecks: ComplianceCheck[];
}

export interface VulnerabilityInfo {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  component: string;
  discoveredAt: string;
  fixAvailable: boolean;
}

export interface ComplianceCheck {
  standard: string;
  requirement: string;
  status: "compliant" | "non_compliant" | "needs_review";
  lastChecked: string;
  nextCheck: string;
}
