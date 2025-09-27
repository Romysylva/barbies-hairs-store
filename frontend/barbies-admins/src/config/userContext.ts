import { createContext } from "react";
import type { User } from "../types/users";

interface UserContextType {
  user: User | null;
  // login: (userData: User) => void;
  // logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
