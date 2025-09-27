"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  Clock,
  MessageSquare,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { useActivityLogger } from "@/shared/hooks/useActivityLogger";
import AdminApiService, {
  DashboardStats,
} from "@/shared/services/AdminApiService";
import AuthService from "@/shared/services/AuthService";
import { User } from "@/shared/components/types/index";

const AdminDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Get current user
  const currentUser = AuthService.getCurrentUser();
  const { logUserAction } = useActivityLogger(currentUser);

  const handleLogout = async () => {
    if (currentUser) {
      await logUserAction("admin.logout", currentUser, {
        logout_time: new Date().toISOString(),
        session_duration: "45 minutes",
      });
    }
    await AuthService.logout();
    window.location.href = "/login";
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await AdminApiService.getDashboardStats();

      if (response.success && response.data) {
        setDashboardStats(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.error || "Failed to load dashboard data");
        // Set fallback data
        setDashboardStats({
          totalRevenue: 0,
          totalOrders: 0,
          totalCustomers: 0,
          totalProducts: 0,
          pendingBookings: 0,
          activeChats: 0,
          securityAlerts: 0,
          systemHealth: 0,
          revenueGrowth: 0,
          ordersGrowth: 0,
          customersGrowth: 0,
          topProducts: [],
          recentActivities: [],
        });
      }
    } catch (err) {
      if (err instanceof Error)
        setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        loadDashboardData();
      },
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  // Fallback user if not authenticated
  const user = currentUser || {
    _id: "fallback",
    name: "Admin User",
    email: "admin@barbies.com",
    role: "admin" as const,
    photo: undefined,
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  // Show loading state
  if (loading && !dashboardStats) {
    return (
      <DashboardLayout
        title="Admin Dashboard"
        description="Loading dashboard data..."
        user={user}
        onLogout={handleLogout}
        className="bg-background"
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">
              Loading dashboard...
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboardStats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingBookings: 0,
    activeChats: 0,
    securityAlerts: 0,
    systemHealth: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    topProducts: [],
    recentActivities: [],
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      description={`Welcome back! Here's what's happening with your business today. Last updated: ${lastUpdated.toLocaleTimeString()}`}
      user={user}
      onLogout={handleLogout}
      className="bg-background"
      actions={
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="btn-outline btn-sm flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      }
    >
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Data Loading Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={loadDashboardData}
                className="btn-sm bg-red-600 text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {stats.revenueGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`font-medium ${stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {stats.revenueGrowth >= 0 ? "+" : ""}
                {stats.revenueGrowth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalOrders.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {stats.ordersGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`font-medium ${stats.ordersGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {stats.ordersGrowth >= 0 ? "+" : ""}
                {stats.ordersGrowth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalCustomers.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {stats.customersGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`font-medium ${stats.customersGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {stats.customersGrowth >= 0 ? "+" : ""}
                {stats.customersGrowth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalProducts.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Bookings
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.pendingBookings}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Chats
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.activeChats}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Security Alerts
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.securityAlerts}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  System Health
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.systemHealth}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Activities
            </h3>
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.type || "System Activity"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp || "Recently"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No recent activities
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Top Products
            </h3>
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {product.name || "Product"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.sales || 0} sales
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      ${(product.revenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No products data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
