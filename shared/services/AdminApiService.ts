import AuthService from "./AuthService";
import { User } from "../types/User";

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingBookings: number;
  activeChats: number;
  securityAlerts: number;
  systemHealth: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentActivities: Array<{
    timestamp: string;
    id: string;
    type: string;
    message: string;
    time: string;
    status: string;
  }>;
}

export interface Order {
  _id: string;
  user: User | string;
  items: Array<{
    product: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
  status: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deliveryTracking: Array<{
    status: string;
    updatedAt: Date;
    note: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  user: User | string;
  product: any;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  priceDiscount?: number;
  discountPercent?: number;
  category: string;
  subcategory: string;
  imageCover: string;
  photos: string[];
  stock: number;
  salesCount: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  user: User | string;
  action: string;
  type: string;
  description: string;
  details: any;
  severity: "low" | "medium" | "high" | "critical";
  status: "success" | "warning" | "error" | "info";
  timestamp: string;
  createdAt: string;
}

export class AdminApiService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/barbies/v1";

  /**
   * Make authenticated API request
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = AuthService.getToken();

      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error: any) {
      console.error(`API Error for ${endpoint}:`, error);
      return {
        success: false,
        error: error.message || "Network error occurred",
      };
    }
  }

  // ===== DASHBOARD APIS =====

  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      // Get basic stats
      const statsResponse = await this.makeRequest<any>("/admin/stats");

      // Get analytics data for additional metrics
      const analyticsResponse = await this.makeRequest<any>(
        "/analytics/dashboard/metrics?period=30d"
      );

      // Get top products
      const topProductsResponse = await this.makeRequest<any>(
        "/admin/system-setting/top-booked-products"
      );

      // Get recent activity logs
      const activityResponse = await this.makeRequest<ActivityLog[]>(
        "/admin/activity-logs"
      );

      if (statsResponse.success && analyticsResponse.success) {
        const stats = statsResponse.stats || {};
        const analytics = analyticsResponse.data || {};
        const topProducts = topProductsResponse.topProducts || [];
        const activities = activityResponse.data || [];

        // Transform data to match DashboardStats interface
        const dashboardStats: DashboardStats = {
          totalRevenue: analytics.overview?.totalRevenue || 0,
          totalOrders:
            analytics.overview?.totalOrders || stats.ordersCount || 0,
          totalCustomers: stats.usersCount || 0,
          totalProducts: stats.productsCount || 0,
          pendingBookings: stats.bookingsCount || 0,
          activeChats: 0, // This would come from a chat service
          securityAlerts:
            activities.filter((a: ActivityLog) => a.type === "security_alert")
              .length || 0,
          systemHealth: 98.5, // This would come from system monitoring
          revenueGrowth: analytics.trends?.revenueGrowth || 0,
          ordersGrowth: analytics.trends?.orderGrowth || 0,
          customersGrowth: 0, // Would be calculated from customer analytics
          topProducts: topProducts.map((p: any) => ({
            name: p.name || "",
            sales: p.totalBookings || 0,
            revenue: p.totalRevenue || 0,
          })),
          recentActivities: activities
            .slice(0, 10)
            .map((activity: ActivityLog) => ({
              id: activity._id,
              type: activity.type,
              message: activity.description || activity.action,
              time: this.formatTimeAgo(
                activity.timestamp || activity.createdAt
              ),
              status: activity.status,
            })),
        };

        return {
          success: true,
          data: dashboardStats,
        };
      } else {
        return {
          success: false,
          error:
            statsResponse.error ||
            analyticsResponse.error ||
            "Failed to fetch dashboard data",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch dashboard statistics",
      };
    }
  }

  // ===== USER MANAGEMENT APIS =====

  static async getAllUsers(
    page = 1,
    limit = 10,
    search?: string
  ): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    return this.makeRequest<User[]>(`/users?${params}`);
  }

  static async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`/users/${id}`);
  }

  static async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest<User>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  static async updateUser(
    id: string,
    userData: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  }

  static async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  // ===== BOOKING MANAGEMENT APIS =====

  static async getAllBookings(
    page = 1,
    limit = 10,
    filters?: any
  ): Promise<ApiResponse<Booking[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return this.makeRequest<Booking[]>(`/bookings?${params}`);
  }

  static async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    return this.makeRequest<Booking>(`/bookings/${id}`);
  }

  static async updateBooking(
    id: string,
    bookingData: Partial<Booking>
  ): Promise<ApiResponse<Booking>> {
    return this.makeRequest<Booking>(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(bookingData),
    });
  }

  static async deleteBooking(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/bookings/${id}`, {
      method: "DELETE",
    });
  }

  // ===== ORDER MANAGEMENT APIS =====

  static async getAllOrders(
    page = 1,
    limit = 10,
    filters?: any
  ): Promise<ApiResponse<Order[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return this.makeRequest<Order[]>(`/orders?${params}`);
  }

  static async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return this.makeRequest<Order>(`/orders/${id}`);
  }

  static async updateOrderStatus(
    id: string,
    status: string,
    note?: string
  ): Promise<ApiResponse<Order>> {
    return this.makeRequest<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    });
  }

  static async cancelOrder(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/orders/${id}/cancel`, {
      method: "POST",
    });
  }

  static async getOrders(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    dateRange?: string;
  }): Promise<
    ApiResponse<{ orders: Order[]; total: number; totalPages: number }>
  > {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.paymentStatus)
      params.append("paymentStatus", filters.paymentStatus);
    if (filters?.dateRange) params.append("dateRange", filters.dateRange);

    return this.makeRequest<{
      orders: Order[];
      total: number;
      totalPages: number;
    }>(`/orders?${params}`);
  }

  static async createOrder(
    orderData: Partial<Order>
  ): Promise<ApiResponse<Order>> {
    return this.makeRequest<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  static async updateOrder(
    id: string,
    orderData: Partial<Order>
  ): Promise<ApiResponse<Order>> {
    return this.makeRequest<Order>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(orderData),
    });
  }

  // ===== PRODUCT MANAGEMENT APIS =====

  static async getAllProducts(
    page = 1,
    limit = 10,
    filters?: any
  ): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return this.makeRequest<Product[]>(`/products?${params}`);
  }

  static async getProducts(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    active?: boolean;
  }): Promise<
    ApiResponse<{ products: Product[]; total: number; totalPages: number }>
  > {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.minPrice)
      params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters?.active !== undefined)
      params.append("active", filters.active.toString());

    return this.makeRequest<{
      products: Product[];
      total: number;
      totalPages: number;
    }>(`/products?${params}`);
  }

  static async getCategories(): Promise<ApiResponse<{ categories: any[] }>> {
    return this.makeRequest<{ categories: any[] }>("/categories");
  }

  static async getProductById(id: string): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/products/${id}`);
  }

  static async createProduct(
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  static async updateProduct(
    id: string,
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(productData),
    });
  }

  static async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  static async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return this.makeRequest<Product[]>("/products/featured");
  }

  static async getBestsellerProducts(): Promise<ApiResponse<Product[]>> {
    return this.makeRequest<Product[]>("/products/bestsellers");
  }

  // ===== ANALYTICS APIS =====

  static async getDashboardMetrics(period = "30d"): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `/analytics/dashboard/metrics?period=${period}`
    );
  }

  static async getSalesAnalytics(params?: any): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams(params);
    return this.makeRequest<any>(`/analytics/sales?${searchParams}`);
  }

  static async getCustomerAnalytics(params?: any): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams(params);
    return this.makeRequest<any>(`/analytics/customers?${searchParams}`);
  }

  static async getProductAnalytics(params?: any): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams(params);
    return this.makeRequest<any>(`/analytics/products?${searchParams}`);
  }

  static async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>("/analytics/realtime");
  }

  static async getBusinessIntelligenceReport(
    reportType = "executive",
    period = "30d"
  ): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `/analytics/reports/business-intelligence?reportType=${reportType}&period=${period}`
    );
  }

  static async getForecasting(
    metric = "revenue",
    period = "30d"
  ): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `/analytics/forecast?metric=${metric}&period=${period}`
    );
  }

  // ===== ACTIVITY LOGS APIS =====

  static async getActivityLogs(): Promise<ApiResponse<ActivityLog[]>> {
    return this.makeRequest<ActivityLog[]>("/admin/activity-logs");
  }

  // ===== SYSTEM SETTINGS APIS =====

  static async getSystemSettings(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>("/admin/system-settings");
  }

  static async getSystemSetting(key: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/admin/system-settings/${key}`);
  }

  static async updateSystemSetting(
    key: string,
    value: any,
    description?: string
  ): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/admin/system-settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value, description }),
    });
  }

  // ===== UTILITY METHODS =====

  /**
   * Format timestamp to human readable "time ago" format
   */
  private static formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  }

  /**
   * Export data with various formats
   */
  static async exportData(params: {
    type: "products" | "orders" | "users";
    format: "csv" | "excel" | "json";
    filters?: any;
  }): Promise<ApiResponse<string>> {
    try {
      const token = AuthService.getToken();

      const requestBody = {
        type: params.type,
        format: params.format,
        filters: params.filters || {},
      };

      const response = await fetch(`${this.API_BASE_URL}/admin/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Export failed");
      }

      const data = await response.text();
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error("Export error:", error);
      return {
        success: false,
        error: error.message || "Export failed",
      };
    }
  }

  /**
   * Upload file/image
   */
  static async uploadFile(
    file: File,
    type: "product" | "user" = "product"
  ): Promise<ApiResponse<{ filename: string; url: string }>> {
    try {
      const token = AuthService.getToken();
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${this.API_BASE_URL}/upload/${type}`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    }
  }

  /**
   * Batch operations for multiple items
   */
  static async batchUpdate(
    endpoint: string,
    operations: Array<{ id: string; data: any }>
  ): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`${endpoint}/batch`, {
      method: "PATCH",
      body: JSON.stringify({ operations }),
    });
  }

  static async batchDelete(
    endpoint: string,
    ids: string[]
  ): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`${endpoint}/batch`, {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  }

  /**
   * Search across multiple entities
   */
  static async globalSearch(
    query: string,
    entities: string[] = ["users", "orders", "products", "bookings"]
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      q: query,
      entities: entities.join(","),
    });

    return this.makeRequest<any>(`/search?${params}`);
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>("/admin/system-health");
  }

  /**
   * Financial data (if available in backend)
   */
  static async getFinancialData(period = "30d"): Promise<ApiResponse<any>> {
    // This would need to be implemented in your backend
    // For now, we'll calculate from orders
    try {
      const ordersResponse = await this.makeRequest<Order[]>(
        `/orders?limit=1000&period=${period}`
      );

      if (!ordersResponse.success) {
        return ordersResponse;
      }

      const orders = ordersResponse.data || [];
      const completedOrders = orders.filter(
        (order) => order.status === "completed" || order.status === "delivered"
      );

      const totalRevenue = completedOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      const averageOrderValue =
        completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      // Calculate by payment method
      const paymentMethods = completedOrders.reduce((acc: any, order) => {
        const method = order.paymentMethod || "unknown";
        if (!acc[method]) {
          acc[method] = { amount: 0, count: 0 };
        }
        acc[method].amount += order.totalAmount;
        acc[method].count += 1;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          revenue: {
            total: totalRevenue,
            growth: 0, // Would need historical comparison
            averageOrderValue,
          },
          paymentMethods: Object.entries(paymentMethods).map(
            ([method, data]: [string, any]) => ({
              method,
              amount: data.amount,
              percentage: (data.amount / totalRevenue) * 100,
              count: data.count,
            })
          ),
          orders: {
            total: orders.length,
            completed: completedOrders.length,
            pending: orders.filter((o) => o.status === "pending").length,
            cancelled: orders.filter((o) => o.status === "cancelled").length,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch financial data",
      };
    }
  }
}

export default AdminApiService;
