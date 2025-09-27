/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// ROOT REDUCER
// =============================================================================

import { RootState, RootAction, ProductFilters } from "../types";
import { authReducer, initialAuthState } from "./authReducer";
import { cartReducer, initialCartState } from "./cartReducers";
import { uiReducer, initialUIState } from "./uiReducers";
import type { Product, Order } from "@/types";

// Products reducer (simplified for now)
const initialProductsState = {
  items: [] as Product[],
  featuredProducts: [] as Product[],
  categories: [],
  brands: [],
  filters: {} as ProductFilters,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  error: null,
  sortBy: "newest",
  viewMode: "grid" as "grid" | "list",
  favorites: [],
  recentlyViewed: [] as Product[],
  searchHistory: [],
};

// Orders reducer (simplified for now)
const initialOrdersState = {
  orders: [] as Order[],
  currentOrder: null as Order | null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  error: null,
  filters: {},
};

// Initial root state
export const initialRootState: RootState = {
  auth: initialAuthState,
  cart: initialCartState,
  products: initialProductsState,
  orders: initialOrdersState,
  ui: initialUIState,
};

// Root reducer function
export function rootReducer(state: RootState, action: RootAction): RootState {
  // Handle global actions first
  switch (action.type) {
    case "RESET_STATE":
      return initialRootState;

    case "HYDRATE_STATE":
      return {
        ...state,
        ...action.payload.state,
      };

    default:
      // Route actions to individual reducers
      return {
        auth: authReducer(state.auth, action as any),
        cart: cartReducer(state.cart, action as any),
        products: productsReducer(state.products, action as any),
        orders: ordersReducer(state.orders, action as any),
        ui: uiReducer(state.ui, action as any),
      };
  }
}

// Products reducer implementation
function productsReducer(state: typeof initialProductsState, action: any) {
  switch (action.type) {
    case "PRODUCTS_LOADING":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "PRODUCTS_SUCCESS":
      return {
        ...state,
        isLoading: false,
        error: null,
        items: action.payload.products,
        pagination: action.payload.pagination || state.pagination,
      };

    case "PRODUCTS_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload.filters },
      };

    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: {},
      };

    case "SET_SORT":
      return {
        ...state,
        sortBy: action.payload.sortBy,
      };

    case "SET_VIEW_MODE":
      return {
        ...state,
        viewMode: action.payload.viewMode,
      };

    case "TOGGLE_FAVORITE":
      const { productId } = action.payload;
      const isFavorite = state.favorites.includes(productId);

      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter((id) => id !== productId)
          : [...state.favorites, productId],
      };

    case "ADD_TO_RECENTLY_VIEWED":
      const { product } = action.payload;
      const recentlyViewed = state.recentlyViewed.filter(
        (p) => p.id !== product.id
      );

      return {
        ...state,
        recentlyViewed: [product, ...recentlyViewed].slice(0, 10),
      };

    case "ADD_TO_SEARCH_HISTORY":
      const { query } = action.payload;
      const searchHistory = state.searchHistory.filter((q) => q !== query);

      return {
        ...state,
        searchHistory: [query, ...searchHistory].slice(0, 10),
      };

    case "LOAD_MORE_PRODUCTS":
      return {
        ...state,
        items: [...state.items, ...action.payload.products],
      };

    case "SET_FEATURED_PRODUCTS":
      return {
        ...state,
        featuredProducts: action.payload.products,
      };

    case "SET_CATEGORIES":
      return {
        ...state,
        categories: action.payload.categories,
      };

    default:
      return state;
  }
}

// Orders reducer implementation
function ordersReducer(state: typeof initialOrdersState, action: any) {
  switch (action.type) {
    case "ORDERS_LOADING":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "ORDERS_SUCCESS":
      return {
        ...state,
        isLoading: false,
        error: null,
        orders: action.payload.orders,
        pagination: action.payload.pagination || state.pagination,
      };

    case "ORDERS_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case "SET_CURRENT_ORDER":
      return {
        ...state,
        currentOrder: action.payload.order,
      };

    case "CLEAR_CURRENT_ORDER":
      return {
        ...state,
        currentOrder: null,
      };

    case "UPDATE_ORDER_STATUS":
      const { orderId, status } = action.payload;

      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
        currentOrder:
          state.currentOrder?.id === orderId
            ? { ...state.currentOrder, status }
            : state.currentOrder,
      };

    case "SET_ORDER_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload.filters },
      };

    default:
      return state;
  }
}

// Export individual reducers for testing
export {
  authReducer,
  cartReducer,
  uiReducer,
  productsReducer,
  ordersReducer,
  initialAuthState,
  initialCartState,
  initialUIState,
};
