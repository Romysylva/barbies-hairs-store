// components/ui/Button.tsx
import React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>; // ✅ extends button props

const Button = ({
  children,
  onClick,
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "bhs:px-6 bhs:py-2 bhs:rounded-full bhs:font-semibold bhs:transition";
  const variants = {
    primary: "bhs:bg-barbiePurple bhs:text-white bhs:hover:bg-pink-500",
    secondary:
      "bhs:bg-white bhs:text-barbiePurple bhs:border bhs:border-purple-400 bhs:hover:bg-purple-700 bhs:hover:text-white",
  };

  return (
    <button
      {...props}
      onClick={onClick}
      type={type}
      className={cn(baseStyles, variants[variant], className)} // ✅ merge classes
    >
      {children}
    </button>
  );
};

export default Button;
