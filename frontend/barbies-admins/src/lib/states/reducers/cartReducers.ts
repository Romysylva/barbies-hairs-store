import { CartState, CartAction } from "../types";
import { generateId } from "@/lib/utils";
import type { CartItem, Product } from "@/types";

// =============================================================================
// CART REDUCER
// =============================================================================

export const initialCartState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  total: {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
  },
  appliedCoupons: [],
  lastUpdated: 0,
  isSubmitting: false,
};

// Helper function to calculate totals
function calculateTotals(
  items: CartItem[],
  appliedCoupons: string[] = []
): CartState["total"] {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.product.sellPrice * item.quantity;
  }, 0);

  // Simple tax calculation (8.25%)
  const tax = subtotal * 0.0825;

  // Simple shipping calculation
  const shipping = subtotal > 50 ? 0 : 9.99;

  // Simple discount calculation based on coupons
  let discount = 0;
  appliedCoupons.forEach((coupon) => {
    switch (coupon.toLowerCase()) {
      case "save10":
        discount += subtotal * 0.1;
        break;
      case "freeship":
        discount += shipping;
        break;
      case "save20":
        discount += subtotal * 0.2;
        break;
      default:
        break;
    }
  });

  const total = Math.max(0, subtotal + tax + shipping - discount);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

// Helper function to find item by product and variant
function findCartItemIndex(
  items: CartItem[],
  productId: string,
  variantId?: string
): number {
  return items.findIndex(
    (item) =>
      item.product.id === productId && item.selectedVariant?.id === variantId
  );
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "CART_LOADING":
      return {
        ...state,
        isLoading: !action.payload?.isSubmitting,
        isSubmitting: action.payload?.isSubmitting ?? false,
        error: null,
      };

    case "CART_ERROR":
      return {
        ...state,
        isLoading: false,
        isSubmitting: false,
        error: action.payload.error,
      };

    case "CART_LOADED":
      const loadedTotals = calculateTotals(
        action.payload.items,
        state.appliedCoupons
      );
      return {
        ...state,
        items: action.payload.items,
        isLoading: false,
        error: null,
        total: loadedTotals,
        lastUpdated: Date.now(),
      };

    case "ADD_TO_CART": {
      const { product, quantity, variantId } = action.payload;
      const existingItemIndex = findCartItemIndex(
        state.items,
        product.id,
        variantId
      );

      let newItems: CartItem[];

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: generateId("cart-item"),
          product,
          quantity,
          selectedVariant: variantId
            ? {
                id: variantId,
                name: "",
                value: "",
                priceAdjustment: 0,
              }
            : undefined,
        };
        newItems = [...state.items, newItem];
      }

      const newTotals = calculateTotals(newItems, state.appliedCoupons);

      return {
        ...state,
        items: newItems,
        total: newTotals,
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "OPTIMISTIC_ADD": {
      // Optimistic update for better UX
      const { product, quantity } = action.payload;
      const existingItemIndex = findCartItemIndex(state.items, product.id);

      let newItems: CartItem[];

      if (existingItemIndex !== -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: generateId("cart-item"),
          product,
          quantity,
        };
        newItems = [...state.items, newItem];
      }

      const newTotals = calculateTotals(newItems, state.appliedCoupons);

      return {
        ...state,
        items: newItems,
        total: newTotals,
        isSubmitting: true,
      };
    }

    case "REMOVE_FROM_CART": {
      const newItems = state.items.filter(
        (item) => item.id !== action.payload.itemId
      );
      const newTotals = calculateTotals(newItems, state.appliedCoupons);

      return {
        ...state,
        items: newItems,
        total: newTotals,
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "OPTIMISTIC_REMOVE": {
      const newItems = state.items.filter(
        (item) => item.id !== action.payload.itemId
      );
      const newTotals = calculateTotals(newItems, state.appliedCoupons);

      return {
        ...state,
        items: newItems,
        total: newTotals,
        isSubmitting: true,
      };
    }

    case "UPDATE_QUANTITY": {
      const { itemId, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.items.filter((item) => item.id !== itemId);
        const newTotals = calculateTotals(newItems, state.appliedCoupons);

        return {
          ...state,
          items: newItems,
          total: newTotals,
          lastUpdated: Date.now(),
          error: null,
        };
      }

      const newItems = state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const newTotals = calculateTotals(newItems, state.appliedCoupons);

      return {
        ...state,
        items: newItems,
        total: newTotals,
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
        },
        appliedCoupons: [],
        lastUpdated: Date.now(),
        error: null,
      };

    case "APPLY_COUPON": {
      const { couponCode } = action.payload;

      if (state.appliedCoupons.includes(couponCode)) {
        return state; // Coupon already applied
      }

      const newCoupons = [...state.appliedCoupons, couponCode];
      const newTotals = calculateTotals(state.items, newCoupons);

      return {
        ...state,
        appliedCoupons: newCoupons,
        total: newTotals,
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "REMOVE_COUPON": {
      const { couponCode } = action.payload;
      const newCoupons = state.appliedCoupons.filter(
        (coupon) => coupon !== couponCode
      );
      const newTotals = calculateTotals(state.items, newCoupons);

      return {
        ...state,
        appliedCoupons: newCoupons,
        total: newTotals,
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "UPDATE_TOTALS":
      return {
        ...state,
        total: action.payload.totals,
        lastUpdated: Date.now(),
      };

    case "CART_SYNC_SUCCESS":
      return {
        ...state,
        isSubmitting: false,
        error: null,
        lastUpdated: Date.now(),
      };

    default:
      return state;
  }
}
