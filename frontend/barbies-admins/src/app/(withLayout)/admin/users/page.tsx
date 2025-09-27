/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import { DashboardLayout } from "../../../../../../../shared/components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardContent,
} from "../../../../../../../shared/components/ui/Card";
import { Badge } from "../../../../../../../shared/components/ui/Badge";
import { Button } from "../../../../../../../shared/components/ui/Button";
import { Input } from "../../../../../../../shared/components/ui/Input";
import { useAuth } from "@/context/auth-context";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  UserPlus,
  UserX,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Crown,
  User,
  Settings,
  MoreVertical,
  TrendingUp,
  Clock,
  Star,
  ShoppingCart,
  MessageSquare,
  Ban,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Globe,
} from "lucide-react";
import Image from "next/image";

// Mock users data
const mockUsers = [
  {
    id: "USR-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    avatar: "/api/placeholder/40/40",
    role: "customer",
    status: "active",
    joinDate: "2024-01-10T00:00:00Z",
    lastLogin: "2024-01-15T14:30:00Z",
    totalOrders: 12,
    totalSpent: 890.45,
    location: "New York, NY",
    verified: true,
    loyaltyPoints: 1250,
    preferredServices: ["Hair Cutting", "Color Treatment"],
    notes: "VIP customer, prefers Emily as stylist",
  },
  {
    id: "USR-002",
    name: "Mike Davis",
    email: "mike.davis@email.com",
    phone: "+1 (555) 987-6543",
    avatar: "/api/placeholder/40/40",
    role: "customer",
    status: "active",
    joinDate: "2024-01-05T00:00:00Z",
    lastLogin: "2024-01-14T10:15:00Z",
    totalOrders: 8,
    totalSpent: 567.2,
    location: "Los Angeles, CA",
    verified: true,
    loyaltyPoints: 890,
    preferredServices: ["Men's Haircut"],
    notes: "Regular monthly appointments",
  },
  {
    id: "USR-003",
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    phone: "+1 (555) 456-7890",
    avatar: "/api/placeholder/40/40",
    role: "customer",
    status: "inactive",
    joinDate: "2023-12-15T00:00:00Z",
    lastLogin: "2024-01-01T09:20:00Z",
    totalOrders: 15,
    totalSpent: 1245.8,
    location: "Chicago, IL",
    verified: true,
    loyaltyPoints: 2100,
    preferredServices: ["Hair Treatments", "Styling"],
    notes: "Long-time customer, inactive recently",
  },
  {
    id: "USR-004",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@barbies.com",
    phone: "+1 (555) 111-2222",
    avatar: "/api/placeholder/40/40",
    role: "staff",
    status: "active",
    joinDate: "2023-06-01T00:00:00Z",
    lastLogin: "2024-01-15T15:45:00Z",
    totalOrders: 0,
    totalSpent: 0,
    location: "New York, NY",
    verified: true,
    loyaltyPoints: 0,
    preferredServices: [],
    notes: "Senior stylist, specializes in cutting and styling",
    permissions: ["manage_bookings", "view_customers", "update_services"],
  },
  {
    id: "USR-005",
    name: "Admin User",
    email: "admin@barbies.com",
    phone: "+1 (555) 000-0000",
    avatar: "/api/placeholder/40/40",
    role: "admin",
    status: "active",
    joinDate: "2023-01-01T00:00:00Z",
    lastLogin: "2024-01-15T16:00:00Z",
    totalOrders: 0,
    totalSpent: 0,
    location: "New York, NY",
    verified: true,
    loyaltyPoints: 0,
    preferredServices: [],
    notes: "System administrator",
    permissions: ["full_access"],
  },
  {
    id: "USR-006",
    name: "James Brown",
    email: "james.brown@email.com",
    phone: "+1 (555) 321-0987",
    avatar: "/api/placeholder/40/40",
    role: "customer",
    status: "suspended",
    joinDate: "2023-11-20T00:00:00Z",
    lastLogin: "2024-01-10T12:30:00Z",
    totalOrders: 3,
    totalSpent: 156.75,
    location: "Houston, TX",
    verified: false,
    loyaltyPoints: 120,
    preferredServices: ["Men's Haircut"],
    notes: "Account suspended due to policy violation",
  },
];

const userRoles = ["All", "customer", "staff", "admin"];
const userStatuses = ["All", "active", "inactive", "suspended"];

export default function UsersPage() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "admin":
        return { variant: "destructive" as const, icon: Crown, text: "Admin" };
      case "staff":
        return { variant: "primary" as const, icon: Shield, text: "Staff" };
      case "customer":
        return { variant: "secondary" as const, icon: User, text: "Customer" };
      default:
        return { variant: "secondary" as const, icon: User, text: role };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          variant: "success" as const,
          icon: CheckCircle,
          text: "Active",
        };
      case "inactive":
        return { variant: "warning" as const, icon: Clock, text: "Inactive" };
      case "suspended":
        return {
          variant: "destructive" as const,
          icon: Ban,
          text: "Suspended",
        };
      default:
        return { variant: "secondary" as const, icon: User, text: status };
    }
  };

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "All" || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate analytics
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter((u) => u.status === "active").length;
  const newUsersThisMonth = mockUsers.filter((u) => {
    const joinDate = new Date(u.joinDate);
    const currentDate = new Date();
    return (
      joinDate.getMonth() === currentDate.getMonth() &&
      joinDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;
  const totalCustomerSpent = mockUsers
    .filter((u) => u.role === "customer")
    .reduce((sum, user) => sum + user.totalSpent, 0);
  const averageCustomerValue =
    totalCustomerSpent / mockUsers.filter((u) => u.role === "customer").length;

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map((u) => u.id)
    );
  };

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<RefreshCw className="h-4 w-4" />}
      >
        Sync Users
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
        leftIcon={<UserPlus className="h-4 w-4" />}
      >
        Add User
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title="User Management"
      description="Manage customers, staff, and administrators"
      user={user}
      onLogout={logout}
      actions={actions}
      searchPlaceholder="Search users..."
    >
      {/* User Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalUsers}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">
                    +12% this month
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {activeUsers}
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">
                    {((activeUsers / totalUsers) * 100).toFixed(1)}% active
                  </span>
                </div>
              </div>
              <UserCheck className="h-8 w-8 text-success-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  New This Month
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {newUsersThisMonth}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">
                    +25% vs last month
                  </span>
                </div>
              </div>
              <UserPlus className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Customer Value
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(averageCustomerValue)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">
                    +8% this month
                  </span>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-blue-500" />
                <span>
                  {mockUsers.filter((u) => u.role === "customer").length}{" "}
                  Customers
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-500" />
                <span>
                  {mockUsers.filter((u) => u.role === "staff").length} Staff
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-red-500" />
                <span>
                  {mockUsers.filter((u) => u.role === "admin").length} Admins
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Ban className="h-4 w-4 text-orange-500" />
                <span>
                  {mockUsers.filter((u) => u.status === "suspended").length}{" "}
                  Suspended
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MessageSquare className="h-4 w-4" />}
              >
                Send Newsletter
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileText className="h-4 w-4" />}
              >
                User Report
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
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {userRoles.map((role) => (
                  <option key={role} value={role}>
                    {role === "All"
                      ? "All Roles"
                      : role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {userStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "All"
                      ? "All Status"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Filter className="h-4 w-4" />}
              >
                More Filters
              </Button>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between mt-4 p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Change Role
                </Button>
                <Button variant="outline" size="sm">
                  Send Message
                </Button>
                <Button variant="destructive" size="sm">
                  Suspend Users
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader
          title={`Users (${filteredUsers.length})`}
          description="Manage customer accounts, staff, and administrators"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={selectAllUsers}
                      className="h-4 w-4"
                    />
                  </th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Contact</th>
                  <th className="text-left p-4 font-medium">Orders</th>
                  <th className="text-left p-4 font-medium">Total Spent</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Last Login</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userData) => {
                  const roleConfig = getRoleConfig(userData.role);
                  const statusConfig = getStatusConfig(userData.status);
                  const RoleIcon = roleConfig.icon;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={userData.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(userData.id)}
                          onChange={() => toggleUserSelection(userData.id)}
                          className="h-4 w-4"
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={userData.avatar}
                            alt={userData.name}
                            className=" rounded-full object-cover"
                            width={40}
                            height={40}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">
                                {userData.name}
                              </p>
                              {userData.verified && (
                                <CheckCircle className="h-3 w-3 text-success-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {userData.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge variant={roleConfig.variant} size="sm">
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleConfig.text}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-32">
                              {userData.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Phone className="h-3 w-3" />
                            <span>{userData.phone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-center">
                          <p className="font-medium text-sm">
                            {userData.totalOrders}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            orders
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-center">
                          <p className="font-medium text-sm">
                            {formatCurrency(userData.totalSpent)}
                          </p>
                          {userData.loyaltyPoints > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {userData.loyaltyPoints} pts
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge variant={statusConfig.variant} size="sm">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.text}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <div className="text-sm">
                          <p>{formatDate(userData.lastLogin)}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{userData.location}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "No users have registered yet."}
              </p>
              <Button variant="primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader
            title="Top Customers"
            description="Highest value customers by total spending"
          />
          <CardContent>
            <div className="space-y-4">
              {mockUsers
                .filter((u) => u.role === "customer")
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 5)
                .map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-xs font-medium">
                        #{index + 1}
                      </div>
                      <Image
                        src={customer.avatar}
                        alt={customer.name}
                        className="rounded-full object-cover"
                        width={40}
                        height={40}
                      />
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.totalOrders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.loyaltyPoints} points
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Recent User Activity"
            description="Latest user registrations and activities"
          />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <UserPlus className="h-5 w-5 text-success-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New Registration</p>
                  <p className="text-xs text-muted-foreground">
                    Sarah Johnson joined as a new customer
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    5 minutes ago
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Account Verified</p>
                  <p className="text-xs text-muted-foreground">
                    Mike Davis verified his email address
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 hours ago
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">VIP Status Achieved</p>
                  <p className="text-xs text-muted-foreground">
                    Emma Wilson reached VIP customer status
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 day ago
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Ban className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Account Suspended</p>
                  <p className="text-xs text-muted-foreground">
                    {`James Brown's account suspended for policy violation`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 days ago
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" fullWidth>
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Demographics */}
      <Card className="mt-6">
        <CardHeader
          title="User Demographics"
          description="Geographic distribution and user insights"
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Location Distribution */}
            <div>
              <h4 className="font-medium mb-3">Top Locations</h4>
              <div className="space-y-3">
                {[
                  { location: "New York, NY", users: 2, percentage: 33.3 },
                  { location: "Los Angeles, CA", users: 1, percentage: 16.7 },
                  { location: "Chicago, IL", users: 1, percentage: 16.7 },
                  { location: "Houston, TX", users: 1, percentage: 16.7 },
                  { location: "Others", users: 1, percentage: 16.6 },
                ].map((item, index) => (
                  <div
                    key={item.location}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm">{item.location}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.users}</p>
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Distribution */}
            <div>
              <h4 className="font-medium mb-3">Role Distribution</h4>
              <div className="space-y-3">
                {[
                  {
                    role: "Customers",
                    count: mockUsers.filter((u) => u.role === "customer")
                      .length,
                    color: "bg-blue-500",
                  },
                  {
                    role: "Staff",
                    count: mockUsers.filter((u) => u.role === "staff").length,
                    color: "bg-green-500",
                  },
                  {
                    role: "Admins",
                    count: mockUsers.filter((u) => u.role === "admin").length,
                    color: "bg-red-500",
                  },
                ].map((item) => (
                  <div
                    key={item.role}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm">{item.role}</span>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Status */}
            <div>
              <h4 className="font-medium mb-3">Activity Status</h4>
              <div className="space-y-3">
                {[
                  {
                    status: "Active",
                    count: mockUsers.filter((u) => u.status === "active")
                      .length,
                    color: "bg-success-500",
                  },
                  {
                    status: "Inactive",
                    count: mockUsers.filter((u) => u.status === "inactive")
                      .length,
                    color: "bg-warning-500",
                  },
                  {
                    status: "Suspended",
                    count: mockUsers.filter((u) => u.status === "suspended")
                      .length,
                    color: "bg-destructive",
                  },
                ].map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm">{item.status}</span>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
