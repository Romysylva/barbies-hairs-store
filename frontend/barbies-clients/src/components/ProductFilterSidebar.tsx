/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductFilter } from "../types";
import {
  ChevronDown,
  ChevronUp,
  Star,
  DollarSign,
  Package,
  Tag,
  Palette,
  Badge,
} from "lucide-react";
type SortBy =
  | "rating"
  | "relevance"
  | "price_low"
  | "price_high"
  | "newest"
  | "popularity";

interface ProductFilterSidebarProps {
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ id: string; name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    attributes: Record<string, Array<{ value: string; count: number }>>;
  };
  currentFilters: ProductFilter;
  onFilterChange: (filters: ProductFilter) => void;
}

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  facets,
  currentFilters,
  onFilterChange,
}) => {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") ?? "1");
  const rawSort = searchParams.get("sort");
  const allowedSorts: SortBy[] = [
    "rating",
    "relevance",
    "price_low",
    "price_high",
    "newest",
    "popularity",
  ];

  const sortBy: SortBy = allowedSorts.includes(rawSort as SortBy)
    ? (rawSort as SortBy)
    : "relevance";

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    categories: true,
    price: true,
    rating: true,
    availability: true,
    brands: false,
    attributes: false,
  });

  const [priceRange, setPriceRange] = useState({
    min: currentFilters.priceRange?.min || 0,
    max: currentFilters.priceRange?.max || 1000,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const categories = currentFilters.categories || [];
    const newCategories = checked
      ? [...categories, categoryId]
      : categories.filter((id) => id !== categoryId);

    onFilterChange({
      ...currentFilters,
      categories: newCategories,
      page,
      sortBy,
    });
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const brands = currentFilters.brands || [];
    const newBrands = checked
      ? [...brands, brandId]
      : brands.filter((id) => id !== brandId);

    onFilterChange({ ...currentFilters, brands: newBrands, page, sortBy });
  };

  const handleAttributeChange = (
    attributeName: string,
    value: string,
    checked: boolean
  ) => {
    const attributes = currentFilters.attributes || {};
    const currentValues = attributes[attributeName] || [];

    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);

    const newAttributes = {
      ...attributes,
      [attributeName]: newValues,
    };

    if (newValues.length === 0) {
      delete newAttributes[attributeName];
    }

    onFilterChange({
      ...currentFilters,
      attributes: newAttributes,
      page,
      sortBy,
    });
  };

  const handlePriceRangeChange = () => {
    onFilterChange({
      ...currentFilters,
      priceRange: { min: priceRange.min, max: priceRange.max },
      page,
      sortBy,
    });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({
      ...currentFilters,
      rating: currentFilters.rating === rating ? undefined : rating,
      page,
      sortBy,
    });
  };

  const handleAvailabilityChange = (
    type: "inStock" | "onSale",
    checked: boolean
  ) => {
    onFilterChange({
      ...currentFilters,
      [type]: checked ? true : undefined,
      page,
      sortBy,
    });
  };

  const handleClearAll = () => {
    onFilterChange({
      categories: [],
      brands: [],
      attributes: {},
      priceRange: undefined,
      rating: undefined,
      inStock: undefined,
      onSale: undefined,
      page: 1,
      sortBy: "relevance",
    });
    setPriceRange({ min: 0, max: 1000 });
  };

  const FilterSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    sectionKey: string;
    children: React.ReactNode;
    count?: number;
  }> = ({ title, icon, sectionKey, children, count }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="border-b border-gray-200 py-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-gray-900">{title}</span>
            {count !== undefined && (
              <span className="text-xs text-gray-500">({count})</span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {isExpanded && <div className="mt-3 space-y-2">{children}</div>}
      </div>
    );
  };

  const CheckboxOption: React.FC<{
    id: string;
    label: string;
    count?: number;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }> = ({ id, label, count, checked, onChange }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </label>
  );

  return (
    <div className="space-y-0">
      {/* Categories */}
      {facets?.categories?.length > 0 && (
        <FilterSection
          title="Categories"
          icon={<Tag className="h-4 w-4 text-gray-500" />}
          sectionKey="categories"
          count={facets.categories?.length}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {facets.categories?.map((category) => (
              <CheckboxOption
                key={category.id}
                id={category.id}
                label={category.name}
                count={category.count}
                checked={
                  currentFilters.categories?.includes(category.id) || false
                }
                onChange={(checked) =>
                  handleCategoryChange(category.id, checked)
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        icon={<DollarSign className="h-4 w-4 text-gray-500" />}
        sectionKey="price"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({
                  ...prev,
                  min: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({
                  ...prev,
                  max: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <button
            onClick={handlePriceRangeChange}
            className="w-full px-3 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 transition-colors"
          >
            Apply Price Filter
          </button>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {facets?.priceRanges.map((range) => (
              <button
                key={`${range.min}-${range.max}`}
                onClick={() => {
                  setPriceRange({ min: range.min, max: range.max });
                  onFilterChange({
                    ...currentFilters,
                    priceRange: { min: range.min, max: range.max },
                    page,
                    sortBy,
                  });
                }}
                className="px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ${range.min} - ${range.max} ({range.count})
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection
        title="Customer Rating"
        icon={<Star className="h-4 w-4 text-gray-500" />}
        sectionKey="rating"
      >
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`flex items-center gap-2 w-full p-2 rounded-md transition-colors ${
                currentFilters.rating === rating
                  ? "bg-pink-50 text-pink-600"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">& Up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection
        title="Availability"
        icon={<Package className="h-4 w-4 text-gray-500" />}
        sectionKey="availability"
      >
        <div className="space-y-2">
          <CheckboxOption
            id="inStock"
            label="In Stock"
            checked={currentFilters.inStock || false}
            onChange={(checked) => handleAvailabilityChange("inStock", checked)}
          />
          <CheckboxOption
            id="onSale"
            label="On Sale"
            checked={currentFilters.onSale || false}
            onChange={(checked) => handleAvailabilityChange("onSale", checked)}
          />
        </div>
      </FilterSection>

      {/* Brands */}
      {facets?.brands.length > 0 && (
        <FilterSection
          title="Brands"
          icon={<Badge className="h-4 w-4 text-gray-500" />}
          sectionKey="brands"
          count={facets.brands.length}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {facets.brands.map((brand) => (
              <CheckboxOption
                key={brand.id}
                id={brand.id}
                label={brand.name}
                count={brand.count}
                checked={currentFilters.brands?.includes(brand.id) || false}
                onChange={(checked) => handleBrandChange(brand.id, checked)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Product Attributes */}
      {facets?.attributes && Object.keys(facets.attributes).length > 0 && (
        <FilterSection
          title="Product Attributes"
          icon={<Palette className="h-4 w-4 text-gray-500" />}
          sectionKey="attributes"
        >
          <div className="space-y-4">
            {Object.entries(facets.attributes || {}).map(
              ([attributeName, values]) => (
                <div key={attributeName}>
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">
                    {attributeName.replace(/_/g, " ")}
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {values.map((attr) => (
                      <CheckboxOption
                        key={attr.value}
                        id={`${attributeName}-${attr.value}`}
                        label={attr.value}
                        count={attr.count}
                        checked={
                          currentFilters.attributes?.[attributeName]?.includes(
                            attr.value
                          ) || false
                        }
                        onChange={(checked) =>
                          handleAttributeChange(
                            attributeName,
                            attr.value,
                            checked
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </FilterSection>
      )}

      {/* ✅ Clear All Button */}
      <div className="pt-4">
        <button
          onClick={handleClearAll}
          className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilterSidebar;
