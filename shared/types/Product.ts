// Comprehensive Product Management Types for Advanced Ecommerce

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived' | 'discontinued';
export type ProductType = 'simple' | 'variable' | 'grouped' | 'bundle' | 'subscription' | 'booking' | 'service';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'preorder';
export type TaxClass = 'standard' | 'reduced' | 'zero' | 'exempt';
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';
export type DimensionUnit = 'cm' | 'in' | 'm' | 'mm';

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
  weight: number;
  weight_unit: WeightUnit;
}

export interface ProductImage {
  _id: string;
  url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  size_variants?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
}

export interface ProductAttribute {
  _id: string;
  name: string;
  slug: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'image';
  values: string[];
  is_required: boolean;
  is_variation: boolean;
  is_taxonomy: boolean;
  visibility: 'visible' | 'hidden' | 'admin_only';
}

export interface ProductVariation {
  _id: string;
  attributes: Record<string, string>; // attribute_id -> value
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  weight?: number;
  dimensions?: ProductDimensions;
  image?: string;
  status: ProductStatus;
  is_virtual: boolean;
  is_downloadable: boolean;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image?: string;
  seo_title?: string;
  seo_description?: string;
  sort_order: number;
  is_featured: boolean;
  product_count: number;
}

export interface ProductTag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface ProductSEO {
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  structured_data?: Record<string, any>;
}

export interface ProductPricing {
  regular_price: number;
  sale_price?: number;
  sale_start_date?: string;
  sale_end_date?: string;
  cost_price?: number;
  tier_pricing?: Array<{
    min_quantity: number;
    price: number;
  }>;
  dynamic_pricing?: {
    enabled: boolean;
    rules: Array<{
      condition: string;
      discount_type: 'percentage' | 'fixed';
      discount_value: number;
    }>;
  };
}

export interface ProductInventory {
  manage_stock: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status: StockStatus;
  backorders: 'no' | 'notify' | 'yes';
  sold_individually: boolean;
  location?: string;
  bin_location?: string;
  supplier_id?: string;
  reorder_point?: number;
  reorder_quantity?: number;
}

export interface ProductDownload {
  _id: string;
  name: string;
  file_url: string;
  download_limit?: number;
  download_expiry?: number; // days
}

export interface ProductReview {
  _id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified_purchase: boolean;
  helpful_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ProductRelated {
  cross_sells: string[]; // product IDs
  up_sells: string[];
  related_products: string[];
  frequently_bought_together: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  type: ProductType;
  status: ProductStatus;
  featured: boolean;
  
  // SKU and Identification
  sku: string;
  barcode?: string;
  brand_id?: string;
  manufacturer?: string;
  
  // Pricing
  pricing: ProductPricing;
  tax_class: TaxClass;
  
  // Inventory
  inventory: ProductInventory;
  
  // Physical Properties
  is_virtual: boolean;
  is_downloadable: boolean;
  dimensions?: ProductDimensions;
  
  // Media
  images: ProductImage[];
  gallery?: string[];
  video_url?: string;
  
  // Categorization
  categories: string[]; // category IDs
  tags: string[]; // tag IDs
  
  // Variations (for variable products)
  variations?: ProductVariation[];
  attributes?: ProductAttribute[];
  default_attributes?: Record<string, string>;
  
  // Digital Downloads
  downloads?: ProductDownload[];
  
  // Related Products
  related: ProductRelated;
  
  // Reviews
  reviews: {
    average_rating: number;
    review_count: number;
    rating_distribution: Record<number, number>; // 1-5 stars -> count
  };
  
  // SEO
  seo: ProductSEO;
  
  // Subscription (for subscription products)
  subscription?: {
    period: 'day' | 'week' | 'month' | 'year';
    period_interval: number;
    length?: number; // subscription length
    sign_up_fee?: number;
    trial_period?: number;
    trial_length?: number;
  };
  
  // Booking (for service products)
  booking?: {
    duration: number; // minutes
    buffer_time: number; // minutes between bookings
    max_bookings_per_day?: number;
    advance_booking_days?: number;
    staff_required?: string[]; // staff IDs
    resources_required?: string[]; // resource IDs
  };
  
  // Analytics
  analytics: {
    views: number;
    sales: number;
    revenue: number;
    conversion_rate: number;
    last_viewed: string;
    last_sold: string;
  };
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // Additional Features
  custom_fields?: Record<string, any>;
  shipping_class?: string;
  purchase_note?: string;
  menu_order: number;
  
  // Multi-language support
  translations?: Record<string, {
    name: string;
    description: string;
    short_description?: string;
    seo?: ProductSEO;
  }>;
}

export interface ProductFilter {
  categories?: string[];
  tags?: string[];
  price_min?: number;
  price_max?: number;
  status?: ProductStatus[];
  type?: ProductType[];
  featured?: boolean;
  in_stock?: boolean;
  on_sale?: boolean;
  rating_min?: number;
  brand_id?: string;
  search?: string;
  attributes?: Record<string, string[]>;
  sort_by?: 'name' | 'price' | 'date' | 'popularity' | 'rating' | 'sales';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  filters_applied: ProductFilter;
  facets?: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ id: string; name: string; count: number }>;
    price_ranges: Array<{ min: number; max: number; count: number }>;
    attributes: Record<string, Array<{ value: string; count: number }>>;
  };
}

export interface ProductSearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'attribute';
  id: string;
  name: string;
  image?: string;
  price?: number;
  category?: string;
}

export interface ProductRecommendation {
  product: Product;
  score: number;
  reason: 'viewed_together' | 'bought_together' | 'similar_attributes' | 'trending' | 'personalized';
}

export interface ProductBundle {
  _id: string;
  name: string;
  products: Array<{
    product_id: string;
    quantity: number;
    optional: boolean;
  }>;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  price: number;
  savings: number;
}

export interface ProductComparison {
  products: Product[];
  attributes: ProductAttribute[];
  comparison_matrix: Record<string, Record<string, any>>;
}

// Inventory tracking
export interface StockMovement {
  _id: string;
  product_id: string;
  variation_id?: string;
  type: 'in' | 'out' | 'adjustment' | 'reserved' | 'returned';
  quantity: number;
  reason: string;
  reference_id?: string; // order_id, return_id, etc.
  user_id: string;
  notes?: string;
  created_at: string;
}

export interface InventoryAlert {
  _id: string;
  product_id: string;
  variation_id?: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  current_quantity: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

// Product utility functions
export const getProductPrice = (product: Product, quantity: number = 1): number => {
  const pricing = product.pricing;
  
  // Check for tier pricing
  if (pricing.tier_pricing) {
    const tier = pricing.tier_pricing
      .filter(t => quantity >= t.min_quantity)
      .sort((a, b) => b.min_quantity - a.min_quantity)[0];
    
    if (tier) return tier.price;
  }
  
  // Return sale price if active, otherwise regular price
  if (pricing.sale_price && pricing.sale_start_date && pricing.sale_end_date) {
    const now = new Date();
    const start = new Date(pricing.sale_start_date);
    const end = new Date(pricing.sale_end_date);
    
    if (now >= start && now <= end) {
      return pricing.sale_price;
    }
  }
  
  return pricing.regular_price;
};

export const getProductDiscountPercentage = (product: Product): number => {
  const regular = product.pricing.regular_price;
  const sale = product.pricing.sale_price;
  
  if (!sale || sale >= regular) return 0;
  
  return Math.round(((regular - sale) / regular) * 100);
};

export const isProductOnSale = (product: Product): boolean => {
  const pricing = product.pricing;
  
  if (!pricing.sale_price || pricing.sale_price >= pricing.regular_price) {
    return false;
  }
  
  if (pricing.sale_start_date && pricing.sale_end_date) {
    const now = new Date();
    const start = new Date(pricing.sale_start_date);
    const end = new Date(pricing.sale_end_date);
    
    return now >= start && now <= end;
  }
  
  return true;
};

export const getProductAvailabilityText = (product: Product): string => {
  if (!product.inventory.manage_stock) return 'In Stock';
  
  const quantity = product.inventory.stock_quantity;
  const threshold = product.inventory.low_stock_threshold;
  
  if (quantity <= 0) {
    return product.inventory.backorders !== 'no' ? 'Available on backorder' : 'Out of Stock';
  }
  
  if (quantity <= threshold) return `Only ${quantity} left in stock`;
  
  return 'In Stock';
};

export const canProductBePurchased = (product: Product): boolean => {
  if (product.status !== 'active') return false;
  
  if (product.inventory.manage_stock) {
    if (product.inventory.stock_quantity <= 0 && product.inventory.backorders === 'no') {
      return false;
    }
  }
  
  return true;
};
