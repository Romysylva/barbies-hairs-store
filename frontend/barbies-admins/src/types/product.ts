/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// ENHANCED PRODUCT TYPES
// =============================================================================

import { DatabaseEntity, ProductFilters, ProductSortBy } from "./index";

// Base Product Interface (Extended)
export interface Product extends DatabaseEntity {
  // Basic Info
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;

  // Pricing
  pricing: ProductPricing;

  // Media
  media: ProductMedia;

  // Categorization
  category: ProductCategory;
  subcategories?: ProductCategory[];
  tags: string[];
  brand?: ProductBrand;

  // Inventory & Stock
  inventory: ProductInventory;

  // Variants & Options
  variants?: ProductVariant[];
  options?: ProductOption[];

  // Ratings & Reviews
  rating: ProductRating;

  // SEO & Marketing
  seo: ProductSEO;

  // Attributes
  attributes: ProductAttribute[];

  // Status & Visibility
  status: ProductStatus;
  visibility: ProductVisibility;

  // Shipping & Dimensions
  shipping: ProductShipping;

  // Related Products
  relatedProductIds?: string[];
  crossSellProductIds?: string[];
  upSellProductIds?: string[];

  // Analytics
  analytics: ProductAnalytics;
}

// Product Pricing
export interface ProductPricing {
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  compareAtPrice?: number;
  currency: string;
  taxable: boolean;
  taxCode?: string;

  // Tiered pricing for bulk orders
  tierPricing?: PriceTier[];

  // Dynamic pricing
  dynamicPricing?: {
    enabled: boolean;
    rules: PricingRule[];
  };
}

export interface PriceTier {
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  discountPercentage?: number;
}

export interface PricingRule {
  id: string;
  name: string;
  type: "time_based" | "quantity_based" | "customer_group" | "location_based";
  conditions: PricingCondition[];
  adjustment: PriceAdjustment;
  priority: number;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
}

export interface PricingCondition {
  field: string;
  operator: "equals" | "greater_than" | "less_than" | "in" | "not_in";
  value: any;
}

export interface PriceAdjustment {
  type: "fixed" | "percentage";
  value: number;
}

// Product Media
export interface ProductMedia {
  images: ProductImage[];
  videos?: ProductVideo[];
  documents?: ProductDocument[];
  gallery?: ProductGalleryItem[];
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
  variants?: string[]; // Which variants this image applies to
  tags?: string[];

  // Image metadata
  width?: number;
  height?: number;
  fileSize?: number;
  format?: string;
}

export interface ProductVideo {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  type: "product_demo" | "tutorial" | "review" | "unboxing";
}

export interface ProductDocument {
  id: string;
  name: string;
  url: string;
  type: "manual" | "specification" | "warranty" | "certificate";
  fileSize?: number;
  format?: string;
}

export interface ProductGalleryItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  caption?: string;
  sortOrder: number;
}

// Product Categories & Brand
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;

  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  // Media
  image?: string;
  icon?: string;
}

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;

  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

// Inventory Management
export interface ProductInventory {
  trackQuantity: boolean;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;

  // Stock levels
  lowStockThreshold?: number;
  outOfStockThreshold: number;

  // Stock status
  stockStatus: StockStatus;
  backorderStatus: BackorderStatus;

  // Multi-location inventory
  locations?: InventoryLocation[];

  // Stock alerts
  alerts?: StockAlert[];
}

export enum StockStatus {
  IN_STOCK = "in_stock",
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
  DISCONTINUED = "discontinued",
}

export enum BackorderStatus {
  NOT_ALLOWED = "not_allowed",
  ALLOWED = "allowed",
  NOTIFY = "notify",
}

export interface InventoryLocation {
  locationId: string;
  locationName: string;
  quantity: number;
  reservedQuantity: number;
}

export interface StockAlert {
  type: "low_stock" | "out_of_stock" | "overstock";
  threshold: number;
  recipients: string[];
  enabled: boolean;
}

// Product Variants & Options
export interface ProductVariant {
  id: string;
  sku: string;
  barcode?: string;

  // Option combinations
  optionValues: VariantOptionValue[];

  // Pricing (can override product pricing)
  pricing?: Partial<ProductPricing>;

  // Inventory
  inventory: ProductInventory;

  // Media
  image?: string;
  additionalImages?: string[];

  // Physical properties
  weight?: number;
  dimensions?: ProductDimensions;

  // Status
  isActive: boolean;
  position: number;
}

export interface ProductOption {
  id: string;
  name: string;
  displayName: string;
  type: OptionType;
  required: boolean;
  position: number;

  // Option values
  values: OptionValue[];

  // Display settings
  displayStyle: OptionDisplayStyle;
}

export enum OptionType {
  COLOR = "color",
  SIZE = "size",
  MATERIAL = "material",
  STYLE = "style",
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
}

export enum OptionDisplayStyle {
  DROPDOWN = "dropdown",
  RADIO = "radio",
  CHECKBOX = "checkbox",
  COLOR_SWATCH = "color_swatch",
  IMAGE_SWATCH = "image_swatch",
  TEXT_INPUT = "text_input",
  NUMBER_INPUT = "number_input",
  DATE_PICKER = "date_picker",
}

export interface OptionValue {
  id: string;
  value: string;
  displayValue: string;
  hexColor?: string; // For color options
  image?: string; // For image swatches
  priceAdjustment?: number;
  weightAdjustment?: number;
  position: number;
  isDefault?: boolean;
}

export interface VariantOptionValue {
  optionId: string;
  valueId: string;
}

// Product Rating & Reviews
export interface ProductRating {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;

  // Review highlights
  positiveHighlights?: string[];
  negativeHighlights?: string[];

  // Verified purchase reviews
  verifiedReviews: number;
  verifiedAverageRating: number;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

// SEO & Marketing
export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;

  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;

  // Schema.org structured data
  structuredData?: ProductStructuredData;

  // URL optimization
  urlHandle: string;
  redirects?: URLRedirect[];
}

export interface ProductStructuredData {
  "@type": "Product";
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  image?: string[];
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
    seller?: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

export interface URLRedirect {
  from: string;
  to: string;
  type: 301 | 302;
  createdAt: string;
}

// Product Attributes
export interface ProductAttribute {
  id: string;
  name: string;
  value: string | number | boolean | string[];
  type: AttributeType;
  isFilterable: boolean;
  isVisible: boolean;
  sortOrder: number;

  // Grouping
  group?: string;

  // Units
  unit?: string;
}

export enum AttributeType {
  TEXT = "text",
  NUMBER = "number",
  BOOLEAN = "boolean",
  SELECT = "select",
  MULTISELECT = "multiselect",
  DATE = "date",
  URL = "url",
  COLOR = "color",
  FILE = "file",
}

// Product Status & Visibility
export enum ProductStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
  SCHEDULED = "scheduled",
}

export interface ProductVisibility {
  isVisible: boolean;
  visibleIn: VisibilityChannel[];

  // Customer group restrictions
  customerGroups?: string[];

  // Geographic restrictions
  countries?: string[];
  regions?: string[];

  // Time-based visibility
  publishDate?: string;
  unpublishDate?: string;
}

export enum VisibilityChannel {
  STOREFRONT = "storefront",
  ADMIN = "admin",
  API = "api",
  MARKETPLACE = "marketplace",
  SOCIAL = "social",
}

// Shipping & Dimensions
export interface ProductShipping {
  weight?: number;
  dimensions?: ProductDimensions;

  // Shipping requirements
  requiresShipping: boolean;
  shippingClass?: string;

  // Restrictions
  hazardous: boolean;
  oversized: boolean;
  fragile: boolean;

  // Special handling
  specialHandling?: string[];

  // Packaging
  packaging?: PackagingInfo;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: "in" | "cm" | "ft" | "m";
}

export interface PackagingInfo {
  type: string;
  weight?: number;
  dimensions?: ProductDimensions;
  materials?: string[];
  instructions?: string;
}

// Product Analytics
export interface ProductAnalytics {
  // View metrics
  views: number;
  uniqueViews: number;

  // Engagement metrics
  addToCartRate: number;
  purchaseRate: number;

  // Performance metrics
  conversionRate: number;
  averageTimeOnPage: number;
  bounceRate: number;

  // Sales metrics
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;

  // Last updated
  lastUpdated: string;
}

// Product Collections/Sets
export interface ProductCollection {
  id: string;
  name: string;
  description?: string;
  type: CollectionType;

  // Rules for automatic collections
  rules?: CollectionRule[];

  // Manual product assignments
  productIds: string[];

  // Display settings
  sortOrder: CollectionSortOrder;
  isVisible: boolean;

  // SEO
  seo?: ProductSEO;

  // Media
  image?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export enum CollectionType {
  MANUAL = "manual",
  AUTOMATIC = "automatic",
  SMART = "smart",
}

export interface CollectionRule {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "starts_with"
    | "ends_with"
    | "greater_than"
    | "less_than";
  value: any;
}

export enum CollectionSortOrder {
  MANUAL = "manual",
  BEST_SELLING = "best_selling",
  CREATED_DESC = "created_desc",
  CREATED_ASC = "created_asc",
  PRICE_DESC = "price_desc",
  PRICE_ASC = "price_asc",
  ALPHA_DESC = "alpha_desc",
  ALPHA_ASC = "alpha_asc",
}

// Product Search & Filtering
export interface ProductSearchFilters extends ProductFilters {
  // Extended filters
  brandIds?: string[];
  subcategoryIds?: string[];
  attributes?: AttributeFilter[];
  hasVariants?: boolean;
  hasDiscount?: boolean;

  // Availability
  availability?: AvailabilityFilter;

  // Location-based
  location?: LocationFilter;

  // Advanced sorting
  sortBy: ProductSortBy;
  sortDirection: "asc" | "desc";
}

export interface AttributeFilter {
  attributeId: string;
  values: string[];
  operator: "any" | "all" | "none";
}

export interface AvailabilityFilter {
  inStock?: boolean;
  backorder?: boolean;
  preorder?: boolean;
}

export interface LocationFilter {
  country?: string;
  region?: string;
  city?: string;
  zipCode?: string;
}

// Product Import/Export
export interface ProductImportData {
  products: Partial<Product>[];
  options?: {
    updateExisting: boolean;
    createMissing: boolean;
    skipErrors: boolean;
  };
}

export interface ProductExportData {
  products: Product[];
  metadata: {
    totalProducts: number;
    exportDate: string;
    format: "json" | "csv" | "xlsx";
    filters?: ProductSearchFilters;
  };
}

export interface ProductBulkOperation {
  type: "update" | "delete" | "export";
  productIds: string[];
  operations?: BulkUpdateOperation[];
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result?: BulkOperationResult;
}

export interface BulkUpdateOperation {
  field: string;
  value: any;
  operation: "set" | "add" | "remove" | "multiply";
}

export interface BulkOperationResult {
  successful: number;
  failed: number;
  errors: Array<{
    productId: string;
    error: string;
  }>;
}
