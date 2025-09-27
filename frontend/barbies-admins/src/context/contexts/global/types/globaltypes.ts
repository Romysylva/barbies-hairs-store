export interface GlobalContextType {
  isLoading: boolean;
  error: string | null;
  success: string;
  showLoading: () => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  clearError: () => void;
  showSuccess: (message: string) => void;
  clearSuccess: () => void;
}
