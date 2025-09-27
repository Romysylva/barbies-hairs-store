"use client";

import React from "react";
import { cn } from "../utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: "default" | "filled" | "underlined";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      success,
      helper,
      leftIcon,
      rightIcon,
      fullWidth = false,
      variant = "default",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn("form-group", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="form-label"
            suppressHydrationWarning
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            suppressHydrationWarning
            type={type}
            id={inputId}
            className={cn(
              "input",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "input-error",
              success && "input-success",
              variant === "filled" && "bg-muted border-transparent",
              variant === "underlined" &&
                "border-0 border-b-2 rounded-none bg-transparent focus:ring-0 focus:border-primary",
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        {success && !error && (
          <p className="text-sm text-success-500 mt-1">{success}</p>
        )}

        {helper && !error && !success && <p className="form-help">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
