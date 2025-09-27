/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { SearchSuggestion } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import Image from "next/image";

interface ProductSearchBarProps {
  onSearch: (query: string) => void;
  defaultValue?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  className?: string;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  onSearch,
  defaultValue = "",
  placeholder = "Search for products...",
  showSuggestions = true,
  showRecentSearches = true,
  className = "",
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches on mount
  useEffect(() => {
    if (showRecentSearches) {
      loadRecentSearches();
    }
  }, [showRecentSearches]);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.trim() && showSuggestions) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, showSuggestions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    try {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const updated = [
        trimmed,
        ...recentSearches.filter((s) => s !== trimmed),
      ].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const performSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    onSearch(trimmed);
    saveRecentSearch(trimmed);
    setShowDropdown(false);
    setSelectedIndex(-1);
    searchRef.current?.blur();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "product") {
      // Navigate to product page
      window.location.href = `/products/${suggestion.id}`;
    } else {
      performSearch(suggestion.text);
    }
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    performSearch(searchQuery);
  };

  const clearQuery = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedIndex(-1);
    searchRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems =
      suggestions.length + (showRecentSearches ? recentSearches.length : 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else {
            const recentIndex = selectedIndex - suggestions.length;
            handleRecentSearchClick(recentSearches[recentIndex]);
          }
        } else {
          performSearch(query);
        }
        break;

      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const shouldShowDropdown =
    showDropdown &&
    (suggestions.length > 0 || (recentSearches.length > 0 && !query.trim()));

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-500 border-t-transparent"></div>
            </div>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                    index === selectedIndex
                      ? "bg-pink-50 text-pink-600"
                      : "text-gray-900"
                  }`}
                >
                  {suggestion.type === "product" && suggestion.image && (
                    <Image
                      src={suggestion.image}
                      alt={suggestion.text}
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                      width={36}
                      height={36}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {suggestion.text}
                    </div>
                    {suggestion.type === "product" && suggestion.price && (
                      <div className="text-sm text-gray-500">
                        ${suggestion.price.toFixed(2)}
                      </div>
                    )}
                    {suggestion.type !== "product" && (
                      <div className="text-xs text-gray-400 capitalize">
                        {suggestion.type}
                      </div>
                    )}
                  </div>

                  {suggestion.type === "query" && (
                    <TrendingUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {showRecentSearches && recentSearches.length > 0 && !query.trim() && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b flex items-center justify-between">
                <span>Recent Searches</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-pink-600 hover:text-pink-700 normal-case"
                >
                  Clear
                </button>
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleRecentSearchClick(search)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                    suggestions.length + index === selectedIndex
                      ? "bg-pink-50 text-pink-600"
                      : "text-gray-900"
                  }`}
                >
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query.trim() && suggestions.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No suggestions found for "{query}"</p>
              <p className="text-sm mt-1">Press Enter to search anyway</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchBar;
