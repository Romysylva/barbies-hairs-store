/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useAuth } from "@/context/auth-context";
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Users,
  TrendingUp,
  DollarSign,
  Scissors,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Star,
  MessageSquare,
  CalendarDays,
  UserCheck,
  FileText,
} from "lucide-react";
import Image from "next/image";

// Mock booking data
const mockBookings = [
  {
    id: "BK-001",
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 123-4567",
      avatar: "/api/placeholder/40/40",
    },
    service: {
      name: "Hair Cut & Style",
      duration: 60,
      price: 85.0,
      category: "Hair Services",
    },
    staff: {
      name: "Emily Rodriguez",
      avatar: "/api/placeholder/40/40",
      specialties: ["Hair Cutting", "Styling"],
    },
    date: "2024-01-15",
    time: "10:00",
    status: "confirmed",
    notes: "Customer prefers shorter layers",
    createdAt: "2024-01-10T14:30:00Z",
    reminder: true,
  },
  {
    id: "BK-002",
    customer: {
      name: "Mike Davis",
      email: "mike@example.com",
      phone: "+1 (555) 987-6543",
      avatar: "/api/placeholder/40/40",
    },
    service: {
      name: "Hair Color Treatment",
      duration: 120,
      price: 150.0,
      category: "Color Services",
    },
    staff: {
      name: "Jessica Chen",
      avatar: "/api/placeholder/40/40",
      specialties: ["Hair Coloring", "Highlights"],
    },
    date: "2024-01-15",
    time: "14:00",
    status: "pending",
    notes: "First time color client, patch test completed",
    createdAt: "2024-01-12T09:15:00Z",
    reminder: false,
  },
  {
    id: "BK-003",
    customer: {
      name: "Emma Wilson",
      email: "emma@example.com",
      phone: "+1 (555) 456-7890",
      avatar: "/api/placeholder/40/40",
    },
    service: {
      name: "Deep Conditioning Treatment",
      duration: 45,
      price: 65.0,
      category: "Treatment Services",
    },
    staff: {
      name: "Maria Santos",
      avatar: "/api/placeholder/40/40",
      specialties: ["Hair Treatments", "Repair"],
    },
    date: "2024-01-16",
    time: "11:30",
    status: "completed",
    notes: "Regular client, loves keratin treatments",
    createdAt: "2024-01-14T16:45:00Z",
    reminder: true,
  },
  {
    id: "BK-004",
    customer: {
      name: "James Brown",
      email: "james@example.com",
      phone: "+1 (555) 321-0987",
      avatar: "/api/placeholder/40/40",
    },
    service: {
      name: "Men's Haircut",
      duration: 30,
      price: 35.0,
      category: "Hair Services",
    },
    staff: {
      name: "Alex Thompson",
      avatar: "/api/placeholder/40/40",
      specialties: ["Men's Cuts", "Beard Trimming"],
    },
    date: "2024-01-17",
    time: "09:00",
    status: "cancelled",
    notes: "Customer cancelled due to scheduling conflict",
    createdAt: "2024-01-13T11:20:00Z",
    reminder: false,
  },
];

const bookingStatuses = [
  "All",
  "confirmed",
  "pending",
  "completed",
  "cancelled",
  "no-show",
];

export default function BookingsPage() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatTime = (time: string) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(`2024-01-01T${time}:00`));
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          variant: "success" as const,
          icon: CheckCircle,
          text: "Confirmed",
        };
      case "pending":
        return { variant: "warning" as const, icon: Clock, text: "Pending" };
      case "completed":
        return {
          variant: "primary" as const,
          icon: CheckCircle,
          text: "Completed",
        };
      case "cancelled":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          text: "Cancelled",
        };
      case "no-show":
        return {
          variant: "destructive" as const,
          icon: AlertTriangle,
          text: "No Show",
        };
      default:
        return { variant: "secondary" as const, icon: Clock, text: status };
    }
  };

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.staff.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || booking.status === selectedStatus;
    const matchesDate = !selectedDate || booking.date === selectedDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate analytics
  const totalBookings = mockBookings.length;
  const totalRevenue = mockBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, booking) => sum + booking.service.price, 0);
  const confirmedBookings = mockBookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const todayBookings = mockBookings.filter(
    (b) => b.date === "2024-01-15"
  ).length;
  const completionRate = (
    (mockBookings.filter((b) => b.status === "completed").length /
      totalBookings) *
    100
  ).toFixed(1);

  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings((prev) =>
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const selectAllBookings = () => {
    setSelectedBookings(
      selectedBookings.length === filteredBookings.length
        ? []
        : filteredBookings.map((b) => b.id)
    );
  };

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<RefreshCw className="h-4 w-4" />}
      >
        Sync Calendar
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
        New Booking
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title="Booking Management"
      description="Manage appointments and scheduling"
      user={user}
      onLogout={logout}
      actions={actions}
      searchPlaceholder="Search bookings..."
    >
      {/* Booking Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalBookings}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">
                    +15% this month
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Revenue
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">
                    +18% this month
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
                  {`Today's Bookings`}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {todayBookings}
                </p>
                <div className="flex items-center mt-1">
                  <Clock className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-xs text-muted-foreground">
                    Scheduled for today
                  </span>
                </div>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {completionRate}%
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 text-success-500 mr-1" />
                  <span className="text-xs text-success-500">Above target</span>
                </div>
              </div>
              <UserCheck className="h-8 w-8 text-success-500" />
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
                <span>{confirmedBookings} Confirmed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-warning-500" />
                <span>
                  {mockBookings.filter((b) => b.status === "pending").length}{" "}
                  Pending
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 text-destructive" />
                <span>
                  {mockBookings.filter((b) => b.status === "cancelled").length}{" "}
                  Cancelled
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List View
              </Button>
              <Button
                variant={viewMode === "calendar" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                Calendar View
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
                placeholder="Search bookings, customers, or services..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {bookingStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "All"
                      ? "All Status"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Filter className="h-4 w-4" />}
              >
                More Filters
              </Button>
            </div>
          </div>

          {selectedBookings.length > 0 && (
            <div className="flex items-center justify-between mt-4 p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">
                {selectedBookings.length} booking(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Confirm Selected
                </Button>
                <Button variant="outline" size="sm">
                  Send Reminders
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBookings([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings List */}
      {viewMode === "list" && (
        <Card>
          <CardHeader
            title={`Bookings (${filteredBookings.length})`}
            description="Manage customer appointments and schedules"
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
                          selectedBookings.length === filteredBookings.length &&
                          filteredBookings.length > 0
                        }
                        onChange={selectAllBookings}
                        className="h-4 w-4"
                      />
                    </th>
                    <th className="text-left p-4 font-medium">Booking</th>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Service</th>
                    <th className="text-left p-4 font-medium">Staff</th>
                    <th className="text-left p-4 font-medium">Date & Time</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const statusConfig = getStatusConfig(booking.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={booking.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(booking.id)}
                            onChange={() => toggleBookingSelection(booking.id)}
                            className="h-4 w-4"
                          />
                        </td>

                        <td className="p-4">
                          <div>
                            <p className="font-medium text-sm">{booking.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.service.duration} min
                            </p>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Image
                              src={booking.customer.avatar}
                              alt={booking.customer.name}
                              className=" rounded-full object-cover"
                              width={32}
                              height={32}
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {booking.customer.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {booking.customer.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div>
                            <p className="font-medium text-sm">
                              {booking.service.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.service.category}
                            </p>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Image
                              src={booking.staff.avatar}
                              alt={booking.staff.name}
                              className=" rounded-full object-cover"
                              width={24}
                              height={24}
                            />
                            <span className="text-sm">
                              {booking.staff.name}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div>
                            <p className="font-medium text-sm">
                              {formatDate(booking.date)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(booking.time)}
                            </p>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-medium">
                            {formatCurrency(booking.service.price)}
                          </span>
                        </td>

                        <td className="p-4">
                          <Badge variant={statusConfig.variant} size="sm">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.text}
                          </Badge>
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

            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "No bookings have been made yet."}
                </p>
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Booking
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card>
          <CardHeader
            title="Calendar View"
            description="Visual booking schedule overview"
          />
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-medium">January 2024</h3>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Day
                </Button>
                <Button variant="primary" size="sm">
                  Week
                </Button>
                <Button variant="outline" size="sm">
                  Month
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 6; // Start from previous month
                const isCurrentMonth = day > 0 && day <= 31;
                const hasBookings =
                  isCurrentMonth && [15, 16, 17].includes(day);

                return (
                  <div
                    key={i}
                    className={`min-h-24 p-2 border rounded-lg ${
                      isCurrentMonth
                        ? "bg-background border-border hover:bg-muted/30 cursor-pointer"
                        : "bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {isCurrentMonth ? day : ""}
                    </div>
                    {hasBookings && isCurrentMonth && (
                      <div className="space-y-1">
                        {mockBookings
                          .filter((b) => new Date(b.date).getDate() === day)
                          .slice(0, 2)
                          .map((booking) => (
                            <div
                              key={booking.id}
                              className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                            >
                              {booking.time} - {booking.customer.name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Schedule Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader
            title="Staff Schedule"
            description="Today's staff assignments and availability"
          />
          <CardContent>
            <div className="space-y-4">
              {[
                "Emily Rodriguez",
                "Jessica Chen",
                "Maria Santos",
                "Alex Thompson",
              ].map((staff, index) => (
                <div
                  key={staff}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={`/api/placeholder/40/40`}
                      alt={staff}
                      className="rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                    <div>
                      <p className="font-medium text-sm">{staff}</p>
                      <p className="text-xs text-muted-foreground">
                        {
                          mockBookings.filter((b) => b.staff.name === staff)
                            .length
                        }{" "}
                        bookings today
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      Available
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Recent Activity"
            description="Latest booking updates and changes"
          />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Booking Confirmed</p>
                  <p className="text-xs text-muted-foreground">
                    {`Sarah Johnson's appointment confirmed for tomorrow`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 minutes ago
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Clock className="h-5 w-5 text-warning-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Reminder Sent</p>
                  <p className="text-xs text-muted-foreground">
                    Appointment reminder sent to Mike Davis
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    15 minutes ago
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Booking Cancelled</p>
                  <p className="text-xs text-muted-foreground">
                    James Brown cancelled his appointment
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 hour ago
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Plus className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New Booking</p>
                  <p className="text-xs text-muted-foreground">
                    Emma Wilson booked a deep conditioning treatment
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 hours ago
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
    </DashboardLayout>
  );
}
