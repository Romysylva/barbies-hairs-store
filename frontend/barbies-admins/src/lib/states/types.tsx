/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// STATE MANAGEMENT TYPES
// =============================================================================

import { User, Product, CartItem, Order, ProductFilters } from "@/types";

// Base Action Type
export interface BaseAction {
  type: string;
  payload?: any;
  meta?: {
    timestamp: number;
    source?: string;
  };
}

// Loading State
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Pagination State
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// =============================================================================
// AUTH STATE
// =============================================================================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
  lastActivity: number | null;
  sessionTimeout: number; // in milliseconds
}

export type AuthAction =
  | { type: "AUTH_REQUEST" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; tokens: any } }
  | { type: "AUTH_FAILURE"; payload: { error: string } }
  | { type: "LOGOUT" }
  | { type: "REFRESH_TOKEN_SUCCESS"; payload: { tokens: any } }
  | { type: "UPDATE_USER"; payload: { user: Partial<User> } }
  | { type: "UPDATE_ACTIVITY" }
  | { type: "SESSION_EXPIRED" };

// =============================================================================
// CART STATE
// =============================================================================

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  total: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  appliedCoupons: string[];
  lastUpdated: number;
  isSubmitting: boolean;
}

export type CartAction =
  | { type: "CART_LOADING"; payload?: { isSubmitting?: boolean } }
  | { type: "CART_ERROR"; payload: { error: string } }
  | { type: "CART_LOADED"; payload: { items: CartItem[] } }
  | {
      type: "ADD_TO_CART";
      payload: { product: Product; quantity: number; variantId?: string };
    }
  | { type: "REMOVE_FROM_CART"; payload: { itemId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { itemId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "APPLY_COUPON"; payload: { couponCode: string } }
  | { type: "REMOVE_COUPON"; payload: { couponCode: string } }
  | { type: "UPDATE_TOTALS"; payload: { totals: CartState["total"] } }
  | { type: "CART_SYNC_SUCCESS" }
  | { type: "OPTIMISTIC_ADD"; payload: { product: Product; quantity: number } }
  | { type: "OPTIMISTIC_REMOVE"; payload: { itemId: string } };

// =============================================================================
// PRODUCTS STATE
// =============================================================================

export interface ProductsState {
  items: Product[];
  featuredProducts: Product[];
  categories: any[];
  brands: any[];
  filters: ProductFilters;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  sortBy: string;
  viewMode: "grid" | "list";
  favorites: string[];
  recentlyViewed: Product[];
  searchHistory: string[];
}

export type ProductsAction =
  | { type: "PRODUCTS_LOADING" }
  | {
      type: "PRODUCTS_SUCCESS";
      payload: { products: Product[]; pagination?: PaginationState };
    }
  | { type: "PRODUCTS_ERROR"; payload: { error: string } }
  | { type: "SET_FILTERS"; payload: { filters: Partial<ProductFilters> } }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_SORT"; payload: { sortBy: string } }
  | { type: "SET_VIEW_MODE"; payload: { viewMode: "grid" | "list" } }
  | { type: "TOGGLE_FAVORITE"; payload: { productId: string } }
  | { type: "ADD_TO_RECENTLY_VIEWED"; payload: { product: Product } }
  | { type: "ADD_TO_SEARCH_HISTORY"; payload: { query: string } }
  | { type: "LOAD_MORE_PRODUCTS"; payload: { products: Product[] } }
  | { type: "SET_FEATURED_PRODUCTS"; payload: { products: Product[] } }
  | { type: "SET_CATEGORIES"; payload: { categories: any[] } };

// =============================================================================
// ORDERS STATE
// =============================================================================

export interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export type OrdersAction =
  | { type: "ORDERS_LOADING" }
  | {
      type: "ORDERS_SUCCESS";
      payload: { orders: Order[]; pagination?: PaginationState };
    }
  | { type: "ORDERS_ERROR"; payload: { error: string } }
  | { type: "SET_CURRENT_ORDER"; payload: { order: Order } }
  | { type: "CLEAR_CURRENT_ORDER" }
  | {
      type: "UPDATE_ORDER_STATUS";
      payload: { orderId: string; status: string };
    }
  | {
      type: "SET_ORDER_FILTERS";
      payload: { filters: Partial<OrdersState["filters"]> };
    };

// =============================================================================
// UI STATE
// =============================================================================

export interface UIState {
  theme: "light" | "dark" | "system";
  sidebar: {
    isOpen: boolean;
    activeSection?: string;
  };
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };
  toasts: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title?: string;
    message: string;
    duration?: number;
    timestamp: number;
  }>;
  loading: {
    [key: string]: boolean;
  };
  breadcrumbs: Array<{
    label: string;
    href?: string;
  }>;
  pageTitle: string;
  metaDescription?: string;
}

export type UIAction =
  | { type: "SET_THEME"; payload: { theme: UIState["theme"] } }
  | { type: "TOGGLE_SIDEBAR"; payload?: { section?: string } }
  | { type: "OPEN_MODAL"; payload: { modalKey: string; data?: any } }
  | { type: "CLOSE_MODAL"; payload: { modalKey: string } }
  | {
      type: "ADD_TOAST";
      payload: { toast: Omit<UIState["toasts"][0], "id" | "timestamp"> };
    }
  | { type: "REMOVE_TOAST"; payload: { toastId: string } }
  | { type: "SET_LOADING"; payload: { key: string; isLoading: boolean } }
  | {
      type: "SET_BREADCRUMBS";
      payload: { breadcrumbs: UIState["breadcrumbs"] };
    }
  | { type: "SET_PAGE_META"; payload: { title: string; description?: string } }
  | { type: "CLEAR_ALL_TOASTS" };

// =============================================================================
// ROOT STATE
// =============================================================================

export interface RootState {
  auth: AuthState;
  cart: CartState;
  products: ProductsState;
  orders: OrdersState;
  ui: UIState;
}

export type RootAction =
  | AuthAction
  | CartAction
  | ProductsAction
  | OrdersAction
  | UIAction
  | { type: "RESET_STATE" }
  | { type: "HYDRATE_STATE"; payload: { state: Partial<RootState> } };

// =============================================================================
// STORE TYPES
// =============================================================================

export interface StoreConfig {
  persistKeys?: (keyof RootState)[];
  middleware?: Middleware[];
  devTools?: boolean;
}

export interface Middleware {
  name: string;
  middleware: (
    action: RootAction,
    state: RootState,
    next: (action: RootAction) => void
  ) => void;
}

// =============================================================================
// CONTEXT TYPES
// =============================================================================

export interface StoreContextValue {
  state: RootState;
  dispatch: React.Dispatch<RootAction>;
  actions: {
    auth: AuthActions;
    cart: CartActions;
    products: ProductsActions;
    orders: OrdersActions;
    ui: UIActions;
  };
}

// Action creators interface
export interface AuthActions {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateActivity: () => void;
}

export interface CartActions {
  addToCart: (
    product: Product,
    quantity: number,
    variantId?: string
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: (couponCode: string) => Promise<void>;
  syncCart: () => Promise<void>;
}

export interface ProductsActions {
  loadProducts: (filters?: ProductFilters) => Promise<void>;
  loadMoreProducts: () => Promise<void>;
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  toggleFavorite: (productId: string) => Promise<void>;
  setViewMode: (mode: "grid" | "list") => void;
  addToRecentlyViewed: (product: Product) => void;
  search: (query: string) => Promise<void>;
}

export interface OrdersActions {
  loadOrders: (filters?: any) => Promise<void>;
  loadOrder: (orderId: string) => Promise<void>;
  createOrder: (orderData: any) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  setFilters: (filters: any) => void;
}

export interface UIActions {
  setTheme: (theme: UIState["theme"]) => void;
  toggleSidebar: (section?: string) => void;
  openModal: (modalKey: string, data?: any) => void;
  closeModal: (modalKey: string) => void;
  showToast: (toast: Omit<UIState["toasts"][0], "id" | "timestamp">) => void;
  hideToast: (toastId: string) => void;
  setLoading: (key: string, isLoading: boolean) => void;
  setBreadcrumbs: (breadcrumbs: UIState["breadcrumbs"]) => void;
  setPageMeta: (title: string, description?: string) => void;
}
