/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// ACTION CREATORS INDEX
// =============================================================================

export { createAuthActions } from "./authActions";
export { createCartActions } from "./cartActions";

// Simple action creators for the remaining modules
import {
  RootAction,
  ProductsActions,
  OrdersActions,
  UIActions,
} from "../types";
import { apiClient } from "@/lib/api/client";
import type { Product, ProductFilters, Order } from "@/types";

// =============================================================================
// PRODUCTS ACTIONS
// =============================================================================

export function createProductsActions(
  dispatch: (action: RootAction) => void
): ProductsActions {
  return {
    async loadProducts(filters?: ProductFilters) {
      try {
        dispatch({ type: "PRODUCTS_LOADING" });

        const queryParams = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, String(value));
            }
          });
        }

        const response = await apiClient.get(`/products?${queryParams}`);

        dispatch({
          type: "PRODUCTS_SUCCESS",
          payload: {
            products: response.data.products,
            pagination: response.data.pagination,
          },
        });
      } catch (error: any) {
        dispatch({
          type: "PRODUCTS_ERROR",
          payload: { error: error.message || "Failed to load products" },
        });
        throw error;
      }
    },

    async loadMoreProducts() {
      try {
        // Implementation for pagination
        const response = await apiClient.get("/products/more");
        dispatch({
          type: "LOAD_MORE_PRODUCTS",
          payload: { products: response.data.products },
        });
      } catch (error: any) {
        dispatch({
          type: "PRODUCTS_ERROR",
          payload: { error: error.message || "Failed to load more products" },
        });
        throw error;
      }
    },

    setFilters(filters: Partial<ProductFilters>) {
      dispatch({
        type: "SET_FILTERS",
        payload: { filters },
      });
    },

    clearFilters() {
      dispatch({ type: "CLEAR_FILTERS" });
    },

    async toggleFavorite(productId: string) {
      try {
        await apiClient.post(`/products/${productId}/favorite`);
        dispatch({
          type: "TOGGLE_FAVORITE",
          payload: { productId },
        });
      } catch (error: any) {
        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              message: "Failed to update favorite",
              duration: 3000,
            },
          },
        });
        throw error;
      }
    },

    setViewMode(mode: "grid" | "list") {
      dispatch({
        type: "SET_VIEW_MODE",
        payload: { viewMode: mode },
      });
    },

    addToRecentlyViewed(product: Product) {
      dispatch({
        type: "ADD_TO_RECENTLY_VIEWED",
        payload: { product },
      });
    },

    async search(query: string) {
      try {
        dispatch({ type: "PRODUCTS_LOADING" });

        const response = await apiClient.get(
          `/products/search?q=${encodeURIComponent(query)}`
        );

        dispatch({
          type: "PRODUCTS_SUCCESS",
          payload: {
            products: response.data.products,
            pagination: response.data.pagination,
          },
        });

        dispatch({
          type: "ADD_TO_SEARCH_HISTORY",
          payload: { query },
        });
      } catch (error: any) {
        dispatch({
          type: "PRODUCTS_ERROR",
          payload: { error: error.message || "Search failed" },
        });
        throw error;
      }
    },
  };
}

// =============================================================================
// ORDERS ACTIONS
// =============================================================================

export function createOrdersActions(
  dispatch: (action: RootAction) => void
): OrdersActions {
  return {
    async loadOrders(filters?: any) {
      try {
        dispatch({ type: "ORDERS_LOADING" });

        const queryParams = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, String(value));
            }
          });
        }

        const response = await apiClient.get(`/orders?${queryParams}`);

        dispatch({
          type: "ORDERS_SUCCESS",
          payload: {
            orders: response.data.orders,
            pagination: response.data.pagination,
          },
        });
      } catch (error: any) {
        dispatch({
          type: "ORDERS_ERROR",
          payload: { error: error.message || "Failed to load orders" },
        });
        throw error;
      }
    },

    async loadOrder(orderId: string) {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "loadOrder", isLoading: true },
        });

        const response = await apiClient.get(`/orders/${orderId}`);

        dispatch({
          type: "SET_CURRENT_ORDER",
          payload: { order: response.data.order },
        });
      } catch (error: any) {
        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Order Not Found",
              message: error.message || "Failed to load order details",
              duration: 5000,
            },
          },
        });
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "loadOrder", isLoading: false },
        });
      }
    },

    async createOrder(orderData: any): Promise<Order> {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "createOrder", isLoading: true },
        });

        const response = await apiClient.post("/orders", orderData);

        dispatch({
          type: "SET_CURRENT_ORDER",
          payload: { order: response.data.order },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "success",
              title: "Order Placed!",
              message: `Order #${response.data.order.orderNumber} has been placed successfully.`,
              duration: 5000,
            },
          },
        });

        // Clear cart after successful order
        dispatch({ type: "CLEAR_CART" });

        return response.data.order;
      } catch (error: any) {
        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Order Failed",
              message:
                error.message || "Failed to place order. Please try again.",
              duration: 5000,
            },
          },
        });
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "createOrder", isLoading: false },
        });
      }
    },

    async cancelOrder(orderId: string) {
      try {
        await apiClient.post(`/orders/${orderId}/cancel`);

        dispatch({
          type: "UPDATE_ORDER_STATUS",
          payload: { orderId, status: "cancelled" },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "info",
              title: "Order Cancelled",
              message: "Your order has been cancelled successfully.",
              duration: 4000,
            },
          },
        });
      } catch (error: any) {
        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Cancellation Failed",
              message: error.message || "Failed to cancel order",
              duration: 5000,
            },
          },
        });
        throw error;
      }
    },

    setFilters(filters: any) {
      dispatch({
        type: "SET_ORDER_FILTERS",
        payload: { filters },
      });
    },
  };
}

// =============================================================================
// UI ACTIONS
// =============================================================================

export function createUIActions(
  dispatch: (action: RootAction) => void
): UIActions {
  return {
    setTheme(theme: "light" | "dark" | "system") {
      dispatch({
        type: "SET_THEME",
        payload: { theme },
      });

      // Apply theme immediately
      if (typeof window !== "undefined") {
        const root = document.documentElement;
        if (theme === "dark") {
          root.classList.add("dark");
        } else if (theme === "light") {
          root.classList.remove("dark");
        } else {
          // System theme
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          if (prefersDark) {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      }
    },

    toggleSidebar(section?: string) {
      dispatch({
        type: "TOGGLE_SIDEBAR",
        payload: { section },
      });
    },

    openModal(modalKey: string, data?: any) {
      dispatch({
        type: "OPEN_MODAL",
        payload: { modalKey, data },
      });
    },

    closeModal(modalKey: string) {
      dispatch({
        type: "CLOSE_MODAL",
        payload: { modalKey },
      });
    },

    showToast(toast: {
      type: "success" | "error" | "warning" | "info";
      title?: string;
      message: string;
      duration?: number;
    }) {
      dispatch({
        type: "ADD_TOAST",
        payload: { toast },
      });

      // Auto-remove toast after duration
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          // Note: In a real implementation, you'd need to track toast IDs
          // dispatch({ type: 'REMOVE_TOAST', payload: { toastId } });
        }, toast.duration);
      }
    },

    hideToast(toastId: string) {
      dispatch({
        type: "REMOVE_TOAST",
        payload: { toastId },
      });
    },

    setLoading(key: string, isLoading: boolean) {
      dispatch({
        type: "SET_LOADING",
        payload: { key, isLoading },
      });
    },

    setBreadcrumbs(breadcrumbs: Array<{ label: string; href?: string }>) {
      dispatch({
        type: "SET_BREADCRUMBS",
        payload: { breadcrumbs },
      });
    },

    setPageMeta(title: string, description?: string) {
      dispatch({
        type: "SET_PAGE_META",
        payload: { title, description },
      });

      // Update document title immediately
      if (typeof window !== "undefined") {
        document.title = title;

        if (description) {
          const metaDescription = document.querySelector(
            'meta[name="description"]'
          );
          if (metaDescription) {
            metaDescription.setAttribute("content", description);
          }
        }
      }
    },
  };
}
