"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useCompare } from "../../../context/CompareContext";
import { useRecentlyViewed } from "../../../hooks/useRecentlyViewed";
import { Product } from "../../../types/index";
import {
  ShoppingBag,
  Star,
  Heart,
  GitCompare,
  Share2,
  Truck,
  Clock,
  Zap,
  Badge,
} from "lucide-react";
import ShareModal from "@/components/ShareModal";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { addToRecentlyViewed } = useRecentlyViewed();

  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  if (!product) {
    return <p>Loading product...</p>;
  }

  const productImages = [
    ...(product.photos?.map(
      (photo) => `${process.env.NEXT_PUBLIC_UPLOADS_URL}/uploads/${photo}`
    ) || []),
  ];
  if (product.imageCover) {
    productImages.unshift(
      `${process.env.NEXT_PUBLIC_UPLOADS_URL}/uploads/${product.imageCover}`
    );
  }
  if (productImages.length === 0) {
    productImages.push("/placeholder.jpg");
  }

  const discountedPrice = product.priceDiscount || product.price;
  const hasDiscount =
    product.priceDiscount && product.priceDiscount < product.price;
  const isLowStock = product.quantity <= 10 && product.quantity > 0;
  const isOutOfStock = product.quantity === 0;

  const inCart = isInCart(product._id);
  const inWishlist = isInWishlist(product._id);
  const inCompare = isInCompare(product._id);

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCompareToggle = () => {
    if (inCompare) {
      removeFromCompare(product._id);
    } else {
      addToCompare(product);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  // Track recently viewed
  useEffect(() => {
    addToRecentlyViewed(product);
  }, [product]);

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Left: Image Gallery */}
      <div>
        <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
          <Image
            src={productImages[selectedImage]}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        {productImages.length > 1 && (
          <div className="flex gap-2 mt-4">
            {productImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-20 rounded border ${
                  i === selectedImage ? "border-pink-500" : "border-gray-200"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${i}`}
                  fill
                  className="object-cover rounded"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {product.name}
        </h1>
        <p className="text-gray-600 mb-6">{product.description}</p>

        {/* Badges */}
        <div className="flex gap-2 mb-4">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.featured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Badge className="h-3 w-3" /> Featured
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
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(product.ratingsAverage)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.ratingsAverage.toFixed(1)} ({product.ratingsQuantity}{" "}
            reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-3xl font-bold text-gray-900">
            ${discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xl text-gray-500 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock */}
        {isOutOfStock ? (
          <p className="text-red-600 mb-4">Out of stock</p>
        ) : isLowStock ? (
          <p className="text-orange-600 mb-4">
            <Clock className="inline h-4 w-4 mr-1" />
            Only {product.quantity} left!
          </p>
        ) : (
          <p className="text-green-600 mb-4">In stock</p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
              isOutOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : inCart
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-pink-600 text-white hover:bg-pink-700"
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            {isOutOfStock
              ? "Out of Stock"
              : inCart
                ? `In Cart (${getItemQuantity(product._id)})`
                : "Add to Cart"}
          </button>

          <button
            onClick={handleWishlistToggle}
            className={`p-3 rounded-md transition-colors ${
              inWishlist
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={handleCompareToggle}
            className={`p-3 rounded-md transition-colors ${
              inCompare
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-500"
            }`}
          >
            <GitCompare className="h-5 w-5" />
          </button>

          <button
            onClick={handleShare}
            className="p-3 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Extra Info */}
        <div className="text-sm text-gray-500 space-y-2">
          <p>
            Category: {product.category.name}
            {product.subcategory && ` • ${product.subcategory.name}`}
          </p>
          <p>
            <Truck className="inline h-4 w-4 mr-1" />
            Free shipping on orders over $50
          </p>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          product={product}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default ProductDetails;
