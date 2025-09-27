"use client";
import { useState, useEffect, useCallback } from "react";
import AuthService from "../services/AuthService";
import { User, LoginCredentials, AuthResponse } from "../types/User";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);

        // Check if user is already authenticated
        const currentUser = AuthService.getCurrentUser();
        const token = AuthService.getToken();

        if (currentUser && token) {
          // Verify token is still valid
          const isValid = await AuthService.verifyToken();
          if (isValid) {
            setUser(currentUser);
          } else {
            // Token is invalid, clear auth data
            await AuthService.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response: AuthResponse = await AuthService.login(credentials);

        if (response.success && response.user) {
          setUser(response.user);
          return true;
        } else {
          setError(response.error || "Login failed");
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const refreshedUser = await AuthService.refreshUser();
      setUser(refreshedUser);
    } catch (err) {
      console.error("User refresh error:", err);
    }
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    logout,
    clearError,
    refreshUser,
  };
};

export default useAuth;
