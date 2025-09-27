"use client";
import React from "react";
import Link from "next/link";
import { ProductRecommendation } from "../types";
import ProductCard from "./ProductCard";
import {
  Sparkles,
  TrendingUp,
  Heart,
  ShoppingBag,
  User,
  Star,
} from "lucide-react";

interface ProductRecommendationsProps {
  recommendations: ProductRecommendation[];
  title?: string;
  subtitle?: string;
  showReason?: boolean;
  layout?: "grid" | "carousel";
  maxItems?: number;
  className?: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  recommendations,
  title = "Recommended for You",
  subtitle,
  showReason = true,
  layout = "grid",
  maxItems,
  className = "",
}) => {
  if (recommendations?.length === 0) {
    return null;
  }

  const displayedRecommendations = maxItems
    ? recommendations.slice(0, maxItems)
    : recommendations;

  const getReasonIcon = (reason: string) => {
    const lowerReason = reason.toLowerCase();

    if (lowerReason.includes("purchase") || lowerReason.includes("bought")) {
      return <ShoppingBag className="h-4 w-4 text-green-600" />;
    }
    if (lowerReason.includes("viewed") || lowerReason.includes("browsed")) {
      return <User className="h-4 w-4 text-blue-600" />;
    }
    if (lowerReason.includes("wishlist") || lowerReason.includes("saved")) {
      return <Heart className="h-4 w-4 text-red-600" />;
    }
    if (lowerReason.includes("trending") || lowerReason.includes("popular")) {
      return <TrendingUp className="h-4 w-4 text-purple-600" />;
    }
    if (lowerReason.includes("rating") || lowerReason.includes("review")) {
      return <Star className="h-4 w-4 text-yellow-600" />;
    }

    return <Sparkles className="h-4 w-4 text-pink-600" />;
  };

  const getReasonColor = (reason: string) => {
    const lowerReason = reason.toLowerCase();

    if (lowerReason.includes("purchase") || lowerReason.includes("bought")) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (lowerReason.includes("viewed") || lowerReason.includes("browsed")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (lowerReason.includes("wishlist") || lowerReason.includes("saved")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (lowerReason.includes("trending") || lowerReason.includes("popular")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    if (lowerReason.includes("rating") || lowerReason.includes("review")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }

    return "bg-pink-100 text-pink-800 border-pink-200";
  };

  const renderGridLayout = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayedRecommendations?.map((recommendation) => (
        <div key={recommendation.product._id} className="relative">
          {showReason && recommendation.reason && (
            <div
              className={`absolute -top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getReasonColor(recommendation.reason)}`}
            >
              {getReasonIcon(recommendation.reason)}
              <span className="hidden sm:inline">{recommendation.reason}</span>
            </div>
          )}

          <ProductCard
            product={recommendation.product}
            showQuickView={true}
            showWishlist={true}
            showBadges={true}
            className={showReason && recommendation.reason ? "mt-4" : ""}
          />

          {recommendation.confidence && recommendation?.confidence > 0.8 && (
            <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              Perfect Match
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderCarouselLayout = () => (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {displayedRecommendations.map((recommendation) => (
          <div
            key={recommendation.product._id}
            className="min-w-[280px] relative"
          >
            {showReason && recommendation.reason && (
              <div
                className={`absolute -top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getReasonColor(recommendation.reason)}`}
              >
                {getReasonIcon(recommendation.reason)}
                <span>{recommendation.reason}</span>
              </div>
            )}

            <ProductCard
              product={recommendation.product}
              showQuickView={true}
              showWishlist={true}
              showBadges={true}
              className={showReason && recommendation.reason ? "mt-4" : ""}
            />

            {recommendation.confidence && recommendation.confidence > 0.8 && (
              <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                Perfect Match
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={className}>
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-pink-600" />
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
      )}

      {layout === "grid" && renderGridLayout()}
      {layout === "carousel" && renderCarouselLayout()}

      {/* Show More Link */}
      {maxItems && recommendations.length > maxItems && (
        <div className="text-center mt-8">
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
          >
            View All Recommendations
            <Sparkles className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductRecommendations;
