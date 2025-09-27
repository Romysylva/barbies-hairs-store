// import apiClient from "../lib/apiClient";
// import { User, LoginCredentials, AuthResponse } from "../types/User";

// export class AuthService {
//   private static readonly USER_KEY = "barbies_auth_user";

//   /** Login */
//   static async login(credentials: LoginCredentials): Promise<AuthResponse> {
//     try {
//       const { data } = await apiClient.post("/auths/login", credentials, {
//         withCredentials: true,
//       });

//       if (data?.success && data?.user) {
//         this.setUser(data.user);
//         return { success: true, user: data.user };
//       }
//       return { success: false, error: data.message || "Login failed" };
//     } catch (error: any) {
//       return {
//         success: false,
//         error: error.response?.data?.message || "Network error",
//       };
//     }
//   }

//   /** Refresh user from server */
//   static async refreshUser(): Promise<User | null> {
//     try {
//       const { data } = await apiClient.get("/auths/me", {
//         withCredentials: true,
//       });
//       if (data?.user) {
//         this.setUser(data.user);
//         return data.user;
//       }
//       return null;
//     } catch {
//       return null;
//     }
//   }

//   /** Logout */
//   static async logout(): Promise<void> {
//     try {
//       await apiClient.post("/auths/logout", {}, { withCredentials: true });
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       this.clearUser();
//     }
//   }

//   /** Storage helpers */
//   static getCurrentUser(): User | null {
//     if (typeof window === "undefined") return null;
//     const userStr = localStorage.getItem(this.USER_KEY);
//     return userStr ? JSON.parse(userStr) : null;
//   }

//   private static setUser(user: User): void {
//     if (typeof window !== "undefined") {
//       localStorage.setItem(this.USER_KEY, JSON.stringify(user));
//     }
//   }

//   private static clearUser(): void {
//     if (typeof window !== "undefined") {
//       localStorage.removeItem(this.USER_KEY);
//     }
//   }

//   static isAuthenticated(): boolean {
//     return this.getCurrentUser() !== null;
//   }
// }

// export default AuthService;

import apiClient from "../lib/apiClient"; // <- your axios instance with interceptors
import { User, LoginCredentials, AuthResponse } from "../types/User";

export class AuthService {
  private static readonly TOKEN_KEY = "barbies_auth_token";
  private static readonly REFRESH_TOKEN_KEY = "barbies_refresh_token";
  private static readonly USER_KEY = "barbies_auth_user";

  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/barbies/v1";

  /*** Demo users for development ***/
  private static readonly DEMO_USERS: Record<string, User> = {
    "admin@barbies.com": {
      _id: "admin_1",
      name: "Admin User",
      email: "admin@barbies.com",
      role: "admin",
      active: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    "manager@barbies.com": {
      _id: "manager_1",
      name: "Manager User",
      email: "manager@barbies.com",
      role: "manager",
      active: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    "user@barbies.com": {
      _id: "user_1",
      name: "Regular User",
      email: "user@barbies.com",
      role: "user",
      active: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  };

  private static readonly DEMO_PASSWORDS: Record<string, string> = {
    "admin@barbies.com": "admin123",
    "manager@barbies.com": "manager123",
    "user@barbies.com": "user123",
  };

  /**
   * Login
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (process.env.NODE_ENV === "development") {
        return this.demoLogin(credentials);
      }

      const { data } = await apiClient.post(
        `${this.API_BASE_URL}/auths/login`,
        credentials,
        { withCredentials: true }
      );

      if (data?.success && data?.user) {
        this.setToken(data.token);
        this.setRefreshToken(data.refreshToken);
        this.setUser(data.user);
        return { success: true, user: data.user, token: data.token };
      }

      return { success: false, error: data.message || "Login failed" };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Network error. Please try again.",
      };
    }
  }

  /** Demo login for local development */
  private static demoLogin(credentials: LoginCredentials): AuthResponse {
    const { email, password } = credentials;

    if (!this.DEMO_USERS[email] || this.DEMO_PASSWORDS[email] !== password) {
      return { success: false, error: "Invalid email or password" };
    }

    const user = this.DEMO_USERS[email];
    const token = `demo_token_${user._id}_${Date.now()}`;
    const refreshToken = `demo_refresh_${user._id}_${Date.now()}`;

    this.setToken(token);
    this.setRefreshToken(refreshToken);
    this.setUser(user);

    return { success: true, user, token };
  }

  /**
   * Refresh JWT
   */
  static async refreshToken(): Promise<AuthResponse | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;

      if (process.env.NODE_ENV === "development") {
        const user = this.getCurrentUser();
        if (!user) return null;
        const newToken = `demo_token_${user._id}_${Date.now()}`;
        this.setToken(newToken);
        return { success: true, user, token: newToken };
      }

      const { data } = await apiClient.post(
        `${this.API_BASE_URL}/auths/refresh-token`,
        { refreshToken },
        { withCredentials: true }
      );

      if (data?.success && data?.user) {
        this.setToken(data.token);
        if (data.refreshToken) this.setRefreshToken(data.refreshToken);
        this.setUser(data.user);
        return { success: true, user: data.user, token: data.token };
      }

      return null;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    try {
      if (process.env.NODE_ENV === "development") {
        this.clearAuth();
        return;
      }

      const token = this.getToken();
      if (token) {
        await apiClient.post(
          `${this.API_BASE_URL}/auths/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Verify token
   */
  static async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      if (process.env.NODE_ENV === "development") return true;

      const res = await apiClient.get(`${this.API_BASE_URL}/auths/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return res.status === 200;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }

  /**
   * Refresh user details
   */
  static async refreshUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      if (process.env.NODE_ENV === "development") {
        return this.getCurrentUser();
      }

      const { data } = await apiClient.get(`${this.API_BASE_URL}/auths/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (data?.user) {
        this.setUser(data.user);
        return data.user;
      }

      return null;
    } catch (error) {
      console.error("User refresh error:", error);
      return null;
    }
  }

  /*** Storage helpers ***/
  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private static setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  private static setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private static clearAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getToken() !== null;
  }

  static getDemoCredentials() {
    return [
      { email: "admin@barbies.com", password: "admin123", role: "admin" },
      { email: "manager@barbies.com", password: "manager123", role: "manager" },
      { email: "user@barbies.com", password: "user123", role: "user" },
    ];
  }
}

export default AuthService;
