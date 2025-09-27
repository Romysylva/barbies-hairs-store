"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { SidebarLoginWidget } from "../auth/SidebarLoginWidget";
import { User } from "../../types/User";

// Emergency CSS fallback in case Tailwind classes don't load
const emergencyStyles = `
  .sidebar-nav { display: flex; flex-direction: column; height: 100%; padding: 1rem; }
  .sidebar-nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem; margin: 0.25rem 0; border-radius: 0.5rem; text-decoration: none; }
  .sidebar-nav-item:hover { background-color: #f3f4f6; }
  .sidebar-nav-item.active { background-color: #3b82f6; color: white; }
  .sidebar-icon { width: 1.25rem; height: 1.25rem; }
  .sidebar-text { flex: 1; }
`;

// Inject emergency styles if needed
if (
  typeof document !== "undefined" &&
  !document.getElementById("sidebar-emergency-styles")
) {
  const style = document.createElement("style");
  style.id = "sidebar-emergency-styles";
  style.textContent = emergencyStyles;
  document.head.appendChild(style);
}
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  // User,
  Heart,
  CreditCard,
  Truck,
  Tag,
  Star,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Building,
  DollarSign,
  FileText,
  Shield,
  Calendar,
  Activity,
  MessageSquare,
  UserCheck,
  ClipboardList,
  PlusCircle,
  Search,
  Filter,
  Archive,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: ("admin" | "manager" | "user")[];
  children?: SidebarItem[];
  badge?: number;
}

interface SidebarProps {
  user: User | null;
  onLogout: () => Promise<void>;
  isCollapsed?: boolean;
  className?: string;
}

const adminNavItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
    roles: ["admin", "manager"],
  },

  // Main Management Sections
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    roles: ["admin", "manager"],
    children: [
      {
        name: "All Products",
        href: "/admin/products",
        icon: Package,
        roles: ["admin", "manager"],
      },
      {
        name: "Add Product",
        href: "/admin/products/add",
        icon: PlusCircle,
        roles: ["admin", "manager"],
      },
      {
        name: "Categories",
        href: "/admin/categories",
        icon: Tag,
        roles: ["admin", "manager"],
      },
      {
        name: "Inventory",
        href: "/admin/products/inventory",
        icon: ClipboardList,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    roles: ["admin", "manager"],
    children: [
      {
        name: "All Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        roles: ["admin", "manager"],
      },
      {
        name: "Pending",
        href: "/admin/orders?status=pending",
        icon: Clock,
        roles: ["admin", "manager"],
      },
      {
        name: "Processing",
        href: "/admin/orders?status=processing",
        icon: Activity,
        roles: ["admin", "manager"],
      },
      {
        name: "Shipped",
        href: "/admin/orders?status=shipped",
        icon: Truck,
        roles: ["admin", "manager"],
      },
      {
        name: "Refunds",
        href: "/admin/orders/refunds",
        icon: DollarSign,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    name: "Bookings",
    href: "/admin/bookings",
    icon: Calendar,
    roles: ["admin", "manager"],
    children: [
      {
        name: "All Bookings",
        href: "/admin/bookings",
        icon: Calendar,
        roles: ["admin", "manager"],
      },
      {
        name: "Today",
        href: "/admin/bookings?date=today",
        icon: Clock,
        roles: ["admin", "manager"],
      },
      {
        name: "Calendar View",
        href: "/admin/bookings/calendar",
        icon: Calendar,
        roles: ["admin", "manager"],
      },
      {
        name: "Staff Schedule",
        href: "/admin/bookings/schedule",
        icon: UserCheck,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
    children: [
      {
        name: "All Users",
        href: "/admin/users",
        icon: Users,
        roles: ["admin"],
      },
      {
        name: "Customers",
        href: "/admin/users?role=user",
        icon: Users,
        roles: ["admin"],
      },
      {
        name: "Staff",
        href: "/admin/users?role=staff",
        icon: UserCheck,
        roles: ["admin"],
      },
      {
        name: "Administrators",
        href: "/admin/users?role=admin",
        icon: Shield,
        roles: ["admin"],
      },
    ],
  },

  // Communication & Monitoring
  {
    name: "Chat",
    href: "/admin/chat",
    icon: MessageSquare,
    roles: ["admin", "manager"],
    badge: 3,
  },
  {
    name: "Marketing",
    href: "/admin/marketing",
    icon: TrendingUp,
    roles: ["admin", "manager"],
  },
  {
    name: "Finance",
    href: "/admin/finance",
    icon: DollarSign,
    roles: ["admin"],
  },
  {
    name: "Activity Logs",
    href: "/admin/activity-logs",
    icon: Activity,
    roles: ["admin"],
    children: [
      {
        name: "All Activities",
        href: "/admin/activity-logs",
        icon: Activity,
        roles: ["admin"],
      },
      {
        name: "Security Alerts",
        href: "/admin/activity-logs?type=security_alert",
        icon: AlertTriangle,
        roles: ["admin"],
      },
      {
        name: "User Actions",
        href: "/admin/activity-logs?type=user_action",
        icon: Users,
        roles: ["admin"],
      },
      {
        name: "System Events",
        href: "/admin/activity-logs?type=system_event",
        icon: Activity,
        roles: ["admin"],
      },
    ],
  },

  // Reports & Analytics
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["admin", "manager"],
    children: [
      {
        name: "Overview",
        href: "/admin/analytics",
        icon: BarChart3,
        roles: ["admin", "manager"],
      },
      {
        name: "Sales Analytics",
        href: "/admin/analytics/sales",
        icon: TrendingUp,
        roles: ["admin", "manager"],
      },
      {
        name: "User Analytics",
        href: "/admin/analytics/users",
        icon: Users,
        roles: ["admin", "manager"],
      },
      {
        name: "Performance",
        href: "/admin/analytics/performance",
        icon: Activity,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: FileText,
    roles: ["admin", "manager"],
    children: [
      {
        name: "Sales Reports",
        href: "/admin/reports/sales",
        icon: DollarSign,
        roles: ["admin", "manager"],
      },
      {
        name: "Customer Reports",
        href: "/admin/reports/customers",
        icon: Users,
        roles: ["admin", "manager"],
      },
      {
        name: "Activity Reports",
        href: "/admin/reports/activity",
        icon: Activity,
        roles: ["admin"],
      },
      {
        name: "Export Data",
        href: "/admin/reports/export",
        icon: Archive,
        roles: ["admin"],
      },
    ],
  },

  // Additional Features
  {
    name: "Reviews",
    href: "/admin/reviews",
    icon: Star,
    roles: ["admin", "manager"],
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    roles: ["admin", "manager"],
    badge: 5,
  },

  // Settings & Configuration
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
    children: [
      {
        name: "General",
        href: "/admin/settings",
        icon: Settings,
        roles: ["admin"],
      },
      {
        name: "Security",
        href: "/admin/settings/security",
        icon: Shield,
        roles: ["admin"],
      },
      {
        name: "Integrations",
        href: "/admin/settings/integrations",
        icon: Building,
        roles: ["admin"],
      },
      {
        name: "Backup",
        href: "/admin/settings/backup",
        icon: Archive,
        roles: ["admin"],
      },
    ],
  },
];

const clientNavItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["user"],
  },
  {
    name: "Book Appointment",
    href: "/book",
    icon: Calendar,
    roles: ["user"],
  },
  {
    name: "Shop",
    href: "/shop",
    icon: Package,
    roles: ["user"],
  },
  {
    name: "My Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    roles: ["user"],
  },
  {
    name: "Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
    roles: ["user"],
  },
  {
    name: "Payment Methods",
    href: "/dashboard/payments",
    icon: CreditCard,
    roles: ["user"],
  },
  {
    name: "Address Book",
    href: "/dashboard/addresses",
    icon: Truck,
    roles: ["user"],
  },
  {
    name: "Reviews",
    href: "/dashboard/reviews",
    icon: Star,
    roles: ["user"],
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: Users,
    roles: ["user"],
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    roles: ["user"],
    badge: 3,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["user"],
  },
  {
    name: "Help & Support",
    href: "/dashboard/help",
    icon: HelpCircle,
    roles: ["user"],
  },
];

const SidebarNavItem: React.FC<{
  item: SidebarItem;
  isActive: boolean;
  isCollapsed?: boolean;
  onItemClick?: () => void;
}> = ({ item, isActive, isCollapsed = false, onItemClick }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren && !isCollapsed) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <div className="relative">
        <Link
          href={item.href}
          onClick={onItemClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isActive &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
            isCollapsed && "justify-center px-2"
          )}
        >
          <div className="relative">
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.badge && item.badge > 0 && !isCollapsed && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </div>

          {!isCollapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.name}</span>
              {hasChildren && (
                <button
                  onClick={toggleExpanded}
                  className="p-0.5 hover:bg-accent/50 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
            </>
          )}
        </Link>
      </div>

      {hasChildren && isExpanded && !isCollapsed && (
        <div className="ml-6 mt-1 space-y-1 border-l border-border pl-4">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <child.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{child.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  onLogout,
  isCollapsed = false,
  className,
}) => {
  const pathname = usePathname();

  // Determine if this is an admin or client sidebar based on the pathname
  const isAdminDashboard =
    pathname.startsWith("/admin") || pathname.includes("(withLayout)");
  const navItems = isAdminDashboard ? adminNavItems : clientNavItems;

  // Debug logging for troubleshooting
  React.useEffect(() => {
    console.log("Sidebar Debug Info:", {
      user,
      pathname,
      isAdminDashboard,
      navItemsCount: navItems.length,
      userRole: user?.role,
    });
  }, [user, pathname, isAdminDashboard, navItems]);

  // Provide fallback user if none is provided
  const effectiveUser = user || {
    _id: "fallback",
    name: "Admin User",
    email: "admin@barbies.com",
    role: "admin" as const,
    photo: undefined,
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) {
      console.log(`Filtering out item "${item.name}": no roles defined`);
      return false;
    }
    const hasAccess = item.roles.includes(effectiveUser.role);
    if (!hasAccess) {
      console.log(
        `Filtering out item "${item.name}": user role "${effectiveUser.role}" not in [${item.roles.join(", ")}]`
      );
    }
    return hasAccess;
  });

  console.log(
    "Filtered nav items:",
    filteredNavItems.map((item) => item.name)
  );

  // Show login widget if no user
  if (!user) {
    return (
      <div className={cn("flex flex-col h-full p-4", className)}>
        <SidebarLoginWidget
          onLogin={function (
            email: string,
            password: string
          ): Promise<boolean> {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
    );
  }

  if (filteredNavItems.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col h-full items-center justify-center p-4",
          className
        )}
      >
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No menu items available for your role
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Current role: {user.role}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isActive={
              pathname === item.href || pathname.startsWith(item.href + "/")
            }
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-border">
        <div
          className={cn(
            "flex items-center gap-3 mb-3 p-2 rounded-lg bg-muted/30",
            isCollapsed && "justify-center"
          )}
        >
          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center shadow-soft">
            <Users className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {effectiveUser.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {effectiveUser.role}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
