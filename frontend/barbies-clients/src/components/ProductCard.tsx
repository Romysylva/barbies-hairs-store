/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import {
  ShoppingBag,
  Star,
  Heart,
  Eye,
  Share2,
  GitCompare,
  Zap,
  Clock,
  Truck,
  Badge,
} from "lucide-react";
import QuickViewModal from "./QuickViewModal";
import ShareModal from "./ShareModal";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  showQuickView?: boolean;
  showWishlist?: boolean;
  showCompare?: boolean;
  showBadges?: boolean;
  variant?: "default" | "minimal";
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = "grid",
  showQuickView = true,
  showWishlist = true,
  showCompare = true,
  showBadges = true,
  variant = "default",
  className = "",
}) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { addToRecentlyViewed } = useRecentlyViewed();

  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ Normalize images (imageCover + photos[])
  const productImages = [
    ...(product.photos?.map(
      (photo) =>
        `${process.env.NEXT_PUBLIC_UPLOADS_URL}/uploads/products/${photo}`
    ) || []),
  ];
  if (product.imageCover) {
    productImages.unshift(
      `${process.env.NEXT_PUBLIC_UPLOADS_URL}/uploads/products/${product.imageCover}`
    );
  }
  if (productImages.length === 0) {
    productImages.push("/placeholder.jpg");
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare(product._id)) {
      removeFromCompare(product._id);
    } else {
      addToCompare(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickViewModal(true);
    addToRecentlyViewed(product);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleProductClick = () => {
    addToRecentlyViewed(product);
  };

  const imageUrl = product.imageCover
    ? `${process.env.NEXT_PUBLIC_UPLOADS_URL}/uploads/products/${product.imageCover}`
    : "/placeholder.jpg";

  const discountedPrice = product.priceDiscount || product.price;
  const hasDiscount =
    product.priceDiscount && product.priceDiscount < product.price;
  const isLowStock = product.quantity <= 10 && product.quantity > 0;
  const isOutOfStock = product.quantity === 0;
  const inCart = isInCart(product._id);
  const inWishlist = isInWishlist(product._id);
  const inCompare = isInCompare(product._id);

  if (viewMode === "list") {
    return (
      <>
        <Link href={`/products/${product._id}`} onClick={handleProductClick}>
          <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              {/* Product Image */}
              <div className="relative w-full sm:w-48 h-48 flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onLoad={() => setImageLoading(false)}
                />

                {/* Badges */}
                {showBadges && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {hasDiscount && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        {product.discountPercentage}% OFF
                      </span>
                    )}
                    {product.featured && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                    {product.newArrival && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        New Arrival
                      </span>
                    )}
                    {product.bestseller && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Bestseller
                      </span>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {showWishlist && (
                    <button
                      onClick={handleWishlistToggle}
                      className={`p-2 rounded-full transition-colors ${
                        inWishlist
                          ? "bg-red-500 text-white"
                          : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
                      }`}
                      title={
                        inWishlist ? "Remove from wishlist" : "Add to wishlist"
                      }
                    >
                      <Heart
                        className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`}
                      />
                    </button>
                  )}

                  {showCompare && (
                    <button
                      onClick={handleCompareToggle}
                      className={`p-2 rounded-full transition-colors ${
                        inCompare
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-500"
                      }`}
                      title={
                        inCompare ? "Remove from compare" : "Add to compare"
                      }
                    >
                      <GitCompare className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className="p-2 bg-white text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                    title="Share product"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 p-6">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-pink-600 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>

                    {/* Category and Brand */}
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                      <span>Category: {product.category.name}</span>
                      {product.subcategory && (
                        <span>• {product.subcategory.name}</span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(product.ratingsAverage)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {product.ratingsAverage.toFixed(1)} (
                        {product.ratingsQuantity} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${discountedPrice.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-lg text-gray-500 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {isLowStock && (
                        <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Only {product.quantity} left!
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {showQuickView && (
                        <button
                          onClick={handleQuickView}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 ${
                          isOutOfStock
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : inCart
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-pink-600 text-white hover:bg-pink-700"
                        }`}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>
                          {isOutOfStock
                            ? "Out of Stock"
                            : inCart
                              ? `In Cart (${getItemQuantity(product._id)})`
                              : "Add to Cart"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Modals */}
        {showQuickViewModal && (
          <QuickViewModal
            product={product}
            isOpen={showQuickViewModal}
            onClose={() => setShowQuickViewModal(false)}
          />
        )}

        {showShareModal && (
          <ShareModal
            product={product}
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </>
    );
  }

  // Handle minimal variant for special layouts
  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : inCart
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-pink-600 text-white hover:bg-pink-700"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>
            {isOutOfStock
              ? "Out of Stock"
              : inCart
                ? `In Cart (${getItemQuantity(product._id)})`
                : "Add to Cart"}
          </span>
        </button>

        {showWishlist && (
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-md transition-colors ${
              inWishlist
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
            }`}
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
        )}
      </div>
    );
  }

  // Grid View (Default)
  return (
    <>
      <div
        className={`group relative bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 ${className}`}
      >
        <Link href={`/products/${product._id}`} onClick={handleProductClick}>
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            {product.images?.length > 1 && (
              <div className="absolute inset-0">
                <Image
                  src={product.images[currentImageIndex] || imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  onLoad={() => setImageLoading(false)}
                />

                {/* Image Navigation Dots */}
                {product.images?.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {product.images.slice(0, 3).map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* {product.images.length <= 1 && (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onLoad={() => setImageLoading(false)}
              />
            )} */}
            {product.images?.length > 1 && (
              <div className="absolute inset-0">
                <Image
                  src={productImages[0][currentImageIndex] || imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  onLoad={() => setImageLoading(false)}
                />

                {/* Image Navigation Dots */}
                {product.images?.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {product.images.slice(0, 3).map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Badges */}
            {showBadges && (
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {hasDiscount && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {product.discountPercentage}% OFF
                  </span>
                )}
                {product.featured && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Badge className="h-3 w-3" />
                    Featured
                  </span>
                )}
                {product.newArrival && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    New
                  </span>
                )}
                {product.bestseller && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Bestseller
                  </span>
                )}
                {isLowStock && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Low Stock
                  </span>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {showWishlist && (
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-full shadow-md transition-all duration-200 ${
                    inWishlist
                      ? "bg-red-500 text-white scale-110"
                      : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 hover:scale-110"
                  }`}
                  title={
                    inWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <Heart
                    className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`}
                  />
                </button>
              )}

              {showCompare && (
                <button
                  onClick={handleCompareToggle}
                  className={`p-2 rounded-full shadow-md transition-all duration-200 ${
                    inCompare
                      ? "bg-blue-500 text-white scale-110"
                      : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-500 hover:scale-110"
                  }`}
                  title={inCompare ? "Remove from compare" : "Add to compare"}
                >
                  <GitCompare className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 hover:scale-110"
                title="Share product"
              >
                <Share2 className="h-4 w-4" />
              </button>

              {showQuickView && (
                <button
                  onClick={handleQuickView}
                  className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 hover:scale-110"
                  title="Quick view"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Stock Status Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                <span className="bg-white text-gray-900 px-4 py-2 rounded-md font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4">
          <Link href={`/products/${product._id}`} onClick={handleProductClick}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Category */}
          <p className="text-xs text-gray-500 mb-2">
            {product.category.name}
            {product.subcategory && ` • ${product.subcategory.name}`}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.ratingsAverage)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {product.ratingsAverage.toFixed(1)} ({product.ratingsQuantity})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                ${discountedPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {isLowStock && (
              <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Only {product.quantity} left!
              </span>
            )}
          </div>

          {/* Shipping Info */}
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <Truck className="h-3 w-3 mr-1" />
            <span>Free shipping on orders over $50</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : inCart
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-pink-600 text-white hover:bg-pink-700"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm">
                {isOutOfStock
                  ? "Out of Stock"
                  : inCart
                    ? `In Cart (${getItemQuantity(product._id)})`
                    : "Add to Cart"}
              </span>
            </button>

            {showQuickView && (
              <button
                onClick={handleQuickView}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                title="Quick view"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showQuickViewModal && (
        <QuickViewModal
          product={product}
          isOpen={showQuickViewModal}
          onClose={() => setShowQuickViewModal(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          product={product}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default ProductCard;

// "use client";
// import React, { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { Product } from "../types";
// import { useCart } from "../context/CartContext";
// import { useWishlist } from "../context/WishlistContext";
// import { useCompare } from "../context/CompareContext";
// import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
// import {
//   ShoppingBag,
//   Star,
//   Heart,
//   Eye,
//   Share2,
//   GitCompare,
//   Zap,
//   Clock,
//   Truck,
//   Badge,
// } from "lucide-react";
// import QuickViewModal from "./QuickViewModal";
// import ShareModal from "./ShareModal";

// interface ProductCardProps {
//   product: Product;
//   viewMode?: "grid" | "list";
//   showQuickView?: boolean;
//   showWishlist?: boolean;
//   showCompare?: boolean;
//   showBadges?: boolean;
//   variant?: "default" | "minimal";
//   className?: string;
// }

// const ProductCard: React.FC<ProductCardProps> = ({
//   product,
//   viewMode = "grid",
//   showQuickView = true,
//   showWishlist = true,
//   showCompare = true,
//   showBadges = true,
//   variant = "default",
//   className = "",
// }) => {
//   const { addToCart, isInCart, getItemQuantity } = useCart();
//   const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
//   const { addToCompare, removeFromCompare, isInCompare } = useCompare();
//   const { addToRecentlyViewed } = useRecentlyViewed();

//   const [showQuickViewModal, setShowQuickViewModal] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [imageLoading, setImageLoading] = useState(true);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

// // ✅ Normalize images (imageCover + photos[])
// const productImages = [
//   ...(product.photos?.map(
//     (photo) =>
//       `${process.env.NEXT_PUBLIC_UPLOADS_URL}/uploads/products/${photo}`
//   ) || []),
// ];
// if (product.imageCover) {
//   productImages.unshift(
//     `${process.env.NEXT_PUBLIC_UPLOADS_URL}/uploads/products/${product.imageCover}`
//   );
// }
// if (productImages.length === 0) {
//   productImages.push("/placeholder.jpg");
// }

//   const discountedPrice = product.priceDiscount || product.price;
//   const hasDiscount =
//     product.priceDiscount && product.priceDiscount < product.price;
//   const isLowStock = product.quantity <= 10 && product.quantity > 0;
//   const isOutOfStock = product.quantity === 0;
//   const inCart = isInCart(product._id);
//   const inWishlist = isInWishlist(product._id);
//   const inCompare = isInCompare(product._id);

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     addToCart(product, 1);
//   };

//   const handleWishlistToggle = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (inWishlist) {
//       removeFromWishlist(product._id);
//     } else {
//       addToWishlist(product);
//     }
//   };

//   const handleCompareToggle = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (inCompare) {
//       removeFromCompare(product._id);
//     } else {
//       addToCompare(product);
//     }
//   };

//   const handleQuickView = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setShowQuickViewModal(true);
//     addToRecentlyViewed(product);
//   };

//   const handleShare = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setShowShareModal(true);
//   };

//   const handleProductClick = () => {
//     addToRecentlyViewed(product);
//   };

//   // 📌 List View
//   if (viewMode === "list") {
//     return (
//       <Link href={`/products/${product._id}`} onClick={handleProductClick}>
//         <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition overflow-hidden flex flex-col sm:flex-row">
//           <div className="relative w-full sm:w-48 h-48 flex-shrink-0">
//             <Image
//               src={productImages[0]}
//               alt={product.name}
//               fill
//               className="object-cover"
//               onLoad={() => setImageLoading(false)}
//             />
//           </div>
//           {/* ... keep rest of your details (title, price, etc.) */}
//         </div>
//       </Link>
//     );
//   }

//   // 📌 Minimal Variant
//   if (variant === "minimal") {
//     return (
//       <div className={`flex items-center gap-2 ${className}`}>
//         <div className="relative w-12 h-12 flex-shrink-0">
//           <Image
//             src={productImages[0]}
//             alt={product.name}
//             fill
//             className="object-cover rounded-md"
//           />
//         </div>
//         <div>
//           <h3 className="text-sm font-medium">{product.name}</h3>
//           <p className="text-xs text-gray-500">${discountedPrice.toFixed(2)}</p>
//         </div>
//       </div>
//     );
//   }

//   // 📌 Grid View
//   return (
//     <div
//       className={`group relative bg-white rounded-lg shadow-sm border hover:shadow-lg transition ${className}`}
//     >
//       <Link href={`/products/${product._id}`} onClick={handleProductClick}>
//         <div className="relative aspect-square overflow-hidden rounded-t-lg">
//           <Image
//             src={productImages[currentImageIndex]}
//             alt={product.name}
//             fill
//             className="object-cover group-hover:scale-105 transition-transform duration-500"
//             onLoad={() => setImageLoading(false)}
//           />

//           {/* Image Navigation Dots */}
//           {productImages.length > 1 && (
//             <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
//               {productImages.slice(0, 3).map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     setCurrentImageIndex(index);
//                   }}
//                   className={`w-2 h-2 rounded-full ${
//                     index === currentImageIndex ? "bg-white" : "bg-white/60"
//                   }`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </Link>
//       {/* ... rest of product info (badges, buttons, price, etc.) */}
//     </div>
//   );
// };
