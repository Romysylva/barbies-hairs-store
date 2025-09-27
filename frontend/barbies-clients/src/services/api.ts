/* eslint-disable @typescript-eslint/no-unused-vars */
import apiClient from "../lib/apiClient";
import {
  Product,
  Category,
  Order,
  Review,
  User,
  ApiResponse,
  AuthResponse,
} from "../types";

// Auth Services
// Auth Services
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post<{
      user: User;
    }>("/auths/login", { email, password });

    return response.user; // already unwrapped
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    location: string;
    phone?: string;
    avatar?: File;
    preferences?: {
      theme?: string;
      notification?: boolean;
      language?: string;
    };
  }): Promise<User> => {
    if (userData.avatar) {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      formData.append("passwordConfirm", userData.passwordConfirm);
      formData.append("location", userData.location);
      if (userData.phone) formData.append("phone", userData.phone);
      if (userData.preferences) {
        formData.append("preferences", JSON.stringify(userData.preferences));
      }
      formData.append("file", userData.avatar);

      const response = await apiClient.post<{ user: User }>(
        "/auths/register",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.user;
    } else {
      const requestData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        passwordConfirm: userData.passwordConfirm,
        location: userData.location,
        ...(userData.phone && { phone: userData.phone }),
        ...(userData.preferences && { preferences: userData.preferences }),
      };

      const response = await apiClient.post<{ user: User }>(
        "/auths/register",
        requestData
      );
      return response.user;
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auths/logout");
  },

  getMe: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<{ user: User }>("/users/me");
      return response.user;
    } catch {
      return null;
    }
  },
};

// Product Services
export const productService = {
  getAllProducts: async (params?: {
    category?: string;
    subcategory?: string;
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
  }): Promise<{
    products: Product[];
    totalPages: number;
    currentPage: number;
  }> => {
    const response = await apiClient.get<{
      status: string;
      results: number;
      data: {
        totalPages: number;
        page: number;

        data: Product[];
      };
      totalPages?: number;
      page?: number;
    }>("/products", { params });

    return {
      products: response.data.data || [],
      totalPages: response.data.totalPages || 1,
      currentPage: response.data.page || 1,
    };
  },

  getProduct: async (id: string): Promise<Product | null> => {
    try {
      const response = await apiClient.get<{
        status: string;
        data: { data: Product };
      }>(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await apiClient.getRaw("/products/featured");
    return response.data.items || [];
  },

  getBestsellers: async (): Promise<Product[]> => {
    const response = await apiClient.getRaw("/products/bestsellers");
    return response.data.items || [];
  },

  getNewArrivals: async (): Promise<Product[]> => {
    const response = await apiClient.getRaw("/products/new-arrivals");
    return response.data.items || [];
  },

  getDiscountedProducts: async (): Promise<Product[]> => {
    const response = await apiClient.getRaw("/products/discounts");
    return response.data.items || [];
  },

  getSimilarProducts: async (productId: string): Promise<Product[]> => {
    const response = await apiClient.get<{
      status: string;
      data: { data: Product[] };
    }>(`/products/${productId}/similar`);
    return response.data.data || [];
  },
};

// Category Services
export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.getRaw("/categories");
    return response.data.data || [];
  },

  getCategory: async (id: string): Promise<Category | null> => {
    try {
      const response = await apiClient.get<{
        status: string;
        data: { data: Category };
      }>(`/categories/${id}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },
};

// Order Services
export const orderService = {
  getUserOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<{
      status: string;
      data: { data: Order[] };
    }>("/orders/my-orders");
    return response.data.data || [];
  },

  getOrder: async (id: string): Promise<Order | null> => {
    try {
      const response = await apiClient.get<{
        status: string;
        data: { data: Order };
      }>(`/orders/${id}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  createOrder: async (orderData: {
    items: { product: string; quantity: number; price: number }[];
    totalAmount: number;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: "card" | "paypal" | "cash";
  }): Promise<Order> => {
    const response = await apiClient.post<{
      status: string;
      data: { data: Order };
    }>("/orders", orderData);
    return response.data.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await apiClient.patch<{
      status: string;
      data: { data: Order };
    }>(`/orders/${id}`, { status });
    return response.data.data;
  },
};

// Review Services
export const reviewService = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const response = await apiClient.get<{
      status: string;
      data: { data: Review[] };
    }>(`/reviews?product=${productId}`);
    return response.data.data || [];
  },

  createReview: async (reviewData: {
    product: string;
    rating: number;
    comment: string;
  }): Promise<Review> => {
    const response = await apiClient.post<{
      status: string;
      data: { data: Review };
    }>("/reviews", reviewData);
    return response.data.data;
  },

  updateReview: async (
    id: string,
    reviewData: {
      rating?: number;
      comment?: string;
    }
  ): Promise<Review> => {
    const response = await apiClient.patch<{
      status: string;
      data: { data: Review };
    }>(`/reviews/${id}`, reviewData);
    return response.data.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};
