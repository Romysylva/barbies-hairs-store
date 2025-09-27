/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "@/components/ui/Button";
import {
  Home,
  Search,
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
  ChevronUp,
  RotateCcw,
  ArrowUp,
  Phone,
  Mail,
  Share2,
} from "lucide-react";

// =============================================================================
// BOTTOM NAVIGATION
// =============================================================================

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
}

interface BottomNavigationProps {
  items: BottomNavItem[];
  currentPath?: string;
  onNavigate?: (href: string) => void;
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  currentPath,
  onNavigate,
  className,
}) => {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md",
        "border-t border-border pb-safe",
        "block sm:hidden", // Only show on mobile
        className
      )}
      role="tablist"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item, index) => {
          const isActive = currentPath === item.href;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.href)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1",
                "py-1 px-2 rounded-lg transition-colors duration-200",
                "touch-target focus-visible-ring",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              <div className="relative mb-1">
                <span className="text-xl" aria-hidden="true">
                  {item.icon}
                </span>
                {item.badge && (
                  <span
                    className={cn(
                      "absolute -top-2 -right-2 min-w-[18px] h-[18px]",
                      "bg-destructive text-destructive-foreground",
                      "rounded-full text-xs font-medium",
                      "flex items-center justify-center"
                    )}
                    aria-label={`${item.badge} notifications`}
                  >
                    {typeof item.badge === "number" && item.badge > 99
                      ? "99+"
                      : item.badge}
                  </span>
                )}
              </div>
              <span
                className="text-xs font-medium truncate w-full text-center"
                aria-hidden="true"
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// =============================================================================
// PULL TO REFRESH
// =============================================================================

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  refreshThreshold?: number;
  loadingComponent?: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className,
  refreshThreshold = 80,
  loadingComponent,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, isRefreshing]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing || !startY || containerRef.current?.scrollTop !== 0)
      return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    const dampedDistance = Math.min(distance * 0.5, refreshThreshold * 1.2);

    setPullDistance(dampedDistance);

    // Prevent default scrolling when pulling
    if (distance > 0) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance >= refreshThreshold && !isRefreshing) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  };

  const refreshProgress = Math.min(pullDistance / refreshThreshold, 1);
  const shouldShowRefresh = pullDistance > 10;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${Math.min(pullDistance * 0.3, 30)}px)`,
        transition:
          isRefreshing || pullDistance === 0
            ? "transform 0.3s ease-out"
            : "none",
      }}
    >
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center",
          "text-muted-foreground transition-all duration-200 z-10",
          shouldShowRefresh ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: Math.min(pullDistance, refreshThreshold),
          transform: `translateY(-${Math.max(0, refreshThreshold - pullDistance)}px)`,
        }}
        aria-live="polite"
        aria-label={isRefreshing ? "Refreshing content" : "Pull to refresh"}
      >
        {isRefreshing ? (
          loadingComponent || (
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Refreshing...</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2">
            <RotateCcw
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                refreshProgress >= 1 && "rotate-180"
              )}
            />
            <span className="text-sm">
              {refreshProgress >= 1 ? "Release to refresh" : "Pull to refresh"}
            </span>
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

// =============================================================================
// SWIPE ACTIONS
// =============================================================================

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "destructive" | "success" | "warning";
  onAction: () => void;
}

interface SwipeActionsProps {
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

const SwipeActions: React.FC<SwipeActionsProps> = ({
  leftActions = [],
  rightActions = [],
  children,
  className,
  threshold = 80,
}) => {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive || !startX) return;

    const currentX = e.touches[0].clientX;
    const distance = currentX - startX;

    // Limit swipe distance and add resistance
    const maxDistance = threshold * 2;
    const dampedDistance = Math.max(
      -maxDistance,
      Math.min(maxDistance, distance * 0.7)
    );

    setSwipeDistance(dampedDistance);
  };

  const handleTouchEnd = () => {
    const absDistance = Math.abs(swipeDistance);

    if (absDistance >= threshold) {
      const actions = swipeDistance > 0 ? leftActions : rightActions;
      if (actions.length > 0) {
        actions[0].onAction();
      }
    }

    setSwipeDistance(0);
    setStartX(0);
    setIsSwipeActive(false);
  };

  const getActionColor = (color: SwipeAction["color"]) => {
    const colors = {
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      success: "bg-green-500 text-white",
      warning: "bg-yellow-500 text-white",
    };
    return colors[color];
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center"
          style={{
            width: Math.max(0, swipeDistance),
            opacity: swipeDistance > 0 ? 1 : 0,
          }}
        >
          {leftActions.map((action, index) => (
            <button
              key={action.id}
              onClick={action.onAction}
              className={cn(
                "h-full px-4 flex items-center justify-center min-w-[60px]",
                "transition-colors duration-200 touch-target",
                getActionColor(action.color)
              )}
              aria-label={action.label}
            >
              <span className="text-xl" aria-hidden="true">
                {action.icon}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center"
          style={{
            width: Math.max(0, -swipeDistance),
            opacity: swipeDistance < 0 ? 1 : 0,
          }}
        >
          {rightActions.map((action, index) => (
            <button
              key={action.id}
              onClick={action.onAction}
              className={cn(
                "h-full px-4 flex items-center justify-center min-w-[60px]",
                "transition-colors duration-200 touch-target",
                getActionColor(action.color)
              )}
              aria-label={action.label}
            >
              <span className="text-xl" aria-hidden="true">
                {action.icon}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        ref={containerRef}
        className="relative bg-background transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${swipeDistance}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

// =============================================================================
// MOBILE MODAL
// =============================================================================

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  variant?: "slide" | "fade";
  position?: "bottom" | "center";
  className?: string;
  closeOnOverlayClick?: boolean;
}

const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  variant = "slide",
  position = "bottom",
  className,
  closeOnOverlayClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalClasses = cn(
    "fixed inset-0 z-50 flex items-end justify-center p-4",
    position === "center" && "items-center",
    position === "bottom" && "pb-safe"
  );

  const contentClasses = cn(
    "bg-background border border-border shadow-xl max-w-md w-full",
    "transition-all duration-300 ease-out",
    position === "bottom" && "rounded-t-2xl",
    position === "center" && "rounded-2xl",
    variant === "slide" &&
      position === "bottom" &&
      (isOpen ? "translate-y-0" : "translate-y-full"),
    variant === "slide" &&
      position === "center" &&
      (isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"),
    variant === "fade" && (isOpen ? "opacity-100" : "opacity-0"),
    className
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className={modalClasses}>
        <div
          ref={modalRef}
          className={contentClasses}
          role="dialog"
          aria-modal="true"
          aria-label={title || "Modal"}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">{title}</h2>
              <IconButton
                icon={<X className="h-5 w-5" />}
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Close modal"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </>
  );
};

// =============================================================================
// FLOATING ACTION BUTTON WITH MENU
// =============================================================================

interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface FloatingActionMenuProps {
  actions: FABAction[];
  mainIcon?: React.ReactNode;
  position?: "bottom-right" | "bottom-left";
  className?: string;
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  actions,
  mainIcon = <Menu className="h-6 w-6" />,
  position = "bottom-right",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    "bottom-right": "fixed bottom-20 right-6",
    "bottom-left": "fixed bottom-20 left-6",
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={cn(positionClasses[position], "z-50", className)}>
      {/* Action buttons */}
      {isOpen && (
        <div className="mb-4 space-y-3">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {position === "bottom-right" && (
                <span className="bg-background border border-border px-2 py-1 rounded-md text-sm font-medium shadow-md">
                  {action.label}
                </span>
              )}
              <button
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-12 h-12 bg-secondary text-secondary-foreground",
                  "rounded-full shadow-lg hover:shadow-xl",
                  "transition-all duration-200 hover:scale-110",
                  "focus-visible-ring touch-target"
                )}
                aria-label={action.label}
              >
                <span className="text-xl" aria-hidden="true">
                  {action.icon}
                </span>
              </button>
              {position === "bottom-left" && (
                <span className="bg-background border border-border px-2 py-1 rounded-md text-sm font-medium shadow-md">
                  {action.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={toggleMenu}
        className={cn(
          "w-14 h-14 bg-primary text-primary-foreground",
          "rounded-full shadow-lg hover:shadow-xl",
          "transition-all duration-200 hover:scale-110",
          "focus-visible-ring touch-target-lg",
          isOpen && "rotate-45"
        )}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <span className="text-2xl" aria-hidden="true">
          {mainIcon}
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// =============================================================================
// SCROLL TO TOP
// =============================================================================

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
  position?: "bottom-right" | "bottom-left";
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 400,
  className,
  position = "bottom-right",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const positionClasses = {
    "bottom-right": "fixed bottom-24 right-6",
    "bottom-left": "fixed bottom-24 left-6",
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        positionClasses[position],
        "z-40 w-12 h-12 bg-secondary text-secondary-foreground",
        "rounded-full shadow-lg hover:shadow-xl",
        "transition-all duration-200 hover:scale-110",
        "focus-visible-ring touch-target animate-fade-in",
        className
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5 mx-auto" aria-hidden="true" />
    </button>
  );
};

// =============================================================================
// SAMPLE DATA
// =============================================================================

export const sampleBottomNavItems: BottomNavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="h-5 w-5" />,
    href: "/",
  },
  {
    id: "search",
    label: "Search",
    icon: <Search className="h-5 w-5" />,
    href: "/search",
  },
  {
    id: "cart",
    label: "Cart",
    icon: <ShoppingBag className="h-5 w-5" />,
    href: "/cart",
    badge: 3,
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: <Heart className="h-5 w-5" />,
    href: "/favorites",
  },
  {
    id: "profile",
    label: "Profile",
    icon: <User className="h-5 w-5" />,
    href: "/profile",
  },
];

export const sampleFABActions: FABAction[] = [
  {
    id: "call",
    label: "Call Support",
    icon: <Phone className="h-5 w-5" />,
    onClick: () => console.log("Call support"),
  },
  {
    id: "email",
    label: "Send Email",
    icon: <Mail className="h-5 w-5" />,
    onClick: () => console.log("Send email"),
  },
  {
    id: "share",
    label: "Share",
    icon: <Share2 className="h-5 w-5" />,
    onClick: () => console.log("Share"),
  },
];

export {
  BottomNavigation,
  PullToRefresh,
  SwipeActions,
  MobileModal,
  FloatingActionMenu,
  ScrollToTop,
};

export type {
  BottomNavItem,
  BottomNavigationProps,
  PullToRefreshProps,
  SwipeAction,
  SwipeActionsProps,
  MobileModalProps,
  FABAction,
  FloatingActionMenuProps,
  ScrollToTopProps,
};
