"use client";
import React from "react";
import Link from "next/link";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  User,
  Calendar,
  Activity,
  MessageSquare,
  FileText,
  Star,
  Bell,
} from "lucide-react";

// Emergency sidebar that bypasses all filtering - FOR DEBUGGING ONLY
const EmergencySidebar: React.FC = () => {
  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Chat", href: "/admin/chat", icon: MessageSquare },
    { name: "Activity Logs", href: "/admin/activity-logs", icon: Activity },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "white",
        borderRight: "1px solid #e5e7eb",
        width: "256px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            margin: "0",
            color: "#111827",
          }}
        >
          Emergency Sidebar
        </h2>
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            margin: "4px 0 0 0",
          }}
        >
          Debug Mode - No Filtering
        </p>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s",
              border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
            }}
          >
            <item.icon style={{ width: "20px", height: "20px" }} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User style={{ width: "16px", height: "16px", color: "white" }} />
          </div>
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "500",
                margin: "0",
                color: "#111827",
              }}
            >
              Emergency User
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: "0",
              }}
            >
              admin
            </p>
          </div>
        </div>

        <button
          onClick={() => console.log("Emergency logout")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "8px 12px",
            backgroundColor: "transparent",
            border: "1px solid #dc2626",
            borderRadius: "6px",
            color: "#dc2626",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <span>🚪</span>
          <span>Emergency Logout</span>
        </button>
      </div>
    </div>
  );
};

export default EmergencySidebar;
