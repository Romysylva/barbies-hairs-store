import { AuthState, AuthAction } from "../types";

// =============================================================================
// AUTH REDUCER
// =============================================================================

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
  lastActivity: null,
  sessionTimeout: 2 * 60 * 60 * 1000, // 2 hours
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_REQUEST":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: action.payload.tokens,
        lastActivity: Date.now(),
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        isAuthenticated: false,
        user: null,
        tokens: {
          accessToken: null,
          refreshToken: null,
        },
      };

    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tokens: {
          accessToken: null,
          refreshToken: null,
        },
        lastActivity: null,
        error: null,
      };

    case "REFRESH_TOKEN_SUCCESS":
      return {
        ...state,
        tokens: action.payload.tokens,
        lastActivity: Date.now(),
        error: null,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload.user } : null,
      };

    case "UPDATE_ACTIVITY":
      return {
        ...state,
        lastActivity: Date.now(),
      };

    case "SESSION_EXPIRED":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tokens: {
          accessToken: null,
          refreshToken: null,
        },
        error: "Session expired. Please log in again.",
      };

    default:
      return state;
  }
}
