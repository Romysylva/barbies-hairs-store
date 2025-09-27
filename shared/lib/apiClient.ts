// import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// const apiClient = axios.create({
//   baseURL:
//     process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/barbies/v1",
//   withCredentials: true, // ✅ Always send cookies
//   timeout: 10000,
// });

// // Request interceptor (no Authorization header needed now, cookies handle auth)
// apiClient.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => config,
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest: any = error.config;

//     // Skip if already retried or hitting auth endpoints
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !["/auths/login", "/auths/refresh-token", "/auths/logout"].some((ep) =>
//         originalRequest?.url?.includes(ep)
//       )
//     ) {
//       originalRequest._retry = true;

//       try {
//         // Call refresh endpoint (cookies included)
//         await apiClient.post(
//           "/auths/refresh-token",
//           {},
//           { withCredentials: true }
//         );

//         // Retry original request
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         console.error("Refresh failed, dispatching auth-failure");
//         window.dispatchEvent(new Event("auth-failure"));
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default apiClient;

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AuthService from "../services/AuthService";

let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;
let lastRefreshAttempt = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refresh attempts

let failedQueue: {
  resolve: (token?: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || "");
    }
  });
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/barbies/v1",
  withCredentials: true,
  timeout: 10000, // Add timeout to prevent hanging requests
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor with Loop Prevention
apiClient.interceptors.response.use(
  (response) => {
    // Reset refresh attempts on successful request
    refreshAttempts = 0;
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Don't retry certain endpoints to prevent loops
    const noRetryEndpoints = [
      "/auths/login",
      "/auths/refresh-token",
      "/auths/logout",
    ];
    const isNoRetryEndpoint = noRetryEndpoints.some((endpoint) =>
      originalRequest?.url?.includes(endpoint)
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isNoRetryEndpoint
    ) {
      // Check cooldown period
      const now = Date.now();
      if (now - lastRefreshAttempt < REFRESH_COOLDOWN) {
        console.log("Refresh cooldown active, rejecting request");
        return Promise.reject(new Error("Authentication refresh in cooldown"));
      }

      // Check max attempts
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.log("Max refresh attempts exceeded, logging out");
        await AuthService.logout();
        processQueue(new Error("Max refresh attempts exceeded"), null);
        // Redirect to login or emit auth failure event
        window.dispatchEvent(new CustomEvent("auth-failure"));
        return Promise.reject(
          new Error("Authentication failed after multiple attempts")
        );
      }

      if (isRefreshing) {
        // Queue the failed request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      lastRefreshAttempt = now;
      refreshAttempts++;

      try {
        console.log(
          `Attempting token refresh (attempt ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS})`
        );

        const refreshed = await AuthService.refreshToken();

        if (refreshed?.success && refreshed?.token) {
          console.log("Token refresh successful");

          // Update default header
          if (apiClient.defaults.headers.common) {
            apiClient.defaults.headers.common["Authorization"] =
              `Bearer ${refreshed.token}`;
          }

          // Process queued requests
          processQueue(null, refreshed.token);

          // Update original request header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${refreshed.token}`;
          }

          return apiClient(originalRequest);
        } else {
          throw new Error("Token refresh failed - no valid token returned");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Process failed queue
        processQueue(refreshError, null);

        // If we've exceeded attempts, logout and redirect
        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          await AuthService.logout();
          window.dispatchEvent(new CustomEvent("auth-failure"));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
