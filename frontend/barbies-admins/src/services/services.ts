import { User } from "@/data/types/users";
import apiClient from "../lib/apiClient";

interface GetUserResponse {
  user: User;
}

interface GetUsersResponse {
  status: string;
  results: number;
  data: {
    data: User[];
  };
}

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<GetUsersResponse>("/users");
  return response.data.data.data ?? [];
};

export const getUserById = async (id: string) => {
  const response = await apiClient.get<GetUserResponse>(`/users/${id}`);
  return response.data.user ?? null;
};

export const getMe = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<{
      status: string;
      data: { user: User };
    }>("/users/me");
    return response.data.data.user ?? null;
  } catch (error) {
    return null;
  }
};

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<{
      status: string;
      token: string;
      data: { user: User };
    }>("/auths/login", { email, password });
    
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
  },

  logout: async () => {
    await apiClient.post("/auths/logout");
    localStorage.removeItem("token");
  }
};
