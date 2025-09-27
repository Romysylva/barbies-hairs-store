import { createContext } from "react";
import type { AuthContextType } from "../../../../shared/contexts/AuthContext";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
