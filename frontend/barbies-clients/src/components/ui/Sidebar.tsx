"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  User,
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
} from "lucide-react";
import { User as UserType } from "@/types";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles?: ("admin" | "manager" | "user")[];
  children?: SidebarItem[];
}

interface SidebarProps {
  user: UserType | null;
  onLogout: () => void;
  className?: string;
}

const adminNavItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
    roles: ["admin", "manager"],
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    roles: ["admin", "manager"],
    children: [
      { name: "All Products", href: "/admin/products", icon: Package },
      { name: "Add Product", href: "/admin/products/add", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: Tag },
    ],
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    roles: ["admin", "manager"],
    children: [
      { name: "All Orders", href: "/admin/orders", icon: ShoppingCart },
      {
        name: "Pending",
        href: "/admin/orders?status=pending",
        icon: ShoppingCart,
      },
      { name: "Shipped", href: "/admin/orders?status=shipped", icon: Truck },
    ],
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["admin", "manager"],
  },
  {
    name: "Reviews",
    href: "/admin/reviews",
    icon: Star,
    roles: ["admin", "manager"],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
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
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    roles: ["user"],
  },
  {
    name: "Profile Settings",
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

  const toggleExpanded = () => {
    if (hasChildren && !isCollapsed) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <Link
        href={item.href}
        onClick={onItemClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
          isCollapsed && "justify-center px-2"
        )}
      >
        <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.name}</span>
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpanded();
                }}
                className="p-0.5 hover:bg-accent/50 rounded"
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
              <span>{child.name}</span>
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
  className,
}) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Determine if this is an admin or client sidebar based on the pathname
  const isAdminDashboard =
    pathname.startsWith("/admin") || pathname.startsWith("/(withLayout)");
  const navItems = isAdminDashboard ? adminNavItems : clientNavItems;

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles || !user) return true;
    return item.roles.includes(user.roles);
  });

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-card border-r border-border h-full transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {isAdminDashboard ? "Admin Panel" : "My Account"}
              </h2>
              {user && (
                <p className="text-sm text-muted-foreground truncate">
                  {user.name}
                </p>
              )}
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                !isCollapsed && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-border">
        {user && (
          <div
            className={cn(
              "flex items-center gap-3 mb-3",
              isCollapsed && "justify-center"
            )}
          >
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.roles}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
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
