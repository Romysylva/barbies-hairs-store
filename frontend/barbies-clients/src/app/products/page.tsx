"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Product, ProductFilter, SearchResult } from "../../types";
import ProductCard from "../../components/ProductCard";
import ProductFilterSidebar from "../../components/ProductFilterSidebar";
import ProductSearchBar from "../../components/ProductSearchBar";
import ProductSortDropdown from "../../components/ProductSortDropdown";
import ProductViewToggle from "../../components/ProductViewToggle";
import Pagination from "../../components/Pagination";
import Breadcrumbs from "../../components/Breadcrumbs";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";

export type SortBy =
  | "rating"
  | "relevance"
  | "price_low"
  | "price_high"
  | "newest"
  | "popularity";

interface ProductCatalogProps {
  searchParams?: Record<string, string | undefined>;
}

const ProductCatalog: React.FC<ProductCatalogProps> = () => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const [filters, setFilters] = useState<ProductFilter>({
    page: 1,
    limit: 24,
    sortBy: "relevance",
  });

  // Parse search params only once per change
  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    const sortBy = (searchParams.get("sort") as SortBy) ?? "relevance";

    const newFilters: ProductFilter = {
      page,
      limit: 24,
      sortBy,
    };

    // ✅ Correct way: use .get()
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const view = searchParams.get("view");

    if (q) newFilters.search = q;
    if (category) newFilters.categories = [category];

    setFilters(newFilters);
    setCurrentPage(page);
    setViewMode((view as "grid" | "list") ?? "grid");
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append("q", filters.search);
        if (filters.categories?.length)
          queryParams.append("categories", filters.categories.join(","));
        if (filters.priceRange) {
          queryParams.append("price_min", filters.priceRange.min.toString());
          queryParams.append("price_max", filters.priceRange.max.toString());
        }
        if (filters.rating)
          queryParams.append("rating", filters.rating.toString());
        if (filters.inStock !== undefined)
          queryParams.append("in_stock", filters.inStock.toString());
        if (filters.onSale !== undefined)
          queryParams.append("on_sale", filters.onSale.toString());
        if (filters.brands?.length)
          queryParams.append("brands", filters.brands.join(","));
        if (filters.sortBy) queryParams.append("sort", filters.sortBy);
        if (filters.page) queryParams.append("page", filters.page.toString());
        if (filters.limit)
          queryParams.append("limit", filters.limit.toString());

        const response = await fetch(
          `http://localhost:8080/api/barbies/v1/products?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch products (status ${response.status})`
          );
        }

        const data: SearchResult = await response.json();

        setProducts(data.products || []);
        setSearchResult(data);
        setTotalProducts(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (newFilters: ProductFilter) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy: sortBy as SortBy, page: 1 }));
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query, page: 1 }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 24, sortBy: "relevance" });
    setCurrentPage(1);
  };

  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
    ];
    if (filters.categories?.length && searchResult?.facets?.categories) {
      const category = searchResult.facets.categories.find(
        (c) => c.id === filters.categories![0]
      );
      if (category) {
        items.push({
          label: category.name,
          href: `/products?category=${category.id}`,
        });
      }
    }
    return items;
  }, [filters.categories, searchResult]);

  const totalPages = Math.ceil(totalProducts / (filters.limit || 24));

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {filters.search
                  ? `Search Results for "${filters.search}"`
                  : "Products"}
              </h1>
              <p className="text-gray-600 mt-1">
                {loading
                  ? "Loading..."
                  : `${totalProducts.toLocaleString()} products found`}
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <ProductSearchBar
                onSearch={handleSearch}
                defaultValue={filters.search}
                placeholder="Search for hair products, tools, accessories..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  Clear All
                </button>
              </div>

              {searchResult && (
                <ProductFilterSidebar
                  facets={searchResult.facets}
                  currentFilters={filters}
                  onFilterChange={handleFilterChange}
                />
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>

                  {/* Active Filters */}
                  {(filters.search ||
                    filters.categories?.length ||
                    filters.priceRange) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Active filters:</span>
                      {filters.search && (
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded">
                          Search: {filters.search}
                        </span>
                      )}
                      {filters.categories?.map((categoryId) => {
                        const category = searchResult?.facets?.categories.find(
                          (c) => c.id === categoryId
                        );
                        return category ? (
                          <span
                            key={categoryId}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {category.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <ProductSortDropdown
                    currentSort={filters.sortBy || "relevance"}
                    onSortChange={handleSortChange}
                  />

                  {/* View Toggle */}
                  <ProductViewToggle
                    currentView={viewMode}
                    onViewChange={setViewMode}
                  />
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  {` Try adjusting your filters or search terms to find what you're
                  looking for.`}
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`
                  ${
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                `}
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      viewMode={viewMode}
                      showQuickView={true}
                      showWishlist={true}
                      showCompare={true}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      showPageNumbers={true}
                      showPrevNext={true}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recently Viewed Products */}
      {!loading && products.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recently Viewed
          </h2>
          {/* Recently viewed products will be implemented in the RecentlyViewed component */}
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
