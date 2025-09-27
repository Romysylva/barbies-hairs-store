"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import { RootState, RootAction, StoreContextValue, StoreConfig } from "./types";
import { rootReducer, initialRootState } from "./reducers";
import {
  defaultMiddleware,
  productionMiddleware,
  hydrateState,
} from "./middlewares";
import { createAuthActions } from "./actions/authActions";
import { createCartActions } from "./actions/cartActions";
import { createProductsActions } from "./actions/productsActions";
import { createOrdersActions } from "./actions/ordersActions";
import { createUIActions } from "./actions/uiActions";

// =============================================================================
// STORE CONTEXT
// =============================================================================

const StoreContext = createContext<StoreContextValue | null>(null);

// =============================================================================
// ENHANCED DISPATCH FUNCTION
// =============================================================================

function createEnhancedDispatch(
  dispatch: React.Dispatch<RootAction>,
  state: RootState,
  middleware: typeof defaultMiddleware
) {
  return (action: RootAction) => {
    let currentIndex = 0;

    function next(currentAction: RootAction) {
      if (currentIndex >= middleware.length) {
        dispatch(currentAction);
        return;
      }

      const currentMiddleware = middleware[currentIndex++];
      currentMiddleware.middleware(currentAction, state, next);
    }

    next(action);
  };
}

// =============================================================================
// STORE PROVIDER COMPONENT
// =============================================================================

interface StoreProviderProps {
  children: React.ReactNode;
  config?: StoreConfig;
}

export function StoreProvider({ children, config = {} }: StoreProviderProps) {
  const [state, dispatch] = useReducer(rootReducer, initialRootState);

  // Setup middleware
  const middleware = useMemo(() => {
    if (config.middleware) {
      return config.middleware;
    }
    return process.env.NODE_ENV === "development"
      ? defaultMiddleware
      : productionMiddleware;
  }, [config.middleware]);

  // Create enhanced dispatch with middleware
  const enhancedDispatch = useMemo(
    () => createEnhancedDispatch(dispatch, state, middleware),
    [state, middleware]
  );

  // Create action creators
  const actions = useMemo(
    () => ({
      auth: createAuthActions(enhancedDispatch),
      cart: createCartActions(enhancedDispatch),
      products: createProductsActions(enhancedDispatch),
      orders: createOrdersActions(enhancedDispatch),
      ui: createUIActions(enhancedDispatch),
    }),
    [enhancedDispatch]
  );

  // Hydrate state from localStorage on mount
  useEffect(() => {
    const persistedState = hydrateState();
    if (persistedState) {
      enhancedDispatch({
        type: "HYDRATE_STATE",
        payload: { state: persistedState },
      });
    }
  }, [enhancedDispatch]);

  // Context value
  const contextValue = useMemo<StoreContextValue>(
    () => ({
      state,
      dispatch: enhancedDispatch,
      actions,
    }),
    [state, enhancedDispatch, actions]
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

// Specific state selectors
export function useAuth() {
  const { state } = useStore();
  return state.auth;
}

export function useCart() {
  const { state } = useStore();
  return state.cart;
}

export function useProducts() {
  const { state } = useStore();
  return state.products;
}

export function useOrders() {
  const { state } = useStore();
  return state.orders;
}

export function useUI() {
  const { state } = useStore();
  return state.ui;
}

// Action hooks
export function useAuthActions() {
  const { actions } = useStore();
  return actions.auth;
}

export function useCartActions() {
  const { actions } = useStore();
  return actions.cart;
}

export function useProductsActions() {
  const { actions } = useStore();
  return actions.products;
}

export function useOrdersActions() {
  const { actions } = useStore();
  return actions.orders;
}

export function useUIActions() {
  const { actions } = useStore();
  return actions.ui;
}

// =============================================================================
// SELECTOR HOOKS (OPTIMIZED)
// =============================================================================

// Memoized selectors for better performance
export function useCartTotal() {
  const { state } = useStore();
  return useMemo(() => state.cart.total, [state.cart.total]);
}

export function useCartItemCount() {
  const { state } = useStore();
  return useMemo(() => {
    return state.cart.items.reduce((count, item) => count + item.quantity, 0);
  }, [state.cart.items]);
}

export function useIsAuthenticated() {
  const { state } = useStore();
  return state.auth.isAuthenticated;
}

export function useCurrentUser() {
  const { state } = useStore();
  return state.auth.user;
}

export function useTheme() {
  const { state } = useStore();
  return state.ui.theme;
}

export function useLoading(key: string) {
  const { state } = useStore();
  return state.ui.loading[key] ?? false;
}

export function useToasts() {
  const { state } = useStore();
  return state.ui.toasts;
}

export function useModal(modalKey: string) {
  const { state } = useStore();
  return state.ui.modals[modalKey] ?? { isOpen: false, data: null };
}

export function useFavorites() {
  const { state } = useStore();
  return state.products.favorites;
}

export function useRecentlyViewed() {
  const { state } = useStore();
  return state.products.recentlyViewed;
}

// =============================================================================
// COMPUTED SELECTORS
// =============================================================================

export function useCartSummary() {
  const { state } = useStore();

  return useMemo(() => {
    const { items, total, appliedCoupons } = state.cart;

    return {
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      uniqueItemCount: items.length,
      total: total.total,
      subtotal: total.subtotal,
      tax: total.tax,
      shipping: total.shipping,
      discount: total.discount,
      appliedCoupons,
      isEmpty: items.length === 0,
      hasDiscount: total.discount > 0,
      qualifiesForFreeShipping: total.subtotal >= 50,
    };
  }, [state.cart]);
}

export function useProductFiltersApplied() {
  const { state } = useStore();

  return useMemo(() => {
    const { filters } = state.products;
    const appliedFilters = Object.keys(filters).filter(
      (key) => filters[key as keyof typeof filters] !== undefined
    );

    return {
      hasFilters: appliedFilters.length > 0,
      filterCount: appliedFilters.length,
      appliedFilters,
    };
  }, [state.products.filters]);
}

export function useOrderHistory() {
  const { state } = useStore();

  return useMemo(() => {
    const { orders } = state.orders;

    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const recentOrders = orders.slice(0, 5);

    return {
      orders,
      totalOrders,
      totalSpent,
      recentOrders,
      isEmpty: totalOrders === 0,
    };
  }, [state.orders.orders]);
}

// =============================================================================
// DEBUG HOOKS (DEVELOPMENT ONLY)
// =============================================================================

export function useStoreDebug() {
  const { state } = useStore();

  if (process.env.NODE_ENV === "development") {
    // Log state changes in development
    useEffect(() => {
      console.log("🏪 Store State Updated:", state);
    }, [state]);
  }

  return {
    state,
    stateSize: JSON.stringify(state).length,
    timestamp: Date.now(),
  };
}
