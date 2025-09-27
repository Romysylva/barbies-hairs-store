// "use client";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
//   useCallback,
// } from "react";
// import { User, LoginCredentials } from "../types/User";
// import { AuthService } from "../services/AuthService";

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   isAuthenticated: boolean;
//   login: (
//     credentials: LoginCredentials
//   ) => Promise<{ success: boolean; error?: string }>;
//   logout: () => Promise<void>;
//   refreshUser: () => Promise<void>;
//   hasRole: (role: string) => boolean;
//   hasAnyRole: (roles: string[]) => boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Initialize auth state on mount
//   useEffect(() => {
//     initializeAuth();
//   }, []);

//   const initializeAuth = useCallback(async () => {
//     try {
//       setLoading(true);

//       // Check if user is already authenticated
//       const currentUser = AuthService.getCurrentUser();
//       if (currentUser) {
//         // Verify token is still valid
//         const isValid = await AuthService.verifyToken();
//         if (isValid) {
//           setUser(currentUser);
//           console.log("Auth: User session restored", currentUser);
//         } else {
//           // Token is invalid, clear auth
//           await AuthService.logout();
//           setUser(null);
//           console.log("Auth: Invalid token, cleared session");
//         }
//       } else {
//         console.log("Auth: No existing session found");
//       }
//     } catch (error) {
//       console.error("Auth: Error initializing auth:", error);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const login = useCallback(async (credentials: LoginCredentials) => {
//     try {
//       setLoading(true);
//       console.log("Auth: Attempting login for", credentials.email);

//       const response = await AuthService.login(credentials);

//       if (response.success && response.user) {
//         setUser(response.user);
//         console.log("Auth: Login successful", response.user);
//         return { success: true };
//       } else {
//         console.log("Auth: Login failed", response.error);
//         return { success: false, error: response.error || "Login failed" };
//       }
//     } catch (error: any) {
//       console.error("Auth: Login error:", error);
//       return {
//         success: false,
//         error: error.message || "Network error occurred",
//       };
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const logout = useCallback(async () => {
//     try {
//       setLoading(true);
//       console.log("Auth: Logging out user", user?.email);

//       await AuthService.logout();
//       setUser(null);
//       console.log("Auth: Logout successful");
//     } catch (error) {
//       console.error("Auth: Error during logout:", error);
//       // Clear user state even if logout fails
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, [user?.email]);

//   const refreshUser = useCallback(async () => {
//     try {
//       console.log("Auth: Refreshing user data");
//       const refreshedUser = await AuthService.refreshUser();

//       if (refreshedUser) {
//         setUser(refreshedUser);
//         console.log("Auth: User data refreshed", refreshedUser);
//       } else {
//         // If refresh fails, clear auth
//         setUser(null);
//         console.log("Auth: User refresh failed, clearing session");
//       }
//     } catch (error) {
//       console.error("Auth: Error refreshing user:", error);
//       setUser(null);
//     }
//   }, []);

//   const hasRole = useCallback(
//     (role: string) => {
//       return user?.role === role;
//     },
//     [user]
//   );

//   const hasAnyRole = useCallback(
//     (roles: string[]) => {
//       return user ? roles.includes(user.role) : false;
//     },
//     [user]
//   );

//   const isAuthenticated = !!user;

//   const contextValue: AuthContextType = {
//     user,
//     loading,
//     isAuthenticated,
//     login,
//     logout,
//     refreshUser,
//     hasRole,
//     hasAnyRole,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export default AuthProvider;

// "use client";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
//   useCallback,
// } from "react";
// import { User, LoginCredentials } from "../types/User";
// import { AuthService } from "../services/AuthService";

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   isAuthenticated: boolean;
//   login: (
//     credentials: LoginCredentials
//   ) => Promise<{ success: boolean; error?: string }>;
//   logout: () => Promise<void>;
//   refreshUser: () => Promise<void>;
//   hasRole: (role: string) => boolean;
//   hasAnyRole: (roles: string[]) => boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     initializeAuth();
//     // auto-refresh tokens every 10 mins (or based on expiry)
//     const interval = setInterval(
//       () => {
//         handleTokenRefresh();
//       },
//       10 * 60 * 1000
//     );
//     return () => clearInterval(interval);
//   }, []);

//   const initializeAuth = useCallback(async () => {
//     try {
//       setLoading(true);

//       const currentUser = AuthService.getCurrentUser();
//       if (currentUser) {
//         const isValid = await AuthService.verifyToken();
//         if (isValid) {
//           setUser(currentUser);
//           console.log("Auth: User session restored", currentUser);
//         } else {
//           console.log("Auth: Access token expired, attempting refresh");
//           const refreshed = await handleTokenRefresh();
//           if (!refreshed) {
//             await AuthService.logout();
//             setUser(null);
//           }
//         }
//       } else {
//         console.log("Auth: No existing session found");
//       }
//     } catch (error) {
//       console.error("Auth: Error initializing auth:", error);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const login = useCallback(async (credentials: LoginCredentials) => {
//     try {
//       setLoading(true);
//       const response = await AuthService.login(credentials);

//       if (response.success && response.user) {
//         setUser(response.user);
//         return { success: true };
//       } else {
//         return { success: false, error: response.error || "Login failed" };
//       }
//     } catch (error: any) {
//       return {
//         success: false,
//         error: error.message || "Network error occurred",
//       };
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const logout = useCallback(async () => {
//     try {
//       setLoading(true);
//       await AuthService.logout();
//       setUser(null);
//     } catch (error) {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const refreshUser = useCallback(async () => {
//     try {
//       const refreshedUser = await AuthService.refreshUser();
//       if (refreshedUser) {
//         setUser(refreshedUser);
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       setUser(null);
//     }
//   }, []);

//   const handleTokenRefresh = useCallback(async (): Promise<boolean> => {
//     try {
//       const refreshed = await AuthService.refreshToken();
//       if (refreshed?.user) {
//         setUser(refreshed.user);
//         console.log("Auth: Token refreshed");
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error("Auth: Refresh token failed", error);
//       return false;
//     }
//   }, []);

//   const hasRole = useCallback((role: string) => user?.role === role, [user]);

//   const hasAnyRole = useCallback(
//     (roles: string[]) => (user ? roles.includes(user.role) : false),
//     [user]
//   );

//   const isAuthenticated = !!user;

//   const contextValue: AuthContextType = {
//     user,
//     loading,
//     isAuthenticated,
//     login,
//     logout,
//     refreshUser,
//     hasRole,
//     hasAnyRole,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// "use client";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
//   useCallback,
// } from "react";
// import { User, LoginCredentials } from "../types/User";
// import AuthService from "../services/AuthService";

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   isAuthenticated: boolean;
//   login: (
//     credentials: LoginCredentials
//   ) => Promise<{ success: boolean; error?: string }>;
//   logout: () => Promise<void>;
//   refreshUser: () => Promise<void>;
//   hasRole: (role: string) => boolean;
//   hasAnyRole: (roles: string[]) => boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     initializeAuth();
//   }, []);

//   const initializeAuth = useCallback(async () => {
//     try {
//       setLoading(true);

//       const currentUser = AuthService.getCurrentUser();
//       if (currentUser) {
//         const isValid = await AuthService.verifyToken();
//         if (isValid) {
//           setUser(currentUser);
//           console.log("Auth: User session restored", currentUser);
//         } else {
//           console.log(
//             "Auth: Token expired — waiting for axios interceptor to refresh"
//           );
//           // do NOT call refresh manually here — let apiClient handle it
//           setUser(null);
//         }
//       } else {
//         console.log("Auth: No existing session found");
//         setUser(null);
//       }
//     } catch (error) {
//       console.error("Auth: Error initializing auth:", error);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const login = useCallback(async (credentials: LoginCredentials) => {
//     try {
//       setLoading(true);
//       const response = await AuthService.login(credentials);

//       if (response.success && response.user) {
//         setUser(response.user);
//         return { success: true };
//       } else {
//         return { success: false, error: response.error || "Login failed" };
//       }
//     } catch (error: any) {
//       return {
//         success: false,
//         error: error.message || "Network error occurred",
//       };
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const logout = useCallback(async () => {
//     try {
//       setLoading(true);
//       await AuthService.logout();
//       setUser(null);
//     } catch (error) {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const refreshUser = useCallback(async () => {
//     try {
//       const refreshedUser = await AuthService.refreshUser();
//       if (refreshedUser) {
//         setUser(refreshedUser);
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       setUser(null);
//     }
//   }, []);

//   const hasRole = useCallback((role: string) => user?.role === role, [user]);

//   const hasAnyRole = useCallback(
//     (roles: string[]) => (user ? roles.includes(user.role) : false),
//     [user]
//   );

//   const isAuthenticated = !!user;

//   const contextValue: AuthContextType = {
//     user,
//     loading,
//     isAuthenticated,
//     login,
//     logout,
//     refreshUser,
//     hasRole,
//     hasAnyRole,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// Fixed AuthContext.tsx - Better State Management
"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User, LoginCredentials } from "../types/User";
import AuthService from "../services/AuthService";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  clearError: () => void;
}

// Auth Reducer with better state management
type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  refreshing: boolean;
};

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "LOGOUT" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        error: null,
        loading: false,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "SET_INITIALIZED":
      return { ...state, initialized: action.payload };

    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        error: null,
        loading: false,
        refreshing: false,
      };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        error: null,
        loading: false,
      };

    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  initialized: false,
  refreshing: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Handle auth failures from interceptor
  useEffect(() => {
    const handleAuthFailure = () => {
      console.log("Auth failure event received");
      dispatch({ type: "LOGOUT" });
    };

    window.addEventListener("auth-failure", handleAuthFailure);
    return () => window.removeEventListener("auth-failure", handleAuthFailure);
  }, []);

  // Initialize auth state only once
  useEffect(() => {
    if (!state.initialized) {
      initializeAuth();
    }
  }, [state.initialized]);

  const initializeAuth = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const currentUser = AuthService.getCurrentUser();
      const token = AuthService.getToken();

      if (currentUser && token) {
        // Verify token validity
        const isValid = await AuthService.verifyToken();

        if (isValid) {
          dispatch({ type: "SET_USER", payload: currentUser });
          console.log("Auth: User session restored", currentUser);
        } else {
          console.log("Auth: Token invalid, clearing session");
          await AuthService.logout();
          dispatch({ type: "SET_USER", payload: null });
        }
      } else {
        console.log("Auth: No existing session found");
        dispatch({ type: "SET_USER", payload: null });
      }
    } catch (error) {
      console.error("Auth: Error initializing auth:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to initialize authentication",
      });
      dispatch({ type: "SET_USER", payload: null });
    } finally {
      dispatch({ type: "SET_INITIALIZED", payload: true });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // const initializeAuth = useCallback(async () => {
  //   try {
  //     dispatch({ type: "SET_LOADING", payload: true });

  //     const currentUser = AuthService.getCurrentUser();
  //     if (currentUser) {
  //       // Verify on server
  //       const refreshedUser = await AuthService.refreshUser();
  //       if (refreshedUser) {
  //         dispatch({ type: "SET_USER", payload: refreshedUser });
  //       } else {
  //         await AuthService.logout();
  //         dispatch({ type: "SET_USER", payload: null });
  //       }
  //     } else {
  //       dispatch({ type: "SET_USER", payload: null });
  //     }
  //   } catch (error) {
  //     dispatch({ type: "SET_ERROR", payload: "Failed to init auth" });
  //   } finally {
  //     dispatch({ type: "SET_INITIALIZED", payload: true });
  //     dispatch({ type: "SET_LOADING", payload: false });
  //   }
  // }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      console.log("Auth: Attempting login for", credentials.email);

      const response = await AuthService.login(credentials);

      if (response.success && response.user) {
        dispatch({ type: "LOGIN_SUCCESS", payload: response.user });
        console.log("Auth: Login successful", response.user);
        return { success: true };
      } else {
        const errorMsg = response.error || "Login failed";
        dispatch({ type: "LOGIN_FAILURE", payload: errorMsg });
        console.log("Auth: Login failed", errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      console.error("Auth: Login error:", error);
      const errorMsg = error.message || "Network error occurred";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      console.log("Auth: Logging out user", state.user?.email);

      await AuthService.logout();
      dispatch({ type: "LOGOUT" });
      console.log("Auth: Logout successful");
    } catch (error) {
      console.error("Auth: Error during logout:", error);
      // Clear user state even if logout fails
      dispatch({ type: "LOGOUT" });
    }
  }, [state.user?.email]);

  const refreshUser = useCallback(async () => {
    // Prevent concurrent refresh operations
    if (state.refreshing) {
      console.log("Auth: Refresh already in progress, skipping");
      return;
    }

    try {
      dispatch({ type: "SET_REFRESHING", payload: true });
      console.log("Auth: Refreshing user data");

      const refreshedUser = await AuthService.refreshUser();

      if (refreshedUser) {
        dispatch({ type: "SET_USER", payload: refreshedUser });
        console.log("Auth: User data refreshed", refreshedUser);
      } else {
        console.log("Auth: User refresh failed, clearing session");
        dispatch({ type: "LOGOUT" });
      }
    } catch (error) {
      console.error("Auth: Error refreshing user:", error);
      dispatch({ type: "LOGOUT" });
    } finally {
      dispatch({ type: "SET_REFRESHING", payload: false });
    }
  }, [state.refreshing]);

  const hasRole = useCallback(
    (role: string) => state.user?.role === role,
    [state.user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]) => (state.user ? roles.includes(state.user.role) : false),
    [state.user]
  );

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const isAuthenticated = !!state.user && state.initialized;

  const contextValue: AuthContextType = {
    user: state.user,
    loading: state.loading,
    isAuthenticated,
    error: state.error,
    login,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
