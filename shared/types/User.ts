// Centralized User interface for the entire application
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "manager";
  photo?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth response interface
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}
