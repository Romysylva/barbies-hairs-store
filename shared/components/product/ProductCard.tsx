import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatCurrency, calculateDiscountPercentage } from '../utils';
import { Product } from '../types';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  isWishlisted?: boolean;
  showQuickActions?: boolean;
  showBadges?: boolean;
  linkPrefix?: string; // "/shop" for client, "/admin/products" for admin
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isWishlisted = false,
  showQuickActions = true,
  showBadges = true,
  linkPrefix = '/shop',
  className
}) => {
  const discountPercentage = product.priceDiscount 
    ? calculateDiscountPercentage(product.price, product.priceDiscount)
    : 0;

  const productUrl = `${linkPrefix}/${product.slug}`;

  return (
    <Card className={cn('product-card group', className)} padding="none">
      <div className="relative overflow-hidden">
        {/* Product Image */}
        <Link href={productUrl} className="block">
          <div className="aspect-square relative bg-muted">
            <Image
              src={product.imageCover}
              alt={product.name}
              fill
              className="product-card-image"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>

        {/* Badges */}
        {showBadges && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <Badge variant="primary" className="text-xs">Featured</Badge>
            )}
            {product.bestseller && (
              <Badge variant="secondary" className="text-xs">Best Seller</Badge>
            )}
            {product.newArrival && (
              <Badge variant="outline" className="text-xs">New</Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="text-xs">
                -{discountPercentage}%
              </Badge>
            )}
            {product.quantity === 0 && (
              <Badge variant="outline" className="text-xs bg-muted">
                Out of Stock
              </Badge>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onQuickView && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView(product);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onAddToWishlist && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background",
                  isWishlisted && "text-destructive hover:text-destructive"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  onAddToWishlist(product);
                }}
              >
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
              </Button>
            )}
          </div>
        )}
      </div>

      <CardContent className="product-card-content">
        {/* Product Info */}
        <Link href={productUrl} className="block">
          <h3 className="product-card-title">{product.name}</h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < Math.floor(product.ratingsAverage)
                    ? "text-warning-500 fill-current"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.ratingsQuantity})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="product-card-price">
            {formatCurrency(product.priceDiscount || product.price)}
          </span>
          {product.priceDiscount && (
            <span className="product-card-original-price">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {onAddToCart && showQuickActions && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            className="mt-3"
            disabled={product.quantity === 0}
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            leftIcon={<ShoppingCart className="h-4 w-4" />}
          >
            {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
