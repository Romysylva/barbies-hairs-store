"use client";
import React from 'react';
import Link from 'next/link';
import { Clock, Eye, ArrowRight, X } from 'lucide-react';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import ProductCard from './ProductCard';

interface RecentlyViewedProductsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewCount?: boolean;
  layout?: 'grid' | 'carousel';
  showClearAll?: boolean;
  className?: string;
}

const RecentlyViewedProducts: React.FC<RecentlyViewedProductsProps> = ({
  title = "Recently Viewed",
  subtitle,
  limit = 8,
  showViewCount = false,
  layout = 'carousel',
  showClearAll = true,
  className = ''
}) => {
  const { 
    recentlyViewed, 
    clearRecentlyViewed, 
    removeFromRecentlyViewed 
  } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  const displayedProducts = recentlyViewed.slice(0, limit);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your recently viewed products?')) {
      clearRecentlyViewed();
    }
  };

  const renderGridLayout = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayedProducts.map((item) => (
        <div key={item.product._id} className="relative group">
          {showViewCount && item.viewCount > 1 && (
            <div className="absolute -top-2 -right-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {item.viewCount}
            </div>
          )}
          
          <ProductCard 
            product={item.product}
            showQuickView={true}
            showWishlist={true}
            showBadges={true}
          />
          
          <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(item.lastViewed)}
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              removeFromRecentlyViewed(item.product._id);
            }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-all duration-200"
            title="Remove from recently viewed"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );

  const renderCarouselLayout = () => (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {displayedProducts.map((item) => (
          <div key={item.product._id} className="min-w-[280px] relative group">
            {showViewCount && item.viewCount > 1 && (
              <div className="absolute -top-2 -right-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {item.viewCount}
              </div>
            )}
            
            <ProductCard 
              product={item.product}
              showQuickView={true}
              showWishlist={true}
              showBadges={true}
            />
            
            <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(item.lastViewed)}
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                removeFromRecentlyViewed(item.product._id);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-all duration-200"
              title="Remove from recently viewed"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {recentlyViewed.length > limit && (
            <Link 
              href="/recently-viewed"
              className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1 text-sm"
            >
              View All ({recentlyViewed.length})
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          
          {showClearAll && (
            <button
              onClick={handleClearAll}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {layout === 'grid' && renderGridLayout()}
      {layout === 'carousel' && renderCarouselLayout()}
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default RecentlyViewedProducts;
