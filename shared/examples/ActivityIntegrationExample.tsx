// Example: How to integrate Activity Logging into Admin Components
// This file demonstrates how to add activity tracking to existing admin components

"use client";
import React, { useState, useEffect } from 'react';
import { User, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import useActivityLogger, { usePageTracking, useFormTracking, useSearchTracking } from '../hooks/useActivityLogger';
import { ActivityUser } from '../types/activity';

// Mock user for demonstration
const mockCurrentUser: ActivityUser = {
  _id: 'admin_1',
  name: 'John Admin',
  email: 'john@barbies.com',
  role: 'admin'
};

// Example: Enhanced User Management Component with Activity Logging
const UserManagementWithLogging: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Activity logging hooks
  const {
    logUserCreated,
    logUserUpdated,
    logUserDeleted,
    logUserSuspended,
    logUserActivated,
    logBulkOperation,
    logDataExport,
    logUnauthorizedAccess
  } = useActivityLogger(mockCurrentUser);

  // Page and interaction tracking
  const { trackPageVisit, trackPageExit } = usePageTracking('User Management', mockCurrentUser);
  const { trackFormStart, trackFormSubmit } = useFormTracking('User Form', mockCurrentUser);
  const { trackSearch, trackFilterApplied } = useSearchTracking('User Management', mockCurrentUser);

  // Track page visit on component mount
  useEffect(() => {
    trackPageVisit();
    const startTime = Date.now();

    return () => {
      const timeSpent = Date.now() - startTime;
      trackPageExit(timeSpent);
    };
  }, [trackPageVisit, trackPageExit]);

  // Example: Create User with Activity Logging
  const handleCreateUser = async (userData: any) => {
    try {
      trackFormStart();

      // Simulate user creation
      const newUser = {
        _id: `user_${Date.now()}`,
        ...userData,
        createdAt: new Date().toISOString()
      };

      // Add to state
      setUsers(prev => [...prev, newUser]);

      // Log the activity
      await logUserCreated(
        newUser,
        mockCurrentUser,
        {
          user_data: userData,
          creation_method: 'admin_panel'
        }
      );

      trackFormSubmit(true);
    } catch (error) {
      trackFormSubmit(false, [error.message]);
      console.error('Failed to create user:', error);
    }
  };

  // Example: Update User with Activity Logging
  const handleUpdateUser = async (userId: string, updates: any, originalData: any) => {
    try {
      // Calculate what changed
      const changes: string[] = [];
      Object.keys(updates).forEach(key => {
        if (originalData[key] !== updates[key]) {
          changes.push(`${key}: "${originalData[key]}" → "${updates[key]}"`);
        }
      });

      // Update user in state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, ...updates } : user
      ));

      // Find the updated user
      const updatedUser = users.find(u => u._id === userId);
      if (updatedUser) {
        // Log the activity
        await logUserUpdated(
          { ...updatedUser, ...updates },
          mockCurrentUser,
          changes,
          {
            old_values: originalData,
            new_values: updates
          }
        );
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  // Example: Delete User with Activity Logging
  const handleDeleteUser = async (userId: string) => {
    try {
      const userToDelete = users.find(u => u._id === userId);
      if (!userToDelete) return;

      // Remove from state
      setUsers(prev => prev.filter(user => user._id !== userId));

      // Log the activity
      await logUserDeleted(
        userToDelete,
        mockCurrentUser,
        {
          deletion_method: 'admin_panel',
          user_data: userToDelete
        }
      );
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Example: Suspend User with Activity Logging
  const handleSuspendUser = async (userId: string, reason: string) => {
    try {
      const userToSuspend = users.find(u => u._id === userId);
      if (!userToSuspend) return;

      // Update user status
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, status: 'suspended', suspendedAt: new Date().toISOString() } : user
      ));

      // Log the security activity
      await logUserSuspended(
        userToSuspend,
        mockCurrentUser,
        reason,
        {
          suspension_method: 'admin_panel',
          previous_status: userToSuspend.status
        }
      );
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  // Example: Bulk Operations with Activity Logging
  const handleBulkSuspend = async (userIds: string[], reason: string) => {
    try {
      // Perform bulk operation
      setUsers(prev => prev.map(user => 
        userIds.includes(user._id) 
          ? { ...user, status: 'suspended', suspendedAt: new Date().toISOString() }
          : user
      ));

      // Log bulk operation
      await logBulkOperation(
        'suspend',
        'user',
        userIds,
        mockCurrentUser,
        {
          reason,
          suspension_method: 'bulk_admin_action'
        }
      );

      // Clear selection
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to bulk suspend users:', error);
    }
  };

  // Example: Search with Activity Logging
  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    
    // Filter users
    const filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );

    // Track search activity
    await trackSearch(query, filteredUsers.length);
  };

  // Example: Export Data with Activity Logging
  const handleExportUsers = async (format: 'csv' | 'json') => {
    try {
      // Simulate export
      const exportData = users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }));

      // Log data export
      await logDataExport(
        'users',
        exportData.length,
        mockCurrentUser,
        {
          export_format: format,
          export_filters: searchTerm ? { search: searchTerm } : undefined
        }
      );

      // Create and download file
      const blob = new Blob([
        format === 'json' 
          ? JSON.stringify(exportData, null, 2)
          : convertToCSV(exportData)
      ], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Example: Permission Check with Security Logging
  const checkPermission = async (action: string, targetUserId?: string) => {
    try {
      // Simulate permission check
      const hasPermission = mockCurrentUser.role === 'admin' || 
        (mockCurrentUser.role === 'manager' && action !== 'delete');

      if (!hasPermission) {
        // Log unauthorized access attempt
        await logUnauthorizedAccess(
          action,
          mockCurrentUser,
          {
            target_user_id: targetUserId,
            attempted_from: 'user_management_page'
          }
        );
        throw new Error('Insufficient permissions');
      }

      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      throw error;
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => `"${String(row[header]).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  // Example component render with integrated logging
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">User Management with Activity Logging</h2>
        
        {/* Search with tracking */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users..."
            className="input w-full"
          />
        </div>

        {/* Bulk actions with logging */}
        {selectedUsers.length > 0 && (
          <div className="mb-4 p-4 bg-accent/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span>{selectedUsers.length} users selected</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkSuspend(selectedUsers, 'Bulk suspension via admin panel')}
                  className="btn-outline btn-sm"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Suspend Selected
                </button>
                <button
                  onClick={() => handleExportUsers('csv')}
                  className="btn-outline btn-sm"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User actions with logging */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedUsers.includes('user_1')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers(prev => [...prev, 'user_1']);
                  } else {
                    setSelectedUsers(prev => prev.filter(id => id !== 'user_1'));
                  }
                }}
              />
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-muted-foreground">john.doe@example.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateUser('user_1', { status: 'active' }, { status: 'inactive' })}
                className="btn-outline btn-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </button>
              <button
                onClick={() => handleSuspendUser('user_1', 'Manual suspension from admin panel')}
                className="btn-outline btn-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Suspend
              </button>
              <button
                onClick={async () => {
                  await checkPermission('delete', 'user_1');
                  await handleDeleteUser('user_1');
                }}
                className="btn-outline btn-sm text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Guidelines */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Logging Integration Guidelines</h3>
        
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">1. Import the Hook</h4>
            <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs">
              import useActivityLogger from '../hooks/useActivityLogger';
            </code>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">2. Initialize in Component</h4>
            <code className="text-green-700 bg-green-100 px-2 py-1 rounded text-xs">
              const {"{logUserCreated, logUserUpdated, logUserDeleted}"} = useActivityLogger(currentUser);
            </code>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">3. Add Logging to Actions</h4>
            <code className="text-purple-700 bg-purple-100 px-2 py-1 rounded text-xs">
              await logUserCreated(newUser, currentUser, {"{metadata}"});
            </code>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">4. Track User Interactions</h4>
            <code className="text-orange-700 bg-orange-100 px-2 py-1 rounded text-xs">
              await trackSearch(query, resultCount);
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example: Product Management with Activity Logging
const ProductManagementWithLogging: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  
  const {
    logProductCreated,
    logProductUpdated,
    logProductDeleted,
    logInventoryUpdated,
    logBulkOperation
  } = useActivityLogger(mockCurrentUser);

  const handleCreateProduct = async (productData: any) => {
    try {
      const newProduct = {
        _id: `product_${Date.now()}`,
        ...productData,
        createdAt: new Date().toISOString()
      };

      setProducts(prev => [...prev, newProduct]);

      // Log product creation
      await logProductCreated(
        newProduct._id,
        newProduct.name,
        mockCurrentUser,
        {
          product_category: newProduct.category,
          initial_price: newProduct.price,
          initial_quantity: newProduct.quantity
        }
      );
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleUpdateInventory = async (productId: string, newQuantity: number) => {
    try {
      const product = products.find(p => p._id === productId);
      if (!product) return;

      const oldQuantity = product.quantity;
      
      // Update product in state
      setProducts(prev => prev.map(p => 
        p._id === productId ? { ...p, quantity: newQuantity } : p
      ));

      // Log inventory update
      await logInventoryUpdated(
        productId,
        oldQuantity,
        newQuantity,
        mockCurrentUser,
        {
          product_name: product.name,
          update_method: 'manual_adjustment'
        }
      );
    } catch (error) {
      console.error('Failed to update inventory:', error);
    }
  };

  const handleBulkUpdatePrices = async (productIds: string[], priceMultiplier: number) => {
    try {
      // Update products
      setProducts(prev => prev.map(product => 
        productIds.includes(product._id) 
          ? { ...product, price: product.price * priceMultiplier }
          : product
      ));

      // Log bulk operation
      await logBulkOperation(
        'price_update',
        'product',
        productIds,
        mockCurrentUser,
        {
          price_multiplier: priceMultiplier,
          operation_type: 'bulk_price_adjustment'
        }
      );
    } catch (error) {
      console.error('Failed to bulk update prices:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Product Management Examples</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleCreateProduct({
            name: 'Hair Treatment Kit',
            category: 'Treatment',
            price: 49.99,
            quantity: 100
          })}
          className="btn-primary"
        >
          Create Product (Logged)
        </button>
        
        <button
          onClick={() => handleUpdateInventory('product_1', 150)}
          className="btn-outline"
        >
          Update Inventory (Logged)
        </button>
        
        <button
          onClick={() => handleBulkUpdatePrices(['product_1', 'product_2'], 1.1)}
          className="btn-outline"
        >
          Bulk Price Update (Logged)
        </button>
      </div>
    </div>
  );
};

// Example: Order Management with Activity Logging
const OrderManagementWithLogging: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  
  const {
    logOrderCreated,
    logOrderUpdated,
    logOrderCancelled,
    logRefundProcessed
  } = useActivityLogger(mockCurrentUser);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) return;

      const oldStatus = order.status;
      
      // Update order in state
      setOrders(prev => prev.map(o => 
        o._id === orderId ? { ...o, status: newStatus } : o
      ));

      // Log order update
      await logOrderUpdated(
        orderId,
        oldStatus,
        newStatus,
        mockCurrentUser,
        {
          customer_id: order.customerId,
          order_total: order.total,
          status_change_reason: 'admin_update'
        }
      );
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleProcessRefund = async (orderId: string, amount: number, reason: string) => {
    try {
      // Process refund
      setOrders(prev => prev.map(o => 
        o._id === orderId 
          ? { ...o, status: 'refunded', refundAmount: amount, refundReason: reason }
          : o
      ));

      // Log refund processing
      await logRefundProcessed(
        orderId,
        amount,
        mockCurrentUser,
        {
          refund_reason: reason,
          refund_method: 'admin_panel'
        }
      );
    } catch (error) {
      console.error('Failed to process refund:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Order Management Examples</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleUpdateOrderStatus('order_1', 'shipped')}
          className="btn-primary"
        >
          Ship Order (Logged)
        </button>
        
        <button
          onClick={() => handleUpdateOrderStatus('order_2', 'cancelled')}
          className="btn-outline"
        >
          Cancel Order (Logged)
        </button>
        
        <button
          onClick={() => handleProcessRefund('order_3', 29.99, 'Customer request')}
          className="btn-outline"
        >
          Process Refund (Logged)
        </button>
      </div>
    </div>
  );
};

// Main example component
const ActivityIntegrationExample: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Activity Logging Integration Examples</h1>
        <p className="text-muted-foreground">
          This demonstrates how to integrate comprehensive activity logging into existing admin components.
        </p>
      </div>

      <UserManagementWithLogging />
      <ProductManagementWithLogging />
      <OrderManagementWithLogging />

      {/* Integration Checklist */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Integration Checklist</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Import useActivityLogger hook</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Initialize with current user context</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Add logging to CRUD operations</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Track user interactions (search, filters)</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Log bulk operations</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Track page visits and form interactions</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Log security events and errors</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Track data exports and sensitive operations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityIntegrationExample;
