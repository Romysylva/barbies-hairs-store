import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium " +
    "ring-offset-background transition-all duration-200 focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "active:scale-[0.98] hover:shadow-md transform-gpu",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 " +
          "shadow-sm hover:shadow-md active:bg-primary/95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 " +
          "shadow-sm hover:shadow-md active:bg-destructive/95",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground " +
          "active:bg-accent/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 " +
          "border border-border active:bg-secondary/90",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/90",
        link:
          "text-primary underline-offset-4 hover:underline hover:text-primary/90 " +
          "p-0 h-auto font-normal shadow-none hover:shadow-none active:scale-100",
        success:
          "bg-success-500 text-white hover:bg-success-600 " +
          "shadow-sm hover:shadow-md active:bg-success-700",
        warning:
          "bg-warning-500 text-white hover:bg-warning-600 " +
          "shadow-sm hover:shadow-md active:bg-warning-700",
        gradient:
          "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground " +
          "hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8 text-base",
        xl: "h-12 px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      loading: false,
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      loadingText,
      fullWidth,
      asChild = false,
      children,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const isDisabled = disabled || loading;
    const showLoading = loading && !asChild;

    // Accessibility attributes
    const ariaProps: React.AriaAttributes = {
      "aria-disabled": isDisabled,
      "aria-busy": loading,
      "aria-describedby": loading && loadingText ? "loading-status" : undefined,
      ...(props["aria-label"]
        ? {}
        : {
            "aria-label": typeof children === "string" ? children : "Button",
          }),
    };

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, loading, fullWidth }),
          "focus-visible:ring touch-target",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...ariaProps}
        {...props}
      >
        {showLoading && (
          <>
            <Loader2
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
            <span id="loading-status" className="sr-only">
              {loadingText || "Loading"}
            </span>
          </>
        )}
        {!showLoading && leftIcon && (
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className="flex-1">
          {showLoading && loadingText ? loadingText : children}
        </span>
        {!showLoading && rightIcon && (
          <span className="ml-2 flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
