import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "@/components/ui/Button";
import {
  Menu,
  X,
  ChevronDown,
  Search,
  ShoppingBag,
  User,
  Heart,
  Home,
  Star,
  Tag,
  Phone,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
  external?: boolean;
}

interface NavigationProps {
  items: NavItem[];
  currentPath?: string;
  onNavigate?: (href: string) => void;
  className?: string;
  logo?: React.ReactNode;
  actions?: React.ReactNode;
}

interface MobileMenuProps extends NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

// =============================================================================
// MOBILE NAVIGATION MENU
// =============================================================================

const MobileMenu: React.FC<MobileMenuProps> = ({
  items,
  isOpen,
  onClose,
  currentPath,
  onNavigate,
  logo,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstFocusable = menuRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.children?.length) {
      e.preventDefault();
      toggleExpanded(item.id);
    } else {
      onNavigate?.(item.href);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: NavItem) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (item.children?.length) {
          toggleExpanded(item.id);
        } else {
          onNavigate?.(item.href);
          onClose();
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (item.children?.length && expandedItems.has(item.id)) {
          // Focus first child
          const nextFocusable =
            e.currentTarget.nextElementSibling?.querySelector(
              "a, button"
            ) as HTMLElement;
          nextFocusable?.focus();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        // Focus previous item
        const prevFocusable =
          e.currentTarget.previousElementSibling?.querySelector(
            "a, button"
          ) as HTMLElement;
        if (prevFocusable) {
          prevFocusable.focus();
        }
        break;
    }
  };

  const renderNavItems = (navItems: NavItem[], level = 0) => {
    return navItems.map((item) => {
      const isActive = currentPath === item.href;
      const isExpanded = expandedItems.has(item.id);
      const hasChildren = item.children && item.children.length > 0;

      return (
        <li key={item.id} className="border-b border-border last:border-b-0">
          <div className="flex items-center">
            <a
              href={item.href}
              onClick={(e) => handleItemClick(item, e)}
              onKeyDown={(e) => handleKeyDown(e, item)}
              className={cn(
                "flex-1 flex items-center gap-3 px-4 py-4 text-base transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                isActive && "text-primary font-medium bg-primary/10",
                level > 0 && "pl-8 py-3 text-sm"
              )}
              role={hasChildren ? "button" : "link"}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-current={isActive ? "page" : undefined}
              tabIndex={0}
            >
              {item.icon && (
                <span className="flex-shrink-0 text-lg" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full"
                  aria-label={`${item.badge} items`}
                >
                  {item.badge}
                </span>
              )}
            </a>
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(item.id)}
                className={cn(
                  "p-4 text-muted-foreground hover:text-foreground transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                )}
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.label} submenu`}
                tabIndex={-1}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          {hasChildren && isExpanded && (
            <ul
              className="bg-muted/50 border-t border-border"
              role="menu"
              aria-label={`${item.label} submenu`}
            >
              {renderNavItems(item.children!, level + 1)}
            </ul>
          )}
        </li>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className={cn(
          "fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background",
          "border-r border-border shadow-xl z-50 lg:hidden",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {logo && <div className="flex items-center">{logo}</div>}
          <IconButton
            icon={<X className="h-5 w-5" />}
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="ml-auto"
          />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto">
          <ul role="menubar" className="py-2">
            {renderNavItems(items)}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" fullWidth>
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button size="sm" fullWidth>
              Register
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

// =============================================================================
// DESKTOP NAVIGATION
// =============================================================================

interface DesktopNavProps {
  items: NavItem[];
  currentPath?: string;
  onNavigate?: (href: string) => void;
  className?: string;
}

const DesktopNav: React.FC<DesktopNavProps> = ({
  items,
  currentPath,
  onNavigate,
  className,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close dropdown on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [openDropdown]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const handleDropdownToggle = (itemId: string) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  const renderNavItems = (navItems: NavItem[]) => {
    return navItems.map((item) => {
      const isActive = currentPath === item.href;
      const hasChildren = item.children && item.children.length > 0;
      const isDropdownOpen = openDropdown === item.id;

      if (hasChildren) {
        return (
          <div
            key={item.id}
            className="relative"
            ref={(el) => {
              dropdownRefs.current[item.id] = el;
            }}
          >
            <button
              onClick={() => handleDropdownToggle(item.id)}
              onMouseEnter={() => setOpenDropdown(item.id)}
              className={cn(
                "nav-link flex items-center gap-1 px-3 py-2 rounded-md",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isActive && "active"
              )}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <span>{item.label}</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  isDropdownOpen && "rotate-180"
                )}
                aria-hidden="true"
              />
              {item.badge && (
                <span
                  className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full"
                  aria-label={`${item.badge} items`}
                >
                  {item.badge}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className={cn(
                  "absolute top-full left-0 mt-2 w-56 bg-popover border border-border",
                  "rounded-md shadow-lg z-50 py-2",
                  "animate-fade-in origin-top-left"
                )}
                role="menu"
                aria-label={`${item.label} submenu`}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.children!.map((child) => {
                  const isChildActive = currentPath === child.href;
                  return (
                    <a
                      key={child.id}
                      href={child.href}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate?.(child.href);
                        setOpenDropdown(null);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                        isChildActive &&
                          "text-primary font-medium bg-primary/10"
                      )}
                      role="menuitem"
                      aria-current={isChildActive ? "page" : undefined}
                    >
                      {child.icon && (
                        <span className="flex-shrink-0" aria-hidden="true">
                          {child.icon}
                        </span>
                      )}
                      <span className="flex-1">{child.label}</span>
                      {child.badge && (
                        <span
                          className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full"
                          aria-label={`${child.badge} items`}
                        >
                          {child.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      return (
        <a
          key={item.id}
          href={item.href}
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.(item.href);
          }}
          className={cn(
            "nav-link flex items-center gap-2 px-3 py-2 rounded-md",
            "hover:bg-accent hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isActive && "active"
          )}
          aria-current={isActive ? "page" : undefined}
        >
          {item.icon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span>{item.label}</span>
          {item.badge && (
            <span
              className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full"
              aria-label={`${item.badge} items`}
            >
              {item.badge}
            </span>
          )}
        </a>
      );
    });
  };

  return (
    <nav className={cn("hidden lg:flex items-center space-x-1", className)}>
      {renderNavItems(items)}
    </nav>
  );
};

// =============================================================================
// MAIN NAVIGATION COMPONENT
// =============================================================================

const Navigation: React.FC<NavigationProps> = ({
  items,
  currentPath,
  onNavigate,
  className,
  logo,
  actions,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md",
          "border-b border-border shadow-sm",
          className
        )}
        role="banner"
      >
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            {logo && <div className="flex items-center">{logo}</div>}

            {/* Desktop Navigation */}
            <DesktopNav
              items={items}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {actions}

              {/* Mobile Menu Button */}
              <IconButton
                icon={<Menu className="h-5 w-5" />}
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                aria-label="Open navigation menu"
                aria-expanded={isMobileMenuOpen}
                className="lg:hidden"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        items={items}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentPath={currentPath}
        onNavigate={onNavigate}
        logo={logo}
      />

      {/* Skip to main content link */}
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only fixed top-4 left-4 z-50",
          "bg-primary text-primary-foreground px-4 py-2 rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
      >
        Skip to main content
      </a>
    </>
  );
};

// =============================================================================
// SAMPLE NAVIGATION DATA
// =============================================================================

export const sampleNavItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: "categories",
    label: "Categories",
    href: "/categories",
    children: [
      {
        id: "electronics",
        label: "Electronics",
        href: "/categories/electronics",
        icon: <Star className="h-4 w-4" />,
      },
      {
        id: "clothing",
        label: "Clothing",
        href: "/categories/clothing",
        icon: <Tag className="h-4 w-4" />,
      },
      {
        id: "home-garden",
        label: "Home & Garden",
        href: "/categories/home-garden",
        icon: <Home className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "deals",
    label: "Deals",
    href: "/deals",
    badge: "Hot",
  },
  {
    id: "contact",
    label: "Contact",
    href: "/contact",
    icon: <Phone className="h-4 w-4" />,
  },
];

export default Navigation;
