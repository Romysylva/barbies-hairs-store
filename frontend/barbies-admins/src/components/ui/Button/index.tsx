import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

const buttonVariants = cva(
  "bhs:inline-flex bhs:items-center bhs:justify-center bhs:whitespace-nowrap bhs:rounded-md bhs:text-sm bhs:font-medium " +
    "bhs:ring-offset-background bhs:transition-all bhs:duration-200 focus-visible:bhs:outline-none " +
    "focus-visible:bhs:ring-2 focus-visible:bhs:ring-ring focus-visible:bhs:ring-offset-2 " +
    "disabled:bhs:pointer-events-none disabled:bhs:opacity-50 " +
    "active:bhs:scale-[0.98] hover:bhs:shadow-md bhs:transform-gpu",
  {
    variants: {
      variant: {
        primary:
          "bhs:bg-primary bhs:text-primary-foreground hover:bhs:bg-primary/90 " +
          "bhs:shadow-sm hover:bhs:shadow-md active:bhs:bg-primary/95",
        destructive:
          "bhs:bg-destructive bhs:text-destructive-foreground hover:bhs:bg-destructive/90 " +
          "bhs:shadow-sm hover:bhs:shadow-md active:bhs:bg-destructive/95",
        outline:
          "bhs:border bhs:border-input bhs:bg-background hover:bhs:bg-accent hover:bhs:text-accent-foreground " +
          "active:bhs:bg-accent/90",
        secondary:
          "bhs:bg-secondary bhs:text-secondary-foreground hover:bhs:bg-secondary/80 " +
          "bhs:border bhs:border-border active:bhs:bg-secondary/90",
        ghost:
          "hover:bhs:bg-accent hover:bhs:text-accent-foreground active:bhs:bg-accent/90",
        link:
          "bhs:text-primary bhs:underline-offset-4 hover:bhs:underline hover:bhs:text-primary/90 " +
          "bhs:p-0 bhs:h-auto bhs:font-normal bhs:shadow-none hover:bhs:shadow-none active:bhs:scale-100",
        success:
          "bhs:bg-success-500 bhs:text-white hover:bhs:bg-success-600 " +
          "bhs:shadow-sm hover:bhs:shadow-md active:bhs:bg-success-700",
        warning:
          "bhs:bg-warning-500 bhs:text-white hover:bhs:bg-warning-600 " +
          "bhs:shadow-sm hover:bhs:shadow-md active:bhs:bg-warning-700",
        gradient:
          "bhs:bg-gradient-to-r bhs:from-primary bhs:to-primary/80 bhs:text-primary-foreground " +
          "hover:bhs:from-primary/90 hover:bhs:to-primary/70 bhs:shadow-sm hover:bhs:shadow-md",
      },
      size: {
        sm: "bhs:h-9 bhs:px-3 bhs:text-xs",
        md: "bhs:h-10 bhs:px-4 bhs:py-2",
        lg: "bhs:h-11 bhs:px-8 bhs:text-base",
        xl: "bhs:h-12 bhs:px-10 bhs:text-lg",
        icon: "bhs:h-10 bhs:w-10",
        "icon-sm": "bhs:h-8 bhs:w-8",
        "icon-lg": "bhs:h-12 bhs:w-12",
      },
      loading: {
        true: "bhs:cursor-wait",
        false: "",
      },
      fullWidth: {
        true: "bhs:w-full",
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
          "focus-visible:bhs:ring bhs:touch-target",
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
              className="bhs:mr-2 bhs:h-4 bhs:w-4 bhs:animate-spin"
              aria-hidden="true"
            />
            <span id="loading-status" className="bhs:sr-only">
              {loadingText || "Loading"}
            </span>
          </>
        )}
        {!showLoading && leftIcon && (
          <span className="bhs:mr-2 bhs:flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className="bhs:flex-1">
          {showLoading && loadingText ? loadingText : children}
        </span>
        {!showLoading && rightIcon && (
          <span className="bhs:ml-2 bhs:flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

// =============================================================================
// BUTTON GROUP COMPONENT
// =============================================================================

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  size?: VariantProps<typeof buttonVariants>["size"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
  attached?: boolean;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      className,
      orientation = "horizontal",
      attached = false,
      children,
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === "horizontal";

    return (
      <div
        ref={ref}
        className={cn(
          "bhs:inline-flex",
          isHorizontal ? "bhs:flex-row" : "bhs:flex-col",
          attached &&
            isHorizontal &&
            "[&>*:not(:first-child)]:bhs:rounded-l-none [&>*:not(:first-child)]:-bhs:ml-px [&>*:not(:last-child)]:bhs:rounded-r-none",
          attached &&
            !isHorizontal &&
            "[&>*:not(:first-child)]:bhs:rounded-t-none [&>*:not(:first-child)]:-bhs:mt-px [&>*:not(:last-child)]:bhs:rounded-b-none",
          !attached && (isHorizontal ? "bhs:gap-2" : "bhs:gap-2"),
          className
        )}
        role="group"
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

// =============================================================================
// ICON BUTTON COMPONENT
// =============================================================================

interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon"> {
  icon: React.ReactNode;
  "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = "icon", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn("bhs:shrink-0", className)}
        size={size}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

// =============================================================================
// FLOATING ACTION BUTTON
// =============================================================================

interface FABProps extends ButtonProps {
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  // other props..
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ className, position = "bottom-right", size = "lg", ...props }, ref) => {
    const positionClasses: Record<FABProps["position"], string> = {
      "bottom-right": "bhs:fixed bhs:bottom-6 bhs:right-6",
      "bottom-left": "bhs:fixed bhs:bottom-6 bhs:left-6",
      "top-right": "bhs:fixed bhs:top-6 bhs:right-6",
      "top-left": "bhs:fixed bhs:top-6 bhs:left-6",
    };

    return (
      <Button
        ref={ref}
        className={cn(
          positionClasses[position],
          "bhs:rounded-full bhs:shadow-lg hover:bhs:shadow-xl bhs:z-50",
          "bhs:animate-fade-in hover:bhs:scale-110 bhs:transition-all bhs:duration-200",
          className
        )}
        size={size}
        {...props}
      />
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

export {
  Button,
  ButtonGroup,
  IconButton,
  FloatingActionButton,
  buttonVariants,
};
