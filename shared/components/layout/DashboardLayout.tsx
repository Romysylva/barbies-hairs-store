"use client";
import * as React from "react";
import { Bell, Search, Menu, X, ChevronLeft } from "lucide-react";
import Sidebar from "../Navigation/Sidebar";
import { ChatWidget } from "../chat/ChatWidget";
import { ChatNotifications } from "../chat/ChatNotifications";
import { User } from "../types/index";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  user: User | null;
  onLogout: () => Promise<void>;
  searchPlaceholder?: string;
  className?: string;
  hideSearch?: boolean;
  roles: ("admin" | "manager" | "user" | "customer")[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  description,
  actions,
  user,
  onLogout,
  searchPlaceholder = "Search...",
  className = "",
  hideSearch = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Barbie's Hair
                </h2>
                <p className="text-xs text-muted-foreground">
                  {user?.roles?.includes("admin")
                    ? "Admin Panel"
                    : user?.roles?.includes("manager")
                      ? "Manager Panel"
                      : "Customer Portal"}
                </p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label={
                isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              <ChevronLeft
                className={`h-4 w-4 transition-transform duration-200 ${
                  isSidebarCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar
            user={user}
            onLogout={onLogout}
            isCollapsed={isSidebarCollapsed}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-card w-64 h-full border-r border-border shadow-xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Barbie's Hair
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                user={user}
                onLogout={async () => {
                  await onLogout();
                  setIsMobileMenuOpen(false);
                }}
                isCollapsed={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Open mobile menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Page title */}
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search - Enhanced for mobile */}
              {!hideSearch && (
                <div className="hidden md:block w-48 lg:w-64">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder={searchPlaceholder}
                      className="input pl-10 bg-background text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Mobile Search Button */}
              {!hideSearch && (
                <button className="md:hidden btn-ghost btn-icon">
                  <Search className="h-5 w-5" />
                </button>
              )}

              {/* Notifications */}
              <button className="btn-ghost btn-icon relative">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse"></span>
              </button>

              {/* User Info - Enhanced for mobile */}
              {user && (
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-foreground truncate max-w-24 xl:max-w-32">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.roles}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center shadow-soft">
                    <span className="text-primary-foreground font-medium text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile User Avatar */}
              {user && (
                <div className="sm:hidden h-8 w-8 bg-primary rounded-full flex items-center justify-center shadow-soft">
                  <span className="text-primary-foreground font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Page actions - Enhanced for mobile */}
              {actions && (
                <div className="flex items-center gap-1 sm:gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 bg-background">
          <div className="max-w-full mx-auto">{children}</div>
        </main>
      </div>

      {/* Global Chat Widget */}
      <ChatWidget />

      {/* Global Chat Notifications */}
      <ChatNotifications
        isOpen={false}
        onToggle={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
};

export default DashboardLayout;
