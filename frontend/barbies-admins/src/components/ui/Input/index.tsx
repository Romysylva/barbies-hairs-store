/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Eye, EyeOff, Search, AlertCircle, CheckCircle } from "lucide-react";

// =============================================================================
// INPUT COMPONENT
// =============================================================================

const inputVariants = cva(
  "bhs:flex bhs:w-full bhs:rounded-md bhs:border bhs:bg-background bhs:px-3 bhs:py-2 bhs:text-sm " +
    "bhs:ring-offset-background placeholder:bhs:text-muted-foreground " +
    "focus-visible:bhs:outline-none focus-visible:bhs:ring-2 focus-visible:bhs:ring-ring " +
    "focus-visible:bhs:ring-offset-2 disabled:bhs:cursor-not-allowed disabled:bhs:opacity-50 " +
    "bhs:transition-all bhs:duration-200",
  {
    variants: {
      variant: {
        default: "bhs:border-input",
        error: "bhs:border-error-500 focus-visible:bhs:ring-error-500/50",
        success: "bhs:border-success-500 focus-visible:bhs:ring-success-500/50",
        warning: "bhs:border-warning-500 focus-visible:bhs:ring-warning-500/50",
      },
      fieldSize: {
        sm: "bhs:h-8 bhs:px-2 bhs:text-xs",
        md: "bhs:h-10 bhs:px-3 bhs:py-2",
        lg: "bhs:h-12 bhs:px-4 bhs:py-3 bhs:text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      fieldSize: "md",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  success?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      fieldSize,
      type,
      leftIcon,
      rightIcon,
      error,
      success,
      helperText,
      label,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);

    const inputVariant = hasError ? "error" : hasSuccess ? "success" : variant;

    const inputElement = (
      <div className="bhs:relative">
        {leftIcon && (
          <div className="bhs:absolute bhs:left-3 bhs:top-1/2 -bhs:translate-y-1/2 bhs:text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            inputVariants({ variant: inputVariant, fieldSize }),
            leftIcon ? "bhs:pl-10" : undefined,
            rightIcon ? "bhs:pr-10" : undefined,
            className
          )}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : success
                ? `${inputId}-success`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
          }
          {...props}
        />
        {rightIcon && (
          <div className="bhs:absolute bhs:right-3 bhs:top-1/2 -bhs:translate-y-1/2 bhs:text-muted-foreground">
            {rightIcon}
          </div>
        )}
        {hasError && !rightIcon && (
          <div className="bhs:absolute bhs:right-3 bhs:top-1/2 -bhs:translate-y-1/2 bhs:text-error-500">
            <AlertCircle className="bhs:h-4 bhs:w-4" />
          </div>
        )}
        {hasSuccess && !rightIcon && (
          <div className="bhs:absolute bhs:right-3 bhs:top-1/2 -bhs:translate-y-1/2 bhs:text-success-500">
            <CheckCircle className="bhs:h-4 bhs:w-4" />
          </div>
        )}
      </div>
    );

    if (!label && !error && !success && !helperText) {
      return inputElement;
    }

    return (
      <div className="bhs:space-y-2">
        {label && (
          <label htmlFor={inputId} className="bhs:form-label">
            {label}
            {required && <span className="bhs:text-error-500 bhs:ml-1">*</span>}
          </label>
        )}
        {inputElement}
        {error && (
          <p id={`${inputId}-error`} className="bhs:form-error">
            {error}
          </p>
        )}
        {success && !error && (
          <p
            id={`${inputId}-success`}
            className="bhs:text-sm bhs:text-success-500"
          >
            {success}
          </p>
        )}
        {helperText && !error && !success && (
          <p id={`${inputId}-helper`} className="bhs:form-help">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { inputVariants };
