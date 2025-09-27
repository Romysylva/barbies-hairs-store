/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// CART ACTIONS
// =============================================================================

import { RootAction, CartActions } from "../types";
import { apiClient } from "@/lib/api/client";
import type { Product } from "@/types";

export function createCartActions(
  dispatch: (action: RootAction) => void
): CartActions {
  return {
    // Add product to cart
    async addToCart(
      product: Product,
      quantity: number = 1,
      variantId?: string
    ) {
      try {
        // Optimistic update first for better UX
        dispatch({
          type: "OPTIMISTIC_ADD",
          payload: { product, quantity },
        });

        // Show loading toast
        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "info",
              title: "Adding to cart...",
              message: `${product.name}`,
              duration: 2000,
            },
          },
        });

        // Then sync with server
        const response = await apiClient.post("/cart/add", {
          productId: product.id,
          quantity,
          variantId,
        });

        // Update with server response
        dispatch({
          type: "ADD_TO_CART",
          payload: { product, quantity, variantId },
        });

        dispatch({
          type: "CART_SYNC_SUCCESS",
        });

        // Show success toast
        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "success",
              title: "Added to Cart!",
              message: `${quantity}x ${product.name}`,
              duration: 3000,
            },
          },
        });
      } catch (error: any) {
        // Revert optimistic update on error
        dispatch({
          type: "CART_ERROR",
          payload: { error: error.message || "Failed to add item to cart" },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Failed to Add Item",
              message: error.message || "Please try again",
              duration: 5000,
            },
          },
        });

        throw error;
      }
    },

    // Remove product from cart
    async removeFromCart(itemId: string) {
      try {
        // Optimistic update
        dispatch({
          type: "OPTIMISTIC_REMOVE",
          payload: { itemId },
        });

        // Sync with server
        await apiClient.delete(`/cart/items/${itemId}`);

        dispatch({
          type: "REMOVE_FROM_CART",
          payload: { itemId },
        });

        dispatch({ type: "CART_SYNC_SUCCESS" });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "info",
              message: "Item removed from cart",
              duration: 2000,
            },
          },
        });
      } catch (error: any) {
        dispatch({
          type: "CART_ERROR",
          payload: {
            error: error.message || "Failed to remove item from cart",
          },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Failed to Remove Item",
              message: error.message || "Please try again",
              duration: 5000,
            },
          },
        });

        throw error;
      }
    },

    // Update item quantity
    async updateQuantity(itemId: string, quantity: number) {
      try {
        if (quantity < 0) {
          throw new Error("Quantity cannot be negative");
        }

        if (quantity === 0) {
          return this.removeFromCart(itemId);
        }

        // Optimistic update
        dispatch({
          type: "UPDATE_QUANTITY",
          payload: { itemId, quantity },
        });

        // Sync with server
        await apiClient.patch(`/cart/items/${itemId}`, { quantity });

        dispatch({ type: "CART_SYNC_SUCCESS" });
      } catch (error: any) {
        dispatch({
          type: "CART_ERROR",
          payload: { error: error.message || "Failed to update item quantity" },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Failed to Update Quantity",
              message: error.message || "Please try again",
              duration: 5000,
            },
          },
        });

        throw error;
      }
    },

    // Clear entire cart
    async clearCart() {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "clearCart", isLoading: true },
        });

        await apiClient.delete("/cart");

        dispatch({ type: "CLEAR_CART" });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "info",
              message: "Cart cleared successfully",
              duration: 3000,
            },
          },
        });
      } catch (error: any) {
        dispatch({
          type: "CART_ERROR",
          payload: { error: error.message || "Failed to clear cart" },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Failed to Clear Cart",
              message: error.message || "Please try again",
              duration: 5000,
            },
          },
        });

        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "clearCart", isLoading: false },
        });
      }
    },

    // Apply coupon code
    async applyCoupon(couponCode: string) {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "applyCoupon", isLoading: true },
        });

        const response = await apiClient.post("/cart/coupons", { couponCode });

        dispatch({
          type: "APPLY_COUPON",
          payload: { couponCode },
        });

        if (response.data.totals) {
          dispatch({
            type: "UPDATE_TOTALS",
            payload: { totals: response.data.totals },
          });
        }

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "success",
              title: "Coupon Applied!",
              message: `Saved ${response.data.discount || 0}% with ${couponCode}`,
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
              title: "Invalid Coupon",
              message: error.message || "This coupon code is not valid",
              duration: 5000,
            },
          },
        });

        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "applyCoupon", isLoading: false },
        });
      }
    },

    // Remove coupon code
    async removeCoupon(couponCode: string) {
      try {
        await apiClient.delete(`/cart/coupons/${couponCode}`);

        dispatch({
          type: "REMOVE_COUPON",
          payload: { couponCode },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "info",
              message: "Coupon removed",
              duration: 2000,
            },
          },
        });
      } catch (error: any) {
        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Failed to Remove Coupon",
              message: error.message || "Please try again",
              duration: 5000,
            },
          },
        });

        throw error;
      }
    },

    // Sync cart with server
    async syncCart() {
      try {
        dispatch({
          type: "CART_LOADING",
          payload: { isSubmitting: true },
        });

        const response = await apiClient.get("/cart");

        dispatch({
          type: "CART_LOADED",
          payload: { items: response.data.items },
        });

        if (response.data.totals) {
          dispatch({
            type: "UPDATE_TOTALS",
            payload: { totals: response.data.totals },
          });
        }

        dispatch({ type: "CART_SYNC_SUCCESS" });
      } catch (error: any) {
        dispatch({
          type: "CART_ERROR",
          payload: { error: error.message || "Failed to sync cart" },
        });

        throw error;
      }
    },
  };
}
