/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// GLOBAL TYPE DEFINITIONS
// =============================================================================

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// User & Authentication Types
export interface User {
  id: string;
  email: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  sellPrice: number;
  originalPrice: number;
  images: string[];
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  inventory: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceAdjustment: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Enums
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

// Filter & Search Types
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sortBy?: ProductSortBy;
}

export enum ProductSortBy {
  PRICE_LOW_TO_HIGH = "price_asc",
  PRICE_HIGH_TO_LOW = "price_desc",
  RATING = "rating",
  NEWEST = "newest",
  POPULARITY = "popularity",
}

// Component Props Types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Form Types
export interface FormFieldError {
  message: string;
  type: string;
}

export interface FormState<T = any> {
  data: T;
  errors: Record<string, FormFieldError>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Generic Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Database Types (for schema design)
export interface DatabaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    destructive: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}
