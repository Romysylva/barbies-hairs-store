import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Search, AlertCircle, CheckCircle } from "lucide-react";

// =============================================================================
// INPUT COMPONENT
// =============================================================================

const inputVariants = cva(
  "flex w-full rounded-md border bg-background px-3 py-2 text-sm " +
    "ring-offset-background placeholder:text-muted-foreground " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 " +
    "transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-error-500 focus-visible:ring-error-500/50",
        success: "border-success-500 focus-visible:ring-success-500/50",
        warning: "border-warning-500 focus-visible:ring-warning-500/50",
      },
      fieldSize: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-base",
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
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            inputVariants({ variant: inputVariant, fieldSize }),
            leftIcon ? "pl-10" : undefined,
            rightIcon ? "pr-10" : undefined,
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
        {hasError && !rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
        {hasSuccess && !rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
      </div>
    );

    if (!label && !error && !success && !helperText) {
      return inputElement;
    }

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        {inputElement}
        {error && (
          <p id={`${inputId}-error`} className="form-error">
            {error}
          </p>
        )}
        {success && !error && (
          <p
            id={`${inputId}-success`}
            className="text-sm text-success-500"
          >
            {success}
          </p>
        )}
        {helperText && !error && !success && (
          <p id={`${inputId}-helper`} className="form-help">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// =============================================================================
// PASSWORD INPUT COMPONENT
// =============================================================================

export interface PasswordInputProps extends Omit<InputProps, "type" | "rightIcon"> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        rightIcon={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

// =============================================================================
// SEARCH INPUT COMPONENT
// =============================================================================

export interface SearchInputProps extends Omit<InputProps, "leftIcon"> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onSearch?.(value as string);
      }
    };

    const handleClear = () => {
      setValue("");
      onClear?.();
    };

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          value && onClear ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              ×
            </button>
          ) : undefined
        }
        value={value}
        onChange={handleChange}
        onKeyDown={handleSubmit}
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";
