"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../utils';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
  isAdminPortal?: boolean;
  registerUrl?: string;
  forgotPasswordUrl?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  loading = false,
  error,
  isAdminPortal = false,
  registerUrl = '/register',
  forgotPasswordUrl = '/forgot-password'
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onLogin(formData.email, formData.password);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isAdminPortal ? 'Admin Portal' : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground">
            {isAdminPortal 
              ? 'Sign in to manage your store' 
              : 'Sign in to your account to continue shopping'
            }
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">
              {isAdminPortal ? 'Admin Sign In' : 'Sign In'}
            </h2>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Global Error */}
              {error && (
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange('email')}
                error={formErrors.email}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                fullWidth
              />

              {/* Password Field */}
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange('password')}
                error={formErrors.password}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
                fullWidth
              />

              {/* Forgot Password */}
              <div className="text-right">
                <Link 
                  href={forgotPasswordUrl}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              {!isAdminPortal && (
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    href={registerUrl}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              )}
            </CardFooter>
          </form>
        </Card>

        {/* Demo Credentials */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4 border-dashed">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                {isAdminPortal ? (
                  <>
                    <p>Admin: admin@barbies.com / admin123</p>
                    <p>Manager: manager@barbies.com / manager123</p>
                  </>
                ) : (
                  <p>Customer: user@barbies.com / user123</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
