"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  Award,
  TrendingUp,
  Eye,
} from "lucide-react";

import LoadingSpinner from "../../components/LoadingSpinner";
import OrderHistory from "../../components/OderHistoryPage";
import WishlistDisplay from "../../components/WishListDisplay";
import AddressBook from "../../components/AddressBook";
import PaymentMethods from "../../components/PaymentMethod";
import NotificationSettings from "../../components/NotificationSettings";
import ProfileSettings from "../../components/ProfileSettings";
import LoyaltyDashboard from "../../components/LoyaltyDashboard";
import RecentlyViewedProducts from "../../components/RecentlyViewedProducts";
import Image from "next/image";

type TabType =
  | "overview"
  | "orders"
  | "wishlist"
  | "addresses"
  | "payments"
  | "loyalty"
  | "notifications"
  | "settings";

const AccountDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(false);
  const [accountStats, setAccountStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    wishlistItems: 0,
    reviewsWritten: 0,
    joinDate: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/account");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch stats after login
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAccountStats();
    }
  }, [isAuthenticated, user]);

  const fetchAccountStats = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/user/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccountStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching account stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "loyalty", label: "Loyalty & Rewards", icon: Award },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  {user.photo ? (
                    <Image
                      src={user.photo}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Welcome back, {user.name}!
                  </h2>
                  <p className="text-pink-100">
                    Member since {new Date(user.createdAt).getFullYear()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Orders */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {accountStats.totalOrders}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              {/* Spent */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Spent
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${accountStats.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              {/* Loyalty */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Loyalty Points
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {user.loyaltyPoints.toLocaleString()}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              {/* Wishlist */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Wishlist Items
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {accountStats.wishlistItems}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-sm text-pink-600 hover:text-pink-700"
                  >
                    View All
                  </button>
                </div>
                <OrderHistory limit={3} showHeader={false} />
              </div>

              {/* Loyalty */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Loyalty Status
                  </h3>
                  <button
                    onClick={() => setActiveTab("loyalty")}
                    className="text-sm text-pink-600 hover:text-pink-700"
                  >
                    View Details
                  </button>
                </div>
                <LoyaltyDashboard compact />
              </div>
            </div>

            {/* Recently Viewed */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recently Viewed
                </h3>
                <Eye className="h-5 w-5 text-gray-400" />
              </div>
              <RecentlyViewedProducts limit={4} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab("orders")}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Package className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Track Orders
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("wishlist")}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className="h-6 w-6 text-red-600" />
                  <span className="text-sm font-medium text-gray-900">
                    My Wishlist
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Addresses
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Settings
                  </span>
                </button>
              </div>
            </div>
          </div>
        );

      case "orders":
        return <OrderHistory />;
      case "wishlist":
        return <WishlistDisplay />;
      case "addresses":
        return <AddressBook />;
      case "payments":
        return <PaymentMethods />;
      case "loyalty":
        return <LoyaltyDashboard />;
      case "notifications":
        return <NotificationSettings />;
      case "settings":
        return <ProfileSettings />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and view your activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-6">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-pink-50 text-pink-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    {user.photo ? (
                      <Image
                        src={user.photo ?? "/dafaults.png"}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                        width={100}
                        height={100}
                      />
                    ) : (
                      <User className="h-5 w-5 text-pink-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Tier Badge */}
                <div className="mt-3">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      user.tierLevel === "platinum"
                        ? "bg-gray-100 text-gray-800"
                        : user.tierLevel === "gold"
                          ? "bg-yellow-100 text-yellow-800"
                          : user.tierLevel === "silver"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    <Award className="h-3 w-3" />
                    <span className="capitalize">{user.tierLevel} Member</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
