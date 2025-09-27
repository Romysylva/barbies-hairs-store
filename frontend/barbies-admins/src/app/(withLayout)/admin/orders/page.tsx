"use client";
import React, { useState } from 'react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Truck,
  Package,
  DollarSign,
  Calendar,
  User,
  MapPin,
  MoreHorizontal,
  ShoppingCart,
  RefreshCw,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Phone,
  Mail,
  ArrowUpDown,
  Printer,
  Send
} from 'lucide-react';

// Mock orders data
const mockOrders = [
  {
    _id: 'ORD-001',
    user: { name: 'Sarah Johnson', email: 'sarah@example.com' },
    items: [
      { product: { name: 'Hair Serum' }, quantity: 2, price: 39.99 },
      { product: { name: 'Hair Mask' }, quantity: 1, price: 24.99 }
    ],
    totalAmount: 104.97,
    status: 'pending',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    _id: 'ORD-002',
    user: { name: 'Mike Davis', email: 'mike@example.com' },
    items: [
      { product: { name: 'Hair Dryer' }, quantity: 1, price: 129.99 }
    ],
    totalAmount: 129.99,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z'
  },
  {
    _id: 'ORD-003',
    user: { name: 'Emma Wilson', email: 'emma@example.com' },
    items: [
      { product: { name: 'Styling Kit' }, quantity: 1, price: 89.99 },
      { product: { name: 'Hair Oil' }, quantity: 2, price: 19.99 }
    ],
    totalAmount: 129.97,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    createdAt: '2024-01-12T11:45:00Z',
    updatedAt: '2024-01-14T16:30:00Z'
  },
  {
    _id: 'ORD-004',
    user: { name: 'John Smith', email: 'john@example.com' },
    items: [
      { product: { name: 'Curl Cream' }, quantity: 3, price: 34.99 }
    ],
    totalAmount: 104.97,
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingAddress: {
      street: '321 Elm St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    createdAt: '2024-01-11T08:30:00Z',
    updatedAt: '2024-01-12T14:20:00Z'
  },
];

export default function AdminOrdersPage() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchQuery.toLowerCase());
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
      hour: '2-digit',
      minute: '2-digit',
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

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'failed': return 'destructive';
      case 'refunded': return 'secondary';
      default: return 'secondary';
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(
      selectedOrders.length === filteredOrders.length
        ? []
        : filteredOrders.map(o => o._id)
    );
  };

  // Calculate analytics
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const shippedOrders = mockOrders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = mockOrders.filter(o => o.status === 'delivered').length;
  const averageOrderValue = totalRevenue / totalOrders;

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
        Sync Orders
      </Button>
      <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
        Export
      </Button>
      <Button variant="primary" size="sm" leftIcon={<FileText className="h-4 w-4" />}>
        Generate Report
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title="Orders Management"
      description={`Manage customer orders (${filteredOrders.length} orders)`}
      user={user}
      onLogout={logout}
      actions={actions}
      searchPlaceholder="Search orders..."
    >
      {/* Order Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">+8% this month</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">+12% this month</span>
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
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
                <div className="flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 text-warning-500 mr-1" />
                  <span className="text-xs text-warning-500">Need attention</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-warning-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(averageOrderValue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">+5% this month</span>
                </div>
              </div>
              <ArrowUpDown className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-warning-500" />
                <span>{pendingOrders} Pending</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-blue-500" />
                <span>{shippedOrders} Shipped</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success-500" />
                <span>{deliveredOrders} Delivered</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
                Sync Status
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>
                Print Labels
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search orders..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                className="input min-w-32"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select className="input min-w-32">
                <option value="">Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              <input
                type="date"
                className="input"
                placeholder="Date range"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Update Status
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length}
                      onChange={selectAllOrders}
                      className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    />
                  </th>
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Items</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleOrderSelection(order._id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{order._id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-sm">{order.user.name}</p>
                        <p className="text-xs text-muted-foreground">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, index) => (
                          <p key={index} className="text-xs text-muted-foreground">
                            {item.quantity}x {item.product.name}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{order.items.length - 2} more
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-sm">{formatCurrency(order.totalAmount)}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)} size="sm">
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
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

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="h-10 w-10 bg-warning-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="h-5 w-5 text-warning-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {mockOrders.filter(o => o.status === 'pending').length}
            </p>
            <p className="text-sm text-muted-foreground">Pending Orders</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {mockOrders.filter(o => o.status === 'shipped').length}
            </p>
            <p className="text-sm text-muted-foreground">Shipped Orders</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="h-10 w-10 bg-success-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="h-5 w-5 text-success-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {mockOrders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="text-sm text-muted-foreground">Delivered Orders</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="h-10 w-10 bg-success-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <DollarSign className="h-5 w-5 text-success-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(mockOrders.reduce((total, order) => total + order.totalAmount, 0))}
            </p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card className="text-center py-12 mt-6">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search criteria.' : 'No orders have been placed yet.'}
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="primary" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
