"use client";
import React from "react";
import Link from "next/link";
import { DashboardLayout } from "../../../../../shared/components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardContent,
} from "../../../../../shared/components/ui/Card";
import { Badge } from "../../../../../shared/components/ui/Badge";
import { Button } from "../../../../../shared/components/ui/Button";
import { ProductCard } from "../../../../../shared/components/product/ProductCard";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingCart,
  Heart,
  Package,
  Star,
  CreditCard,
  Truck,
  Eye,
  ArrowRight,
  Gift,
} from "lucide-react";

// Mock data
const mockUserStats = {
  totalOrders: 12,
  totalSpent: 1234.56,
  wishlistItems: 8,
  rewardPoints: 450,
};

const mockRecentOrders = [
  {
    _id: "1",
    items: [{ product: { name: "Hair Serum" }, quantity: 1 }],
    totalAmount: 49.99,
    status: "shipped",
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    _id: "2",
    items: [{ product: { name: "Hair Dryer" }, quantity: 1 }],
    totalAmount: 129.99,
    status: "delivered",
    createdAt: "2024-01-05T00:00:00Z",
  },
];

const mockRecommendedProducts = [
  {
    _id: "1",
    name: "Hair Repair Mask",
    description: "Deep conditioning mask for damaged hair",
    category: {
      _id: "1",
      name: "Hair Care",
      slug: "hair-care",
      createdAt: "",
      updatedAt: "",
    },
    price: 29.99,
    priceDiscount: 24.99,
    images: ["/api/placeholder/300/300"],
    imageCover: "/api/placeholder/300/300",
    ratingsAverage: 4.7,
    ratingsQuantity: 234,
    quantity: 89,
    sold: 567,
    featured: false,
    bestseller: true,
    newArrival: false,
    slug: "hair-repair-mask",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "2",
    name: "Curl Defining Cream",
    description: "Enhance and define natural curls",
    category: {
      _id: "1",
      name: "Hair Care",
      slug: "hair-care",
      createdAt: "",
      updatedAt: "",
    },
    price: 34.99,
    images: ["/api/placeholder/300/300"],
    imageCover: "/api/placeholder/300/300",
    ratingsAverage: 4.3,
    ratingsQuantity: 156,
    quantity: 45,
    sold: 234,
    featured: false,
    bestseller: false,
    newArrival: true,
    slug: "curl-defining-cream",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
];

export default function ClientDashboard() {
  const { user, logout } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Package className="h-4 w-4" />}
      >
        Track Order
      </Button>
      <Button
        variant="primary"
        size="sm"
        leftIcon={<ShoppingCart className="h-4 w-4" />}
      >
        Continue Shopping
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(" ")[0]}!`}
      description="Here's an overview of your account activity"
      user={user}
      onLogout={logout}
      actions={actions}
      searchPlaceholder="Search products..."
      roles={user?.roles || []}
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Hello {user?.name}! 👋
                </h2>
                <p className="text-muted-foreground">
                  You have {mockUserStats.rewardPoints} reward points to use on
                  your next purchase.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <Gift className="h-8 w-8 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Rewards</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {mockUserStats.totalOrders}
                </p>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(mockUserStats.totalSpent)}
                </p>
              </div>
              <div className="h-10 w-10 bg-success-500/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-success-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Wishlist Items
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {mockUserStats.wishlistItems}
                </p>
              </div>
              <div className="h-10 w-10 bg-warning-500/10 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-warning-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Reward Points
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {mockUserStats.rewardPoints}
                </p>
              </div>
              <div className="h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Gift className="h-5 w-5 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Recent Orders</h3>
                <p className="text-sm text-muted-foreground">
                  Your latest purchases
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {order.items[0].product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={getStatusBadgeVariant(order.status)}
                          size="sm"
                        >
                          {order.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Button variant="ghost" size="sm" className="text-xs mt-1">
                      Track
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {mockRecentOrders.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  No orders yet
                </p>
                <Link href="/shop">
                  <Button variant="primary" size="sm">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Recommended for You</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your purchase history
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecommendedProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-muted-foreground mb-1">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(product.ratingsAverage)
                                ? "text-warning-500 fill-current"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.ratingsQuantity})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {formatCurrency(product.priceDiscount || product.price)}
                    </p>
                    {product.priceDiscount && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(product.price)}
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="mt-2">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="text-center p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <CardContent>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Track Orders</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Monitor your order status and delivery
            </p>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm" fullWidth>
                View Orders
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="text-center p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <CardContent>
            <div className="h-12 w-12 bg-warning-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="h-6 w-6 text-warning-500" />
            </div>
            <h3 className="font-medium mb-1">Wishlist</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Save products for later purchase
            </p>
            <Link href="/dashboard/wishlist">
              <Button variant="outline" size="sm" fullWidth>
                View Wishlist
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="text-center p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <CardContent>
            <div className="h-12 w-12 bg-success-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="h-6 w-6 text-success-500" />
            </div>
            <h3 className="font-medium mb-1">Payment Methods</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Manage your payment options
            </p>
            <Link href="/dashboard/payments">
              <Button variant="outline" size="sm" fullWidth>
                Manage Cards
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
