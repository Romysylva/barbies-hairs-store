/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// MIDDLEWARE
// =============================================================================

// import { any } from "zod";
import { RootAction, RootState, Middleware } from "../types";

// =============================================================================
// LOGGING MIDDLEWARE
// =============================================================================

export const loggingMiddleware: Middleware = {
  name: "logging",
  middleware: (action: RootAction, state: RootState, next) => {
    if (process.env.NODE_ENV === "development") {
      console.group(`🔄 Action: ${action.type}`);
      console.log("Previous State:", state);
      console.log("Action:", action);

      const startTime = performance.now();
      next(action);
      const endTime = performance.now();

      console.log("Execution Time:", `${(endTime - startTime).toFixed(2)}ms`);
      console.groupEnd();
    } else {
      next(action);
    }
  },
};

// =============================================================================
// PERSISTENCE MIDDLEWARE
// =============================================================================

export const persistenceMiddleware: Middleware = {
  name: "persistence",
  middleware: (action: RootAction, state: RootState, next) => {
    next(action);

    // Actions that should trigger persistence
    const persistableActions = [
      "AUTH_SUCCESS",
      "LOGOUT",
      "UPDATE_USER",
      "ADD_TO_CART",
      "REMOVE_FROM_CART",
      "UPDATE_QUANTITY",
      "CLEAR_CART",
      "APPLY_COUPON",
      "REMOVE_COUPON",
      "TOGGLE_FAVORITE",
      "SET_VIEW_MODE",
      "SET_THEME",
      "ADD_TO_RECENTLY_VIEWED",
      "ADD_TO_SEARCH_HISTORY",
    ];

    if (persistableActions.includes(action.type)) {
      // Debounce persistence to avoid too many writes
      debounce(() => {
        persistState(state);
      }, 500)();
    }
  },
};

// =============================================================================
// SESSION MANAGEMENT MIDDLEWARE
// =============================================================================

export const sessionMiddleware: Middleware = {
  name: "session",
  middleware: (action: RootAction, state: RootState, next) => {
    // Check for session expiration before processing action
    if (state.auth.isAuthenticated && state.auth.lastActivity) {
      const now = Date.now();
      const timeSinceLastActivity = now - state.auth.lastActivity;

      if (timeSinceLastActivity > state.auth.sessionTimeout) {
        // Session expired, dispatch session expired action
        next({ type: "SESSION_EXPIRED" });
        return;
      }
    }

    next(action);

    // Update activity timestamp for user actions
    const userActions = [
      "ADD_TO_CART",
      "REMOVE_FROM_CART",
      "UPDATE_QUANTITY",
      "TOGGLE_FAVORITE",
      "SET_FILTERS",
      "PRODUCTS_SUCCESS",
      "ORDERS_SUCCESS",
    ];

    if (userActions.includes(action.type) && state.auth.isAuthenticated) {
      next({ type: "UPDATE_ACTIVITY" });
    }
  },
};

// =============================================================================
// ANALYTICS MIDDLEWARE
// =============================================================================

export const analyticsMiddleware: Middleware = {
  name: "analytics",
  middleware: (action: RootAction, state: RootState, next) => {
    next(action);

    // Track important user actions
    const trackableActions = {
      ADD_TO_CART: (action: any) => ({
        event: "add_to_cart",
        product_id: action.payload.product.id,
        product_name: action.payload.product.name,
        quantity: action.payload.quantity,
        value: action.payload.product.sellPrice * action.payload.quantity,
      }),
      REMOVE_FROM_CART: () => ({
        event: "remove_from_cart",
      }),
      AUTH_SUCCESS: () => ({
        event: "login",
      }),
      LOGOUT: () => ({
        event: "logout",
      }),
      TOGGLE_FAVORITE: (action: any) => ({
        event: "toggle_favorite",
        product_id: action.payload.productId,
      }),
      APPLY_COUPON: (action: any) => ({
        event: "apply_coupon",
        coupon_code: action.payload.couponCode,
      }),
    };

    const trackingData =
      trackableActions[action.type as keyof typeof trackableActions];

    if (trackingData && typeof window !== "undefined") {
      const eventData =
        typeof trackingData === "function"
          ? trackingData(action)
          : trackingData;

      // Send to analytics service (Google Analytics, Mixpanel, etc.)
      if (window.gtag) {
        window.gtag("event", eventData.event, {
          custom_parameters: eventData,
        });
      }

      // Debug logging in development
      if (process.env.NODE_ENV === "development") {
        console.log("📊 Analytics Event:", eventData);
      }
    }
  },
};

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

export const errorHandlingMiddleware: Middleware = {
  name: "errorHandling",
  middleware: (action: RootAction, state: RootState, next) => {
    try {
      next(action);
    } catch (error) {
      console.error("State update error:", error);

      // Log error to monitoring service
      if (typeof window !== "undefined" && window.Sentry) {
        window.Sentry.captureException(error, {
          tags: {
            action: action.type,
            state_module: "reducer",
          },
          extra: {
            action,
            state: sanitizeStateForLogging(state),
          },
        });
      }

      // Show user-friendly error message
      next({
        type: "ADD_TOAST",
        payload: {
          toast: {
            type: "error",
            title: "Something went wrong",
            message:
              "Please try again. If the problem persists, contact support.",
            duration: 5000,
          },
        },
      });
    }
  },
};

// =============================================================================
// CART SYNC MIDDLEWARE
// =============================================================================

export const cartSyncMiddleware: Middleware = {
  name: "cartSync",
  middleware: (action: RootAction, state: RootState, next) => {
    next(action);

    // Sync cart with server after cart changes
    const cartActions = [
      "ADD_TO_CART",
      "REMOVE_FROM_CART",
      "UPDATE_QUANTITY",
      "CLEAR_CART",
      "APPLY_COUPON",
      "REMOVE_COUPON",
    ];

    if (cartActions.includes(action.type) && state.auth.isAuthenticated) {
      // Debounce server sync
      debounce(() => {
        syncCartWithServer(state.cart);
      }, 1000)();
    }
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Debounce function
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Persist state to localStorage
function persistState(state: RootState) {
  try {
    const persistableState = {
      auth: {
        user: state.auth.user,
        isAuthenticated: state.auth.isAuthenticated,
        tokens: state.auth.tokens,
      },
      cart: state.cart,
      products: {
        favorites: state.products.favorites,
        recentlyViewed: state.products.recentlyViewed,
        searchHistory: state.products.searchHistory,
        viewMode: state.products.viewMode,
      },
      ui: {
        theme: state.ui.theme,
      },
    };

    localStorage.setItem("app_state", JSON.stringify(persistableState));
  } catch (error) {
    console.warn("Failed to persist state:", error);
  }
}

// Hydrate state from localStorage
export function hydrateState(): Partial<RootState> | null {
  try {
    const persistedState = localStorage.getItem("app_state");
    if (persistedState) {
      return JSON.parse(persistedState);
    }
  } catch (error) {
    console.warn("Failed to hydrate state:", error);
  }
  return null;
}

// Sanitize state for logging (remove sensitive data)
function sanitizeStateForLogging(state: RootState) {
  return {
    ...state,
    auth: {
      ...state.auth,
      tokens: "***",
      user: state.auth.user ? { ...state.auth.user, email: "***" } : null,
    },
  };
}

// Sync cart with server
async function syncCartWithServer(cartState: RootState["cart"]) {
  try {
    if (typeof window === "undefined") return;

    const response = await fetch("/api/cart/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cartState.items,
        appliedCoupons: cartState.appliedCoupons,
      }),
    });

    if (!response.ok) {
      throw new Error("Cart sync failed");
    }
  } catch (error) {
    console.warn("Failed to sync cart with server:", error);
  }
}

// =============================================================================
// DEFAULT MIDDLEWARE STACK
// =============================================================================

export const defaultMiddleware: Middleware[] = [
  errorHandlingMiddleware,
  sessionMiddleware,
  loggingMiddleware,
  persistenceMiddleware,
  analyticsMiddleware,
  cartSyncMiddleware,
];

// Middleware for production (without logging)
export const productionMiddleware: Middleware[] = [
  errorHandlingMiddleware,
  sessionMiddleware,
  persistenceMiddleware,
  analyticsMiddleware,
  cartSyncMiddleware,
];
