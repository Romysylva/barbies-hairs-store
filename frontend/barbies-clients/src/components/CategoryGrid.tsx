"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '../types';
import { ArrowRight } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  showProductCount?: boolean;
  className?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  showProductCount = true,
  className = ''
}) => {
  if (categories.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">No categories available</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {categories.map((category) => (
        <Link
          key={category._id}
          href={`/products?category=${category.slug}`}
          className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          {/* Category Image */}
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={category.image || 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop'}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Hover Arrow */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className="h-4 w-4 text-gray-800" />
            </div>
          </div>

          {/* Category Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
              {category.name}
            </h3>
            
            {category.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {category.description}
              </p>
            )}
            
            {showProductCount && category.productCount !== undefined && (
              <p className="text-xs text-gray-500">
                {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
              </p>
            )}

            {/* Special indicators */}
            <div className="flex items-center gap-2 mt-2">
              {category.isFeatured && (
                <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                  Featured
                </span>
              )}
              
              {category.isNew && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  New
                </span>
              )}
              
              {category.discountPercentage && category.discountPercentage > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {category.discountPercentage}% off
                </span>
              )}
            </div>
          </div>

          {/* Sale Badge */}
          {category.discountPercentage && category.discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              SALE
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;
