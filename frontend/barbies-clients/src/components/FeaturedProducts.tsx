"use client";
import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Star, Award, TrendingUp } from 'lucide-react';

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'carousel' | 'mixed';
  showBadges?: boolean;
  className?: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  title,
  subtitle,
  layout = 'mixed',
  showBadges = true,
  className = ''
}) => {
  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">No featured products available</p>
      </div>
    );
  }

  const renderMixedLayout = () => {
    if (products.length < 3) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              showQuickView={true}
              showWishlist={true}
              showBadges={showBadges}
            />
          ))}
        </div>
      );
    }

    const mainProduct = products[0];
    const otherProducts = products.slice(1);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Featured Product */}
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-pink-600" />
              <span className="text-sm font-medium text-pink-600">Editor's Choice</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={mainProduct.images?.[0] || 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop'}
                  alt={mainProduct.name}
                  className="w-full h-full object-cover"
                />
                
                {mainProduct.discount && mainProduct.discount.percentage > 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    -{mainProduct.discount.percentage}%
                  </div>
                )}
              </div>
              
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {mainProduct.name}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {mainProduct.description}
                </p>
                
                {mainProduct.reviews?.average && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(mainProduct.reviews!.average)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({mainProduct.reviews.count} reviews)
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-6">
                  {mainProduct.discount ? (
                    <>
                      <span className="text-2xl font-bold text-gray-900">
                        ${mainProduct.discount.finalPrice.toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${mainProduct.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      ${mainProduct.price.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <ProductCard 
                  product={mainProduct} 
                  variant="minimal"
                  showQuickView={true}
                  showWishlist={true}
                  showBadges={false}
                  className="!bg-transparent !shadow-none !p-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Other Featured Products */}
        <div className="space-y-4">
          {otherProducts.slice(0, 3).map((product, index) => (
            <div key={product._id} className="relative bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-600">
                  #{index + 2} Trending
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square relative rounded-md overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&h=200&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h4>
                  
                  {product.reviews?.average && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">
                        {product.reviews.average.toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {product.discount ? (
                      <>
                        <span className="font-bold text-gray-900">
                          ${product.discount.finalPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGridLayout = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product._id} 
          product={product} 
          showQuickView={true}
          showWishlist={true}
          showBadges={showBadges}
        />
      ))}
    </div>
  );

  const renderCarouselLayout = () => (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((product) => (
          <div key={product._id} className="min-w-[280px]">
            <ProductCard 
              product={product} 
              showQuickView={true}
              showWishlist={true}
              showBadges={showBadges}
            />
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      {layout === 'mixed' && renderMixedLayout()}
      {layout === 'grid' && renderGridLayout()}
      {layout === 'carousel' && renderCarouselLayout()}
    </div>
  );
};

export default FeaturedProducts;
