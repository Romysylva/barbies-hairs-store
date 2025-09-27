// src/context/GlobalContext.tsx
import React, { useState } from "react";
import { GlobalContext } from "./config/globalContext";
import type { ReactNode } from "react";

// export interface GlobalContextType {
//   isLoading: boolean;
//   error: string | null;
//   success: string;
//   showLoading: () => void;
//   hideLoading: () => void;
//   showError: (message: string) => void;
//   clearError: () => void;
//   showSuccess: (message: string) => void;
//   clearSuccess: () => void;
// }

// export const GlobalContext = createContext<GlobalContextType | undefined>(
//   undefined
// );

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>("");

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  const showError = (message: string) => setError(message);
  const clearError = () => setError(null);

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };
  const clearSuccess = () => setSuccess("");

  return (
    <GlobalContext.Provider
      value={{
        isLoading,
        error,
        success,
        showLoading,
        hideLoading,
        showError,
        clearError,
        showSuccess,
        clearSuccess,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
