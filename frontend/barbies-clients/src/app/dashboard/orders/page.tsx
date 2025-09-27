"use client";
import React, { useState } from 'react';
import { DashboardLayout } from '../../../../../../shared/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../../../shared/components/ui/Card';
import { Badge } from '../../../../../../shared/components/ui/Badge';
import { Button } from '../../../../../../shared/components/ui/Button';
import { Input } from '../../../../../../shared/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  Package,
  Truck,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  CreditCard,
  Star
} from 'lucide-react';

// Mock user orders data
const mockUserOrders = [
  {
    _id: 'ORD-001',
    items: [
      { product: { name: 'Premium Hair Serum', slug: 'premium-hair-serum' }, quantity: 2, price: 39.99 },
      { product: { name: 'Hair Repair Mask', slug: 'hair-repair-mask' }, quantity: 1, price: 24.99 }
    ],
    totalAmount: 104.97,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-01-18',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  },
  {
    _id: 'ORD-002',
    items: [
      { product: { name: 'Professional Hair Dryer', slug: 'professional-hair-dryer' }, quantity: 1, price: 129.99 }
    ],
    totalAmount: 129.99,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'paypal',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    createdAt: '2024-01-10T08:20:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  },
  {
    _id: 'ORD-003',
    items: [
      { product: { name: 'Curl Defining Cream', slug: 'curl-defining-cream' }, quantity: 1, price: 34.99 }
    ],
    totalAmount: 34.99,
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    createdAt: '2024-01-16T14:15:00Z',
    updatedAt: '2024-01-16T14:15:00Z'
  },
];

export default function ClientOrdersPage() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredOrders = mockUserOrders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => 
                           item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'primary';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Confirmed';
      case 'processing': return 'Preparing Order';
      case 'shipped': return 'On the Way';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
        Download Invoice
      </Button>
      <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
        Refresh
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title="My Orders"
      description={`Track and manage your orders (${filteredOrders.length} orders)`}
      user={user}
      onLogout={logout}
      actions={actions}
      searchPlaceholder="Search orders..."
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search orders..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                className="input min-w-32"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <input
                type="date"
                className="input"
                placeholder="Date range"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order._id} className="hover:shadow-medium transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Order {order._id}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CreditCard className="h-3 w-3" />
                        {order.paymentMethod.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-xl text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(item.price)}</p>
                      <p className="text-xs text-muted-foreground">each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Tracking Number: {order.trackingNumber}</span>
                  </div>
                  {order.estimatedDelivery && (
                    <p className="text-xs text-muted-foreground">
                      Estimated delivery: {formatDate(order.estimatedDelivery)}
                    </p>
                  )}
                </div>
              )}

              {/* Shipping Address */}
              <div className="flex items-start gap-2 mb-4">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Shipping Address:</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  {order.status === 'delivered' && (
                    <Button variant="outline" size="sm" leftIcon={<Star className="h-4 w-4" />}>
                      Write Review
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button variant="outline" size="sm" leftIcon={<Truck className="h-4 w-4" />}>
                      Track Package
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                    Invoice
                  </Button>
                  {order.status === 'pending' && (
                    <Button variant="destructive" size="sm">
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search criteria.' 
                : "You haven't placed any orders yet. Start shopping to see your orders here!"
              }
            </p>
            <div className="flex justify-center gap-2">
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              ) : (
                <Button variant="primary" onClick={() => window.location.href = '/shop'}>
                  Start Shopping
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{mockUserOrders.length}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="h-10 w-10 bg-success-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Truck className="h-5 w-5 text-success-500" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {mockUserOrders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="h-10 w-10 bg-warning-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <RefreshCw className="h-5 w-5 text-warning-500" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {mockUserOrders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length}
            </p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <CreditCard className="h-5 w-5 text-secondary-foreground" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(mockUserOrders.reduce((total, order) => total + order.totalAmount, 0))}
            </p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
