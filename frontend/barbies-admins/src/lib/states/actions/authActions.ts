/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// AUTHENTICATION ACTIONS
// =============================================================================

import { RootAction, AuthActions } from "../types";
import { apiClient } from "@/lib/api/client";
import type { User } from "@/types";

export function createAuthActions(
  dispatch: (action: RootAction) => void
): AuthActions {
  return {
    // Login user
    async login(credentials: { email: string; password: string }) {
      try {
        dispatch({ type: "AUTH_REQUEST" });

        const response = await apiClient.post("/auth/login", credentials);

        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user: response.data.user,
            tokens: response.data.tokens,
          },
        });

        // Show success toast
        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "success",
              title: "Welcome back!",
              message: `Hello ${response.data.user.customerName}`,
              duration: 3000,
            },
          },
        });
      } catch (error: any) {
        const errorMessage =
          error.message || "Login failed. Please check your credentials.";

        dispatch({
          type: "AUTH_FAILURE",
          payload: { error: errorMessage },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Login Failed",
              message: errorMessage,
              duration: 5000,
            },
          },
        });

        throw error;
      }
    },

    // Register new user
    async register(data: { name: string; email: string; password: string }) {
      try {
        dispatch({ type: "AUTH_REQUEST" });

        const response = await apiClient.post("/auth/register", data);

        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user: response.data.user,
            tokens: response.data.tokens,
          },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "success",
              title: "Account Created!",
              message: "Welcome to our store!",
              duration: 3000,
            },
          },
        });
      } catch (error: any) {
        const errorMessage =
          error.message || "Registration failed. Please try again.";

        dispatch({
          type: "AUTH_FAILURE",
          payload: { error: errorMessage },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Registration Failed",
              message: errorMessage,
              duration: 5000,
            },
          },
        });

        throw error;
      }
    },

    // Logout user
    logout() {
      try {
        // Call logout API if needed
        apiClient.post("/auth/logout").catch(() => {
          // Ignore logout API errors - we'll clear local state anyway
        });

        dispatch({ type: "LOGOUT" });

        // Clear cart for security
        dispatch({ type: "CLEAR_CART" });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "info",
              message: "You have been logged out successfully.",
              duration: 3000,
            },
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
        // Still dispatch logout even if API call fails
        dispatch({ type: "LOGOUT" });
      }
    },

    // Refresh authentication token
    async refreshToken() {
      try {
        const response = await apiClient.post("/auth/refresh");

        dispatch({
          type: "REFRESH_TOKEN_SUCCESS",
          payload: { tokens: response.data.tokens },
        });
      } catch (error: any) {
        // If refresh fails, logout user
        dispatch({ type: "SESSION_EXPIRED" });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "warning",
              title: "Session Expired",
              message: "Please log in again to continue.",
              duration: 5000,
            },
          },
        });

        throw error;
      }
    },

    // Update user profile
    async updateProfile(data: Partial<User>) {
      try {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "updateProfile", isLoading: true },
        });

        const response = await apiClient.put("/auth/profile", data);

        dispatch({
          type: "UPDATE_USER",
          payload: { user: response.data.user },
        });

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "success",
              title: "Profile Updated",
              message: "Your profile has been updated successfully.",
              duration: 3000,
            },
          },
        });
      } catch (error: any) {
        const errorMessage =
          error.message || "Failed to update profile. Please try again.";

        dispatch({
          type: "ADD_TOAST",
          payload: {
            toast: {
              type: "error",
              title: "Update Failed",
              message: errorMessage,
              duration: 5000,
            },
          },
        });

        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "updateProfile", isLoading: false },
        });
      }
    },

    // Update last activity timestamp
    updateActivity() {
      dispatch({ type: "UPDATE_ACTIVITY" });
    },
  };
}
