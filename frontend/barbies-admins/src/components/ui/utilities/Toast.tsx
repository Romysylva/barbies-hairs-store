import { cn } from "../../lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
}

const Toast = ({ message, type = "success" }: ToastProps) => {
  const icon =
    type === "success" ? (
      <CheckCircle className="bhs:text-green-500" />
    ) : type === "error" ? (
      <XCircle className="bhs:text-red-500" />
    ) : null;

  return (
    <div
      className={cn(
        "bhs:fixed bhs:top-6 bhs:right-6 bhs:z-50 bhs:max-w-sm bhs:w-full bhs:p-4 bhs:flex bhs:items-center bhs:gap-3 bhs:shadow-lg bhs:rounded-lg bhs:border bhs:bg-white",
        "bhs:animate-slide-in"
      )}
    >
      {icon}
      <span className="bhs:font-medium bhs:text-sm">{message}</span>
    </div>
  );
};

export default Toast;
