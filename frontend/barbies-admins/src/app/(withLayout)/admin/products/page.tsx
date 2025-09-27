/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { ProductCard } from "@/shared/components/product/ProductCard";
import { useAuth } from "@/shared/contexts/AuthContext";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  Upload,
  Grid3X3,
  List,
  MoreVertical,
  Star,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-react";

// Mock products data
const mockProducts = [
  {
    _id: "1",
    name: "Premium Hair Serum",
    description: "Nourishing serum for damaged hair",
    category: {
      _id: "1",
      name: "Hair Care",
      slug: "hair-care",
      createdAt: "",
      updatedAt: "",
    },
    price: 49.99,
    priceDiscount: 39.99,
    discountPercentage: 20,
    images: ["/api/placeholder/300/300"],
    imageCover: "/api/placeholder/300/300",
    ratingsAverage: 4.5,
    ratingsQuantity: 89,
    quantity: 150,
    sold: 89,
    featured: true,
    bestseller: false,
    newArrival: false,
    slug: "premium-hair-serum",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "2",
    name: "Professional Hair Dryer",
    description: "High-performance hair dryer with ionic technology",
    category: {
      _id: "2",
      name: "Styling Tools",
      slug: "styling-tools",
      createdAt: "",
      updatedAt: "",
    },
    price: 129.99,
    ratingsAverage: 4.8,
    ratingsQuantity: 156,
    quantity: 45,
    sold: 234,
    featured: false,
    bestseller: true,
    newArrival: false,
    slug: "professional-hair-dryer",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "3",
    name: "Hair Styling Kit",
    description: "Complete kit for professional hair styling",
    category: {
      _id: "2",
      name: "Styling Tools",
      slug: "styling-tools",
      createdAt: "",
      updatedAt: "",
    },
    price: 89.99,
    ratingsAverage: 4.2,
    ratingsQuantity: 67,
    quantity: 0,
    sold: 156,
    featured: false,
    bestseller: false,
    newArrival: true,
    slug: "hair-styling-kit",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
];

export default function AdminProductsPage() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProducts(
      selectedProducts.length === filteredProducts.length
        ? []
        : filteredProducts.map((p) => p._id)
    );
  };

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

  const getProductStatus = (product: any) => {
    if (product.quantity === 0) {
      return {
        status: "out-of-stock",
        variant: "destructive" as const,
        icon: XCircle,
      };
    } else if (product.quantity <= 10) {
      return {
        status: "low-stock",
        variant: "warning" as const,
        icon: AlertCircle,
      };
    } else {
      return {
        status: "in-stock",
        variant: "success" as const,
        icon: CheckCircle,
      };
    }
  };

  // Calculate analytics
  const totalProducts = mockProducts.length;
  const activeProducts = mockProducts.filter((p) => p.quantity > 0).length;
  const lowStockProducts = mockProducts.filter(
    (p) => p.quantity > 0 && p.quantity <= 10
  ).length;
  const outOfStockProducts = mockProducts.filter(
    (p) => p.quantity === 0
  ).length;
  const totalRevenue = mockProducts.reduce(
    (sum, p) => sum + p.sold * (p.priceDiscount || p.price),
    0
  );
  const averageRating =
    mockProducts.reduce((sum, p) => sum + p.ratingsAverage, 0) /
    mockProducts.length;

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<BarChart3 className="h-4 w-4" />}
      >
        Analytics
      </Button>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Upload className="h-4 w-4" />}
      >
        Import
      </Button>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Download className="h-4 w-4" />}
      >
        Export
      </Button>
      <Button
        variant="primary"
        size="sm"
        leftIcon={<Plus className="h-4 w-4" />}
      >
        Add Product
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title="Products Management"
      description={`Manage your product catalog (${filteredProducts.length} products)`}
      user={user}
      onLogout={logout}
      actions={actions}
      searchPlaceholder="Search products..."
    >
      {/* Product Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalProducts}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">
                    +5 this month
                  </span>
                </div>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">
                    +12% vs last month
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-success-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Low Stock Alert
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {lowStockProducts}
                </p>
                <div className="flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 text-warning-500 mr-1" />
                  <span className="text-xs text-warning-500">
                    Need restocking
                  </span>
                </div>
              </div>
              <AlertCircle className="h-8 w-8 text-warning-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {averageRating.toFixed(1)}
                </p>
                <div className="flex items-center mt-1">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  <span className="text-xs text-muted-foreground">
                    Across all products
                  </span>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success-500" />
                <span>{activeProducts} Active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-warning-500" />
                <span>{lowStockProducts} Low Stock</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 text-destructive" />
                <span>{outOfStockProducts} Out of Stock</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Sync Inventory
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<BarChart3 className="h-4 w-4" />}
              >
                View Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search products..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <select className="input min-w-32">
                <option value="">All Categories</option>
                <option value="hair-care">Hair Care</option>
                <option value="styling-tools">Styling Tools</option>
              </select>

              <select className="input min-w-24">
                <option value="">Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>

              <div className="flex border border-border rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 text-sm ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 text-sm ${viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {selectedProducts.length} product
                  {selectedProducts.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Bulk Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                    Delete Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="relative">
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product._id)}
                  onChange={() => toggleProductSelection(product._id)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
              </div>

              <ProductCard
                product={product}
                linkPrefix="/admin/products"
                showQuickActions={false}
                className="pt-8"
              />

              {/* Admin Actions */}
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products Table View */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={
                          selectedProducts.length === filteredProducts.length
                        }
                        onChange={selectAllProducts}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                    </th>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-left p-4 font-medium">Stock</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => toggleProductSelection(product._id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-48">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{product.category.name}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            ${product.priceDiscount || product.price}
                          </span>
                          {product.priceDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                              ${product.price}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{product.quantity}</span>
                          {product.quantity === 0 && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {product.quantity > 0 ? (
                            <Badge variant="success" size="sm">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" size="sm">
                              Out of Stock
                            </Badge>
                          )}
                          {product.featured && (
                            <Badge variant="primary" size="sm">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No products found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search criteria."
                : "Get started by adding your first product."}
            </p>
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              Add Product
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
