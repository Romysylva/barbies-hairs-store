"use client";
import React from 'react';
import { Grid, List } from 'lucide-react';

interface ProductViewToggleProps {
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  className?: string;
}

const ProductViewToggle: React.FC<ProductViewToggleProps> = ({
  currentView,
  onViewChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center border border-gray-300 rounded-md overflow-hidden ${className}`}>
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 transition-colors ${
          currentView === 'grid'
            ? 'bg-pink-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        title="Grid view"
      >
        <Grid className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 transition-colors ${
          currentView === 'list'
            ? 'bg-pink-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ProductViewToggle;
