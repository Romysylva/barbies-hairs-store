/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// API CLIENT
// =============================================================================

import { ApiResponse, ApiError } from "@/types";
import { AppError, createErrorResponse } from "@/lib/errors";

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

type RequestInterceptor = (
  config: RequestConfig
) => Promise<RequestConfig> | RequestConfig;
type ResponseInterceptor = (response: Response) => Promise<Response> | Response;
type ErrorInterceptor = (error: unknown) => Promise<never> | never;

export class ApiClient {
  private baseURL: string;
  private defaultConfig: RequestConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.defaultConfig = {
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    };
  }

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
    return this;
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
    return this;
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
    return this;
  }

  // Build full URL
  private buildURL(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${cleanEndpoint}`;
  }

  // Apply request interceptors
  private async applyRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let finalConfig = { ...config };

    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    return finalConfig;
  }

  // Apply response interceptors
  private async applyResponseInterceptors(
    response: Response
  ): Promise<Response> {
    let finalResponse = response;

    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }

    return finalResponse;
  }

  // Apply error interceptors
  private async applyErrorInterceptors(error: unknown): Promise<never> {
    let finalError = error;

    for (const interceptor of this.errorInterceptors) {
      try {
        await interceptor(finalError);
      } catch (interceptedError) {
        finalError = interceptedError;
      }
    }

    throw finalError;
  }

  // Make HTTP request with timeout
  private async makeRequest(
    url: string,
    config: RequestConfig
  ): Promise<Response> {
    const { timeout = 10000, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError(`Request timeout after ${timeout}ms`, 408);
      }

      throw error;
    }
  }

  // Retry mechanism
  private async requestWithRetry(
    url: string,
    config: RequestConfig
  ): Promise<Response> {
    const { retries = 3, ...requestConfig } = config;
    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.makeRequest(url, requestConfig);
      } catch (error) {
        lastError = error;

        // Don't retry client errors (4xx)
        if (error instanceof AppError && error.statusCode < 500) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Core request method
  private async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    const mergedConfig = { ...this.defaultConfig, ...config };

    try {
      // Apply request interceptors
      const finalConfig = await this.applyRequestInterceptors(mergedConfig);

      // Make request with retry
      let response = await this.requestWithRetry(url, finalConfig);

      // Apply response interceptors
      response = await this.applyResponseInterceptors(response);

      // Parse response
      const data = await this.parseResponse<T>(response);
      return data;
    } catch (error) {
      // Apply error interceptors
      await this.applyErrorInterceptors(error);
      throw error; // This line should never be reached
    }
  }

  // Parse response based on content type
  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorData: any;

      if (contentType?.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }

      throw new AppError(
        errorData.message || `HTTP ${response.status}`,
        response.status
      );
    }

    if (contentType?.includes("application/json")) {
      return await response.json();
    }

    // For non-JSON responses, wrap in ApiResponse format
    const text = await response.text();
    return {
      data: text as T,
      message: "Success",
      success: true,
      status: response.status,
    };
  }

  // HTTP Methods
  async get<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  // File upload method
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    config?: Omit<RequestConfig, "headers">
  ): Promise<ApiResponse<T>> {
    // Don't set Content-Type for FormData, let the browser set it
    const uploadConfig: RequestConfig = { ...config };
    if (uploadConfig.headers) {
      delete uploadConfig.headers["Content-Type"];
    }

    return this.request<T>(endpoint, {
      ...uploadConfig,
      method: "POST",
      body: formData,
    });
  }
}

// Create default API client instance
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000,
  retries: 3,
});

// Add default interceptors
apiClient.addRequestInterceptor(async (config) => {
  // Add authentication token if available
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

apiClient.addResponseInterceptor((response) => {
  // Log successful responses in development
  if (process.env.NODE_ENV === "development") {
    console.log("API Response:", {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
    });
  }

  return response;
});

apiClient.addErrorInterceptor((error) => {
  // Log errors in development
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", error);
  }

  // Handle token expiration
  if (error instanceof AppError && error.statusCode === 401) {
    // Clear stored token
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }

    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  throw error;
});

export default apiClient;
