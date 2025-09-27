/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Image from "next/image";

// =============================================================================
// CARD COMPONENT
// =============================================================================

const cardVariants = cva(
  "bhs:rounded-lg bhs:border bhs:bg-card bhs:text-card-foreground bhs:transition-all bhs:duration-200",
  {
    variants: {
      variant: {
        default: "bhs:shadow-soft hover:bhs:shadow-medium",
        outlined: "bhs:border-2 bhs:shadow-none hover:bhs:shadow-soft",
        elevated: "bhs:shadow-medium hover:bhs:shadow-strong",
        ghost: "bhs:border-none bhs:shadow-none hover:bhs:bg-accent/50",
        gradient:
          "bhs:bg-gradient-to-br bhs:from-card bhs:to-card/80 bhs:shadow-soft hover:bhs:shadow-medium",
      },
      padding: {
        none: "bhs:p-0",
        sm: "bhs:p-3",
        md: "bhs:p-6",
        lg: "bhs:p-8",
      },
      interactive: {
        true: "bhs:cursor-pointer hover:-bhs:translate-y-1 hover:bhs:scale-[1.02] active:bhs:scale-100",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, interactive, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

// =============================================================================
// CARD HEADER COMPONENT
// =============================================================================

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bhs:flex bhs:flex-col bhs:space-y-1.5 bhs:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// =============================================================================
// CARD TITLE COMPONENT
// =============================================================================

const cardTitleVariants = cva(
  "bhs:font-semibold bhs:leading-none bhs:tracking-tight",
  {
    variants: {
      size: {
        sm: "bhs:text-lg",
        md: "bhs:text-2xl",
        lg: "bhs:text-3xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitleVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, size, as: Comp = "h3", ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn(cardTitleVariants({ size, className }))}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

// =============================================================================
// CARD DESCRIPTION COMPONENT
// =============================================================================

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("bhs:text-sm bhs:text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// =============================================================================
// CARD CONTENT COMPONENT
// =============================================================================

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("bhs:p-6 bhs:pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// =============================================================================
// CARD FOOTER COMPONENT
// =============================================================================

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bhs:flex bhs:items-center bhs:p-6 bhs:pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// =============================================================================
// PRODUCT CARD COMPONENT
// =============================================================================

export interface ProductCardProps extends Omit<CardProps, "children"> {
  image?: string;
  imageAlt?: string;
  title: string;
  description?: string;
  price: number | string;
  originalPrice?: number | string;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  badgeVariant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "destructive";
  onAddToCart?: () => void;
  onQuickView?: () => void;
  href?: string;
  isLoading?: boolean;
  inStock?: boolean;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  (
    {
      className,
      image,
      imageAlt,
      title,
      description,
      price,
      originalPrice,
      discount,
      rating,
      reviewCount,
      badge,
      badgeVariant = "primary",
      onAddToCart,
      onQuickView,
      href,
      isLoading = false,
      inStock = true,
      ...props
    },
    ref
  ) => {
    const CardComponent = href ? "a" : "div";
    const cardProps = href ? { href } : {};

    if (isLoading) {
      return (
        <Card
          ref={ref}
          className={cn("bhs:overflow-hidden", className)}
          padding="none"
          {...props}
        >
          <div className="bhs:aspect-square bhs:bg-muted bhs:animate-pulse" />
          <CardContent className="bhs:p-4 bhs:space-y-2">
            <div className="bhs:h-4 bhs:bg-muted bhs:rounded bhs:animate-pulse" />
            <div className="bhs:h-4 bhs:bg-muted bhs:rounded bhs:w-2/3 bhs:animate-pulse" />
            <div className="bhs:h-6 bhs:bg-muted bhs:rounded bhs:w-1/3 bhs:animate-pulse" />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "bhs:product-card bhs:overflow-hidden bhs:relative",
          !inStock && "bhs:opacity-60",
          className
        )}
        padding="none"
        interactive={Boolean(href)}
        {...props}
        {...cardProps}
      >
        {/* Badge */}
        {badge && (
          <div className="bhs:absolute bhs:top-2 bhs:left-2 bhs:z-10">
            <span
              className={cn(
                "bhs:badge",
                badgeVariant === "primary" && "bhs:badge-primary",
                badgeVariant === "secondary" && "bhs:badge-secondary",
                badgeVariant === "success" && "bhs:badge-success",
                badgeVariant === "warning" && "bhs:badge-warning",
                badgeVariant === "destructive" && "bhs:badge-destructive"
              )}
            >
              {badge}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {discount && discount > 0 && (
          <div className="bhs:absolute bhs:top-2 bhs:right-2 bhs:z-10">
            <span className="bhs:badge bhs:badge-destructive">
              -{discount}%
            </span>
          </div>
        )}

        {/* Image */}
        <div className="bhs:aspect-square bhs:overflow-hidden bhs:bg-muted">
          {image ? (
            <Image
              src={image}
              alt={imageAlt || title}
              className="bhs:product-card-image"
              width={400} // required
              height={300} // required
              loading="lazy"
            />
          ) : (
            <div className="bhs:w-full bhs:h-full bhs:bg-muted bhs:flex bhs:items-center bhs:justify-center">
              <span className="bhs:text-muted-foreground">No Image</span>
            </div>
          )}

          {/* Quick actions overlay */}
          <div className="bhs:absolute bhs:inset-0 bhs:bg-black/0 group-hover:bhs:bg-black/20 bhs:transition-all bhs:duration-200 bhs:flex bhs:items-center bhs:justify-center bhs:opacity-0 group-hover:bhs:opacity-100">
            <div className="bhs:flex bhs:gap-2">
              {onQuickView && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView();
                  }}
                  className="bhs:btn-sm bhs:btn-secondary"
                  aria-label="Quick view"
                >
                  Quick View
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="bhs:product-card-content">
          <CardTitle size="sm" className="bhs:product-card-title">
            {title}
          </CardTitle>

          {description && (
            <CardDescription className="bhs:line-clamp-2">
              {description}
            </CardDescription>
          )}

          {/* Rating */}
          {rating !== undefined && (
            <div className="bhs:flex bhs:items-center bhs:gap-1 bhs:text-xs">
              <div className="bhs:flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "bhs:text-warning-400",
                      i < Math.floor(rating)
                        ? "bhs:opacity-100"
                        : "bhs:opacity-30"
                    )}
                  >
                    ★
                  </span>
                ))}
              </div>
              {reviewCount && (
                <span className="bhs:text-muted-foreground">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="bhs:flex bhs:items-center bhs:gap-2">
            <span className="bhs:product-card-price">
              {typeof price === "string" ? price : `$${price.toFixed(2)}`}
            </span>
            {originalPrice && (
              <span className="bhs:product-card-original-price">
                {typeof originalPrice === "string"
                  ? originalPrice
                  : `$${originalPrice.toFixed(2)}`}
              </span>
            )}
          </div>

          {/* Stock status */}
          {!inStock && (
            <span className="bhs:text-sm bhs:text-destructive bhs:font-medium">
              Out of Stock
            </span>
          )}
        </CardContent>

        {/* Footer */}
        {onAddToCart && (
          <CardFooter className="bhs:pt-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={!inStock}
              className="bhs:btn-primary bhs:btn-sm bhs:w-full"
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </CardFooter>
        )}
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

// =============================================================================
// STATS CARD COMPONENT
// =============================================================================

export interface StatsCardProps extends Omit<CardProps, "children"> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, description, icon, trend, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn("", className)} {...props}>
        <CardContent className="bhs:p-6">
          <div className="bhs:flex bhs:items-center bhs:justify-between">
            <div>
              <CardDescription className="bhs:mb-1">{title}</CardDescription>
              <CardTitle size="lg" className="bhs:text-3xl bhs:font-bold">
                {value}
              </CardTitle>
              {description && (
                <CardDescription className="bhs:mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
            {icon && <div className="bhs:text-muted-foreground">{icon}</div>}
          </div>

          {trend && (
            <div className="bhs:mt-4 bhs:flex bhs:items-center bhs:gap-2 bhs:text-sm">
              <span
                className={cn(
                  "bhs:font-medium",
                  trend.isPositive
                    ? "bhs:text-success-600"
                    : "bhs:text-destructive"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="bhs:text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatsCard.displayName = "StatsCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  ProductCard,
  StatsCard,
  cardVariants,
  cardTitleVariants,
};
