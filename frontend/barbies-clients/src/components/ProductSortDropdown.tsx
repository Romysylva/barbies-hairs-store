"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
  description?: string;
}

interface ProductSortDropdownProps {
  currentSort: string;
  onSortChange: (sortBy: string) => void;
  className?: string;
}

const sortOptions: SortOption[] = [
  { value: 'relevance', label: 'Best Match', description: 'Most relevant results' },
  { value: 'popularity', label: 'Popularity', description: 'Most popular products' },
  { value: 'rating', label: 'Customer Rating', description: 'Highest rated first' },
  { value: 'newest', label: 'Newest', description: 'Latest arrivals first' },
  { value: 'price_low', label: 'Price: Low to High', description: 'Cheapest products first' },
  { value: 'price_high', label: 'Price: High to Low', description: 'Most expensive first' },
  { value: 'name', label: 'Name A-Z', description: 'Alphabetical order' },
];

const ProductSortDropdown: React.FC<ProductSortDropdownProps> = ({
  currentSort,
  onSortChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentOption = sortOptions.find(option => option.value === currentSort) || sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortSelect = (sortValue: string) => {
    onSortChange(sortValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
      >
        <ArrowUpDown className="h-4 w-4" />
        <span>Sort: {currentOption.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
              Sort Options
            </div>
            
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  option.value === currentSort ? 'bg-pink-50 text-pink-600' : 'text-gray-900'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSortDropdown;
