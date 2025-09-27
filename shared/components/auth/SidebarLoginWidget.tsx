"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { cn } from '../../../frontend/barbies-admins/src/lib/utils';

interface SidebarLoginWidgetProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  loading?: boolean;
  error?: string;
  isAdminPortal?: boolean;
  className?: string;
  onClose?: () => void;
}

export const SidebarLoginWidget: React.FC<SidebarLoginWidgetProps> = ({
  onLogin,
  loading = false,
  error,
  isAdminPortal = false,
  className,
  onClose
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email';
    }

    if (!formData.password) {
      errors.password = 'Password required';
    } else if (formData.password.length < 6) {
      errors.password = 'Min 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const success = await onLogin(formData.email, formData.password);
      if (success) {
        // Reset form on successful login
        setFormData({ email: '', password: '' });
        setIsExpanded(false);
      }
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const quickLogin = (role: 'admin' | 'manager') => {
    const credentials = {
      admin: { email: 'admin@barbies.com', password: 'admin123' },
      manager: { email: 'manager@barbies.com', password: 'manager123' }
    };
    
    setFormData(credentials[role]);
  };

  return (
    <div className={cn("p-4 border-b border-border bg-muted/10", className)}>
      {!isExpanded ? (
        // Compact Login Button
        <div className="space-y-2">
          <button
            onClick={() => setIsExpanded(true)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <LogIn className="h-5 w-5 flex-shrink-0" />
            <span>Sign In to Continue</span>
          </button>
          
          {/* Quick Access Buttons for Development */}
          {process.env.NODE_ENV === 'development' && isAdminPortal && (
            <div className="flex gap-1">
              <button
                onClick={() => quickLogin('admin')}
                className="flex-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
              >
                Quick Admin
              </button>
              <button
                onClick={() => quickLogin('manager')}
                className="flex-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
              >
                Quick Manager
              </button>
            </div>
          )}
        </div>
      ) : (
        // Expanded Login Form
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {isAdminPortal ? 'Admin Sign In' : 'Sign In'}
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ×
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-2 bg-destructive/5 border border-destructive/20 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field */}
            <div className="space-y-1">
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  className={cn(
                    "w-full pl-10 pr-3 py-2 text-sm border rounded-md transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                    "bg-background text-foreground placeholder:text-muted-foreground",
                    formErrors.email ? "border-destructive" : "border-border"
                  )}
                  required
                />
              </div>
              {formErrors.email && (
                <p className="text-xs text-destructive">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  className={cn(
                    "w-full pl-10 pr-10 py-2 text-sm border rounded-md transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                    "bg-background text-foreground placeholder:text-muted-foreground",
                    formErrors.password ? "border-destructive" : "border-border"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-xs text-destructive">{formErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                loading && "animate-pulse"
              )}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials for Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">Demo:</p>
              <div className="flex gap-1">
                <button
                  onClick={() => quickLogin('admin')}
                  className="flex-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
                >
                  Admin
                </button>
                <button
                  onClick={() => quickLogin('manager')}
                  className="flex-1 px-2 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200 transition-colors"
                >
                  Manager
                </button>
              </div>
            </div>
          )}

          {/* Additional Links */}
          <div className="text-center space-y-1">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot Password?
            </Link>
            {!isAdminPortal && (
              <Link
                href="/register"
                className="block text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarLoginWidget;
