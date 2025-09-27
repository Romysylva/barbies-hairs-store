/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, Category, ProductRecommendation } from "../types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { productService, categoryService } from "../services/api";
import ProductCard from "../components/ProductCard";
import { ProductSearchBar } from "../components/ProductSearchBar";
import CategoryGrid from "../components/CategoryGrid";
import HeroCarousel from "../components/HeroCarousel";
import FeaturedProducts from "../components/FeaturedProducts";
import ProductRecommendations from "../components/ProductRecommendations";
import NewsletterSignup from "../components/NewsletterSignup";
import TrustBadges from "../components/TrustBadges";
import RecentlyViewedProducts from "../components/RecentlyViewedProducts";
import LoadingSpinner from "../components/LoadingSpinner";
import Header from "../components/Header";
import {
  ArrowRight,
  Star,
  Truck,
  Shield,
  Gift,
  Clock,
  TrendingUp,
  Heart,
  Zap,
  Award,
  Users,
  ShoppingBag,
  Headphones,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { totalItems } = useCart();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [onSaleProducts, setOnSaleProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recommendations, setRecommendations] = useState<
    ProductRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState([
    {
      id: "1",
      title: "Transform Your Hair",
      subtitle: "Professional-grade hair care products for stunning results",
      image:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&h=600&fit=crop&utm_source=chatgpt.com=crop",
      cta: { text: "Shop Now", href: "/products" },
      offer: "Up to 30% off select items",
      darkOverlay: true,
    },
    {
      id: "2",
      title: "New Arrivals",
      subtitle: "Discover the latest innovations in hair care technology",
      image:
        "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&h=600&fit=crop",
      cta: { text: "Explore New", href: "/products?filter=new" },
      offer: "Free shipping on orders over $50",
      darkOverlay: true,
    },
    {
      id: "3",
      title: "Loyalty Rewards",
      subtitle: "Earn points with every purchase and unlock exclusive benefits",
      image:
        "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=600&fit=crop",
      cta: { text: "Join Now", href: "/register" },
      offer: "Get 500 bonus points when you sign up",
      darkOverlay: true,
    },
  ]);

  useEffect(() => {
    fetchHomePageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);

      // Use API services instead of direct fetch calls
      const [
        featured,
        bestsellers,
        newArrivalsData,
        discounted,
        categoriesData,
      ] = await Promise.allSettled([
        productService.getFeaturedProducts(),
        productService.getBestsellers(),
        productService.getNewArrivals(),
        productService.getDiscountedProducts(),
        categoryService.getAllCategories(),
      ]);

      if (featured.status === "fulfilled") {
        setFeaturedProducts(featured.value);
      }

      if (bestsellers.status === "fulfilled") {
        setBestSellers(bestsellers.value);
      }

      if (newArrivalsData.status === "fulfilled") {
        setNewArrivals(newArrivalsData.value);
      }

      if (discounted.status === "fulfilled") {
        setOnSaleProducts(discounted.value);
      }

      if (categoriesData.status === "fulfilled") {
        setCategories(categoriesData.value);
      }

      // TODO: Add recommendation service when available
      // if (isAuthenticated) {
      //   const recommendations = await recommendationService.getHomepageRecommendations();
      //   setRecommendations(recommendations);
      // }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    window.location.href = `/products?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} autoPlay={true} showDots={true} />

      {/* Search Bar Section */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Find Your Perfect Hair Care Products
            </h2>
            <p className="text-gray-600">
              Search from over 1,000 professional-grade products
            </p>
          </div>
          <ProductSearchBar
            onSearch={handleSearch}
            placeholder="Search for shampoos, conditioners, styling tools..."
            showSuggestions={true}
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated collections of hair care products,
              tools, and accessories
            </p>
          </div>

          <CategoryGrid categories={categories} />
        </div>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Featured Products
                </h2>
                <p className="text-gray-600">
                  Hand-picked favorites from our beauty experts
                </p>
              </div>
              <Link
                href="/products?featured=true"
                className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <FeaturedProducts products={featuredProducts} />
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      {isAuthenticated && recommendations.length > 0 && (
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Recommended for You{user?.name ? `, ${user.name}` : ""}
              </h2>
              <p className="text-gray-600">
                Based on your purchase history and preferences
              </p>
            </div>

            <ProductRecommendations
              recommendations={recommendations}
              showReason={true}
              title=""
            />
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {isAuthenticated && (
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RecentlyViewedProducts
              title="Continue Where You Left Off"
              limit={8}
              showViewCount={true}
            />
          </div>
        </div>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  Best Sellers
                </h2>
                <p className="text-gray-600">
                  Most popular products loved by our customers
                </p>
              </div>
              <Link
                href="/products?bestseller=true"
                className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showQuickView={true}
                  showWishlist={true}
                  showBadges={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Zap className="h-8 w-8 text-blue-600" />
                  New Arrivals
                </h2>
                <p className="text-gray-600">
                  Latest innovations in hair care and styling
                </p>
              </div>
              <Link
                href="/products?new=true"
                className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showQuickView={true}
                  showWishlist={true}
                  showBadges={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Special Offers */}
      {onSaleProducts.length > 0 && (
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Gift className="h-8 w-8 text-red-600" />
                  Special Offers
                </h2>
                <p className="text-gray-600">
                  {`  Limited time deals you don't want to miss`}
                </p>
              </div>
              <Link
                href="/products?on_sale=true"
                className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
              >
                View All Deals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {onSaleProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showQuickView={true}
                  showWishlist={true}
                  showBadges={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trust and Social Proof */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">50K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">1000+</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">4.8</div>
              <div className="text-gray-600 flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                Average Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>

          {/* Trust Badges */}
          <TrustBadges className="mb-12" />

          {/* Newsletter Signup */}
          <NewsletterSignup />
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {`Why Choose Barbie's Hair?`}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {` We're committed to providing you with the best hair care
              experience`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-200 transition-colors">
                <Truck className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Free Shipping
              </h3>
              <p className="text-gray-600 text-sm">
                Free shipping on all orders over $50. Fast and reliable delivery
                nationwide.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quality Guarantee
              </h3>
              <p className="text-gray-600 text-sm">
                100% authentic products with manufacturer warranty and
                satisfaction guarantee.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loyalty Rewards
              </h3>
              <p className="text-gray-600 text-sm">
                Earn points with every purchase and unlock exclusive discounts
                and perks.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Expert Support
              </h3>
              <p className="text-gray-600 text-sm">
                Get personalized advice from our hair care specialists and
                stylists.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Barbies Hair</h3>
              <p className="text-gray-400">
                Your trusted partner for premium hair products and styling
                solutions.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <a
                    href="/categories"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Categories
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/help"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="/returns"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Returns
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a
                    href="/size-guide"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Size Guide
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <p className="text-gray-400 mb-2">Email: info@barbieshair.com</p>
              <p className="text-gray-400 mb-2">Phone: (555) 123-4567</p>
              <p className="text-gray-400">Mon-Fri: 9AM-6PM EST</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Barbies Hair. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <LoadingSpinner size="large" />
            <p className="text-gray-600 mt-4 text-center">
              Loading amazing products...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import dynamic from "next/dynamic";
// import { Product, Category, ProductRecommendation } from "../types";
// import { useAuth } from "../context/AuthContext";
// import { useCart } from "../context/CartContext";
// import { productService, categoryService } from "../services/api";
// import Header from "../components/Header";
// import LoadingSpinner from "../components/LoadingSpinner";
// import ErrorBoundary from "../components/Error/ErrorBoundary";
// import {
//   ArrowRight,
//   TrendingUp,
//   Zap,
//   Gift,
//   Truck,
//   Shield,
//   Award,
//   Users,
//   Star,
// } from "lucide-react";

// // Lazy load heavy components
// const HeroCarousel = dynamic(() => import("../components/HeroCarousel"), {
//   loading: () => <div className="h-96 bg-gray-200 animate-pulse" />,
// });
// const ProductCard = dynamic(() => import("../components/ProductCard"));
// const CategoryGrid = dynamic(() => import("../components/CategoryGrid"));
// const FeaturedProducts = dynamic(
//   () => import("../components/FeaturedProducts")
// );
// const ProductRecommendations = dynamic(
//   () => import("../components/ProductRecommendations")
// );
// const NewsletterSignup = dynamic(
//   () => import("../components/NewsletterSignup")
// );
// const TrustBadges = dynamic(() => import("../components/TrustBadges"));
// const RecentlyViewedProducts = dynamic(
//   () => import("../components/RecentlyViewedProducts")
// );
// const ProductSearchBar = dynamic(
//   () => import("../components/ProductSearchBar")
// );

// // Types for better type safety
// interface HomePageData {
//   featuredProducts: Product[];
//   bestSellers: Product[];
//   newArrivals: Product[];
//   onSaleProducts: Product[];
//   categories: Category[];
// }

// interface LoadingState {
//   isLoading: boolean;
//   error: string | null;
// }

// // Constants moved outside component
// const HERO_SLIDES = [
//   {
//     id: "1",
//     title: "Transform Your Hair",
//     subtitle: "Professional-grade hair care products for stunning results",
//     image:
//       "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&h=600&fit=crop",
//     cta: { text: "Shop Now", href: "/products" },
//     offer: "Up to 30% off select items",
//     darkOverlay: true,
//   },
//   {
//     id: "2",
//     title: "New Arrivals",
//     subtitle: "Discover the latest innovations in hair care technology",
//     image:
//       "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&h=600&fit=crop",
//     cta: { text: "Explore New", href: "/products?filter=new" },
//     offer: "Free shipping on orders over $50",
//     darkOverlay: true,
//   },
//   {
//     id: "3",
//     title: "Loyalty Rewards",
//     subtitle: "Earn points with every purchase and unlock exclusive benefits",
//     image:
//       "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=600&fit=crop",
//     cta: { text: "Join Now", href: "/register" },
//     offer: "Get 500 bonus points when you sign up",
//     darkOverlay: true,
//   },
// ] as const;

// const BENEFITS = [
//   {
//     icon: Truck,
//     title: "Free Shipping",
//     description:
//       "Free shipping on all orders over $50. Fast and reliable delivery nationwide.",
//     bgColor: "bg-pink-100",
//     hoverColor: "group-hover:bg-pink-200",
//     iconColor: "text-pink-600",
//   },
//   {
//     icon: Shield,
//     title: "Quality Guarantee",
//     description:
//       "100% authentic products with manufacturer warranty and satisfaction guarantee.",
//     bgColor: "bg-green-100",
//     hoverColor: "group-hover:bg-green-200",
//     iconColor: "text-green-600",
//   },
//   {
//     icon: Award,
//     title: "Loyalty Rewards",
//     description:
//       "Earn points with every purchase and unlock exclusive discounts and perks.",
//     bgColor: "bg-blue-100",
//     hoverColor: "group-hover:bg-blue-200",
//     iconColor: "text-blue-600",
//   },
//   {
//     icon: Users,
//     title: "Expert Support",
//     description:
//       "Get personalized advice from our hair care specialists and stylists.",
//     bgColor: "bg-purple-100",
//     hoverColor: "group-hover:bg-purple-200",
//     iconColor: "text-purple-600",
//   },
// ] as const;

// // Custom hooks for better separation of concerns
// function useHomePageData() {
//   const { isAuthenticated, user } = useAuth();
//   const [data, setData] = useState<HomePageData>({
//     featuredProducts: [],
//     bestSellers: [],
//     newArrivals: [],
//     onSaleProducts: [],
//     categories: [],
//   });
//   const [recommendations, setRecommendations] = useState<
//     ProductRecommendation[]
//   >([]);
//   const [loadingState, setLoadingState] = useState<LoadingState>({
//     isLoading: true,
//     error: null,
//   });

//   const fetchData = useCallback(async () => {
//     try {
//       setLoadingState({ isLoading: true, error: null });

//       const [
//         featured,
//         bestsellers,
//         newArrivalsData,
//         discounted,
//         categoriesData,
//       ] = await Promise.allSettled([
//         productService.getFeaturedProducts(),
//         productService.getBestsellers(),
//         productService.getNewArrivals(),
//         productService.getDiscountedProducts(),
//         categoryService.getAllCategories(),
//       ]);

//       const newData: HomePageData = {
//         featuredProducts: featured.status === "fulfilled" ? featured.value : [],
//         bestSellers:
//           bestsellers.status === "fulfilled" ? bestsellers.value : [],
//         newArrivals:
//           newArrivalsData.status === "fulfilled" ? newArrivalsData.value : [],
//         onSaleProducts:
//           discounted.status === "fulfilled" ? discounted.value : [],
//         categories:
//           categoriesData.status === "fulfilled" ? categoriesData.value : [],
//       };

//       setData(newData);

//       // Handle failed requests
//       const failedRequests = [
//         featured,
//         bestsellers,
//         newArrivalsData,
//         discounted,
//         categoriesData,
//       ].filter((result) => result.status === "rejected");

//       if (failedRequests.length > 0) {
//         console.warn(
//           `${failedRequests.length} requests failed:`,
//           failedRequests
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching homepage data:", error);
//       setLoadingState({
//         isLoading: false,
//         error: "Failed to load page data. Please refresh to try again.",
//       });
//       return;
//     }

//     setLoadingState({ isLoading: false, error: null });
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData, isAuthenticated, user?.id]); // More specific dependency

//   return { ...data, recommendations, loadingState, refetch: fetchData };
// }

// // Memoized components for better performance
// const ProductSection = React.memo(
//   ({
//     title,
//     subtitle,
//     products,
//     viewAllHref,
//     icon: Icon,
//     iconColor = "text-pink-600",
//   }: {
//     title: string;
//     subtitle: string;
//     products: Product[];
//     viewAllHref: string;
//     icon?: React.ComponentType<{ className?: string }>;
//     iconColor?: string;
//   }) => (
//     <div className="py-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//               {Icon && <Icon className={`h-8 w-8 ${iconColor}`} />}
//               {title}
//             </h2>
//             <p className="text-gray-600">{subtitle}</p>
//           </div>
//           <a
//             href={viewAllHref}
//             className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1 transition-colors"
//             aria-label={`View all ${title.toLowerCase()}`}
//           >
//             View All
//             <ArrowRight className="h-4 w-4" />
//           </a>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {products.map((product) => (
//             <ProductCard
//               key={product._id}
//               product={product}
//               showQuickView={true}
//               showWishlist={true}
//               showBadges={true}
//               priority={false} // For lazy loading
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// );

// ProductSection.displayName = "ProductSection";

// const StatsSection = React.memo(() => (
//   <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
//     {[
//       { value: "50K+", label: "Happy Customers" },
//       { value: "1000+", label: "Products" },
//       {
//         value: "4.8",
//         label: (
//           <div className="text-gray-600 flex items-center justify-center gap-1">
//             <Star className="h-4 w-4 text-yellow-400 fill-current" />
//             Average Rating
//           </div>
//         ),
//       },
//       { value: "24/7", label: "Customer Support" },
//     ].map((stat, index) => (
//       <div key={index} className="text-center">
//         <div className="text-3xl font-bold text-pink-600 mb-2">
//           {stat.value}
//         </div>
//         <div className="text-gray-600">{stat.label}</div>
//       </div>
//     ))}
//   </div>
// ));

// StatsSection.displayName = "StatsSection";

// const BenefitsSection = React.memo(() => (
//   <div className="py-12 bg-white">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="text-center mb-10">
//         <h2 className="text-3xl font-bold text-gray-900 mb-4">
//           {`Why Choose Barbie's Hair?`}
//         </h2>
//         <p className="text-gray-600 max-w-2xl mx-auto">
//           {`We're committed to providing you with the best hair care experience`}
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//         {BENEFITS.map((benefit, index) => {
//           const Icon = benefit.icon;
//           return (
//             <div key={index} className="text-center group">
//               <div
//                 className={`w-16 h-16 ${benefit.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 ${benefit.hoverColor} transition-colors`}
//               >
//                 <Icon className={`h-8 w-8 ${benefit.iconColor}`} />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 {benefit.title}
//               </h3>
//               <p className="text-gray-600 text-sm">{benefit.description}</p>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   </div>
// ));

// BenefitsSection.displayName = "BenefitsSection";

// export default function Home() {
//   const router = useRouter();
//   const { user, isAuthenticated } = useAuth();
//   const { totalItems } = useCart();

//   const {
//     featuredProducts,
//     bestSellers,
//     newArrivals,
//     onSaleProducts,
//     categories,
//     recommendations,
//     loadingState,
//     refetch,
//   } = useHomePageData();

//   // Memoize search handler
//   const handleSearch = useCallback(
//     (query: string) => {
//       router.push(`/products?q=${encodeURIComponent(query)}`);
//     },
//     [router]
//   );

//   // Memoize computed values
//   const hasProducts = useMemo(
//     () => ({
//       featured: featuredProducts.length > 0,
//       bestSellers: bestSellers.length > 0,
//       newArrivals: newArrivals.length > 0,
//       onSale: onSaleProducts.length > 0,
//     }),
//     [
//       featuredProducts.length,
//       bestSellers.length,
//       newArrivals.length,
//       onSaleProducts.length,
//     ]
//   );

//   // Error state
//   if (loadingState.error) {
//     return (
//       <div className="min-h-screen bg-white">
//         <Header />
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="text-center">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">
//               Oops! Something went wrong
//             </h2>
//             <p className="text-gray-600 mb-6">{loadingState.error}</p>
//             <button
//               onClick={refetch}
//               className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <ErrorBoundary>
//       <div className="min-h-screen bg-white">
//         <Header />

//         {/* Hero Carousel */}
//         <HeroCarousel slides={HERO_SLIDES} autoPlay={true} showDots={true} />

//         {/* Search Bar Section */}
//         <section className="bg-gray-50 py-8" aria-label="Product search">
//           <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-6">
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                 Find Your Perfect Hair Care Products
//               </h2>
//               <p className="text-gray-600">
//                 Search from over 1,000 professional-grade products
//               </p>
//             </div>
//             <ProductSearchBar
//               onSearch={handleSearch}
//               placeholder="Search for shampoos, conditioners, styling tools..."
//               showSuggestions={true}
//               className="max-w-2xl mx-auto"
//             />
//           </div>
//         </section>

//         {/* Categories Section */}
//         <section className="py-12 bg-white" aria-label="Product categories">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-10">
//               <h2 className="text-3xl font-bold text-gray-900 mb-4">
//                 Shop by Category
//               </h2>
//               <p className="text-gray-600 max-w-2xl mx-auto">
//                 Discover our carefully curated collections of hair care
//                 products, tools, and accessories
//               </p>
//             </div>
//             <CategoryGrid categories={categories} />
//           </div>
//         </section>

//         {/* Featured Products */}
//         {hasProducts.featured && (
//           <section className="bg-gray-50" aria-label="Featured products">
//             <FeaturedProducts products={featuredProducts} />
//           </section>
//         )}

//         {/* Personalized Recommendations */}
//         {isAuthenticated && recommendations.length > 0 && (
//           <section className="py-12 bg-white" aria-label="Recommended products">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               <div className="text-center mb-8">
//                 <h2 className="text-3xl font-bold text-gray-900 mb-2">
//                   Recommended for You{user?.name ? `, ${user.name}` : ""}
//                 </h2>
//                 <p className="text-gray-600">
//                   Based on your purchase history and preferences
//                 </p>
//               </div>
//               <ProductRecommendations
//                 recommendations={recommendations}
//                 showReason={true}
//                 title=""
//               />
//             </div>
//           </section>
//         )}

//         {/* Recently Viewed */}
//         {isAuthenticated && (
//           <section
//             className="py-12 bg-gray-50"
//             aria-label="Recently viewed products"
//           >
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               <RecentlyViewedProducts
//                 title="Continue Where You Left Off"
//                 limit={8}
//                 showViewCount={true}
//               />
//             </div>
//           </section>
//         )}

//         {/* Product Sections */}
//         {hasProducts.bestSellers && (
//           <section className="bg-white" aria-label="Best selling products">
//             <ProductSection
//               title="Best Sellers"
//               subtitle="Most popular products loved by our customers"
//               products={bestSellers}
//               viewAllHref="/products?bestseller=true"
//               icon={TrendingUp}
//               iconColor="text-green-600"
//             />
//           </section>
//         )}

//         {hasProducts.newArrivals && (
//           <section className="bg-gray-50" aria-label="New arrival products">
//             <ProductSection
//               title="New Arrivals"
//               subtitle="Latest innovations in hair care and styling"
//               products={newArrivals}
//               viewAllHref="/products?new=true"
//               icon={Zap}
//               iconColor="text-blue-600"
//             />
//           </section>
//         )}

//         {hasProducts.onSale && (
//           <section className="bg-white" aria-label="Special offer products">
//             <ProductSection
//               title="Special Offers"
//               subtitle="Limited time deals you don't want to miss"
//               products={onSaleProducts}
//               viewAllHref="/products?on_sale=true"
//               icon={Gift}
//               iconColor="text-red-600"
//             />
//           </section>
//         )}

//         {/* Trust and Social Proof */}
//         <section
//           className="py-12 bg-gray-50"
//           aria-label="Company statistics and trust badges"
//         >
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <StatsSection />
//             <TrustBadges className="mb-12" />
//             <NewsletterSignup />
//           </div>
//         </section>

//         {/* Benefits Section */}
//         <BenefitsSection />

//         {/* Footer */}
//         <footer className="bg-gray-900 text-white py-12">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//               <div>
//                 <h3 className="text-xl font-bold mb-4">Barbies Hair</h3>
//                 <p className="text-gray-400">
//                   Your trusted partner for premium hair products and styling
//                   solutions.
//                 </p>
//               </div>
//               <div>
//                 <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
//                 <ul className="space-y-2">
//                   {[
//                     { href: "/products", label: "Products" },
//                     { href: "/categories", label: "Categories" },
//                     { href: "/about", label: "About Us" },
//                     { href: "/contact", label: "Contact" },
//                   ].map((link) => (
//                     <li key={link.href}>
//                       <a
//                         href={link.href}
//                         className="text-gray-400 hover:text-white transition-colors"
//                       >
//                         {link.label}
//                       </a>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
//                 <ul className="space-y-2">
//                   {[
//                     { href: "/help", label: "Help Center" },
//                     { href: "/returns", label: "Returns" },
//                     { href: "/shipping", label: "Shipping Info" },
//                     { href: "/size-guide", label: "Size Guide" },
//                   ].map((link) => (
//                     <li key={link.href}>
//                       <a
//                         href={link.href}
//                         className="text-gray-400 hover:text-white transition-colors"
//                       >
//                         {link.label}
//                       </a>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
//                 <address className="text-gray-400 not-italic">
//                   <p className="mb-2">Email: info@barbieshair.com</p>
//                   <p className="mb-2">Phone: (555) 123-4567</p>
//                   <p>Mon-Fri: 9AM-6PM EST</p>
//                 </address>
//               </div>
//             </div>
//             <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
//               <p>&copy; 2025 Barbies Hair. All rights reserved.</p>
//             </div>
//           </div>
//         </footer>

//         {/* Loading State */}
//         {loadingState.isLoading && (
//           <div
//             className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
//             role="dialog"
//             aria-label="Loading"
//           >
//             <div className="bg-white rounded-lg p-6 shadow-xl">
//               <LoadingSpinner size="large" />
//               <p className="text-gray-600 mt-4 text-center">
//                 Loading amazing products...
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </ErrorBoundary>
//   );
// }
