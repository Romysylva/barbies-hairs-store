"use client";
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  showPrevNext = true,
  showFirstLast = false,
  maxVisiblePages = 7,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible range
      const start = Math.max(2, currentPage - Math.floor((maxVisiblePages - 4) / 2));
      const end = Math.min(totalPages - 1, currentPage + Math.floor((maxVisiblePages - 4) / 2));
      
      // Add ellipsis if needed before start
      if (start > 2) {
        pages.push('ellipsis');
      }
      
      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed after end
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  const PageButton: React.FC<{
    page: number;
    isActive?: boolean;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    'aria-label'?: string;
  }> = ({ page, isActive, onClick, disabled, children, 'aria-label': ariaLabel }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:z-10 ${
        isActive
          ? 'bg-pink-600 text-white border-pink-600 z-10'
          : disabled
          ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      } ${
        isActive ? 'border' : 'border border-r-0 last:border-r'
      }`}
    >
      {children}
    </button>
  );

  return (
    <nav className={`flex items-center justify-center ${className}`} aria-label="Pagination">
      <div className="flex items-center">
        {/* First page button */}
        {showFirstLast && currentPage > 3 && (
          <>
            <PageButton
              page={1}
              onClick={() => onPageChange(1)}
              aria-label="Go to first page"
            >
              First
            </PageButton>
            <span className="mx-2">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </span>
          </>
        )}

        {/* Previous button */}
        {showPrevNext && (
          <PageButton
            page={currentPage - 1}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </PageButton>
        )}

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="flex">
            {visiblePages.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 border-r-0 last:border-r"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                );
              }
              
              return (
                <PageButton
                  key={page}
                  page={page}
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </PageButton>
              );
            })}
          </div>
        )}

        {/* Next button */}
        {showPrevNext && (
          <PageButton
            page={currentPage + 1}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Go to next page"
          >
            <span className="mr-1 hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </PageButton>
        )}

        {/* Last page button */}
        {showFirstLast && currentPage < totalPages - 2 && (
          <>
            <span className="mx-2">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </span>
            <PageButton
              page={totalPages}
              onClick={() => onPageChange(totalPages)}
              aria-label="Go to last page"
            >
              Last
            </PageButton>
          </>
        )}
      </div>

      {/* Page info */}
      <div className="ml-6 text-sm text-gray-700">
        Page <span className="font-medium">{currentPage}</span> of{' '}
        <span className="font-medium">{totalPages}</span>
      </div>
    </nav>
  );
};

export default Pagination;
