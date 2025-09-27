/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

export interface ApiResponse<T> {
  status: "success" | "fail" | "error";
  data?: T;
  message?: string;
  results?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080/api/barbies/v1",
      timeout: 15000,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - cookies are sent automatically with withCredentials: true
    this.client.interceptors.request.use(
      (config) => {
        // No need to manually set Authorization header - cookies handle auth
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.warn("Unauthorized! Handling...");

          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            // window.location.href = "/login";

            // Only redirect if NOT already on the login page
            if (currentPath !== "/login") {
              window.location.href = "/login";
            }
          }
        }

        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  // Helper method to extract data from response
  private extractData<T>(response: AxiosResponse<ApiResponse<T> | T>): T {
    const responseData = response.data;

    // Check if response follows ApiResponse interface
    if (
      responseData &&
      typeof responseData === "object" &&
      "status" in responseData
    ) {
      const apiResponse = responseData as ApiResponse<T>;

      // Return the nested data if it exists, otherwise return the whole response
      if (apiResponse.data !== undefined) {
        return apiResponse.data;
      }

      // If no nested data, return the response itself (excluding ApiResponse wrapper properties)
      const { status, message, results, ...rest } = apiResponse;
      return rest as T;
    }

    // If response doesn't follow ApiResponse interface, return as-is
    return responseData as T;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T> | T>(url, config);
    return this.extractData<T>(response);
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T> | T>(
      url,
      data,
      config
    );
    return this.extractData<T>(response);
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<ApiResponse<T> | T>(
      url,
      data,
      config
    );
    return this.extractData<T>(response);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T> | T>(url, config);
    return this.extractData<T>(response);
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<ApiResponse<T> | T>(
      url,
      data,
      config
    );
    return this.extractData<T>(response);
  }

  // Raw methods for custom response handling
  async getRaw(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    return this.client.get(url, config);
  }

  async postRaw(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    return this.client.post(url, data, config);
  }

  async putRaw(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    return this.client.put(url, data, config);
  }

  async deleteRaw(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    return this.client.delete(url, config);
  }

  async patchRaw(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    return this.client.patch(url, data, config);
  }

  // Utility methods
  getBaseURL(): string {
    return this.client.defaults.baseURL || "";
  }

  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }

  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }
}

export const apiClientInstance = new ApiClient();
export default apiClientInstance;
