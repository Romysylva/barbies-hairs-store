"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ImageUpload } from '../ui/ImageUpload';

interface RegisterPageProps {
  onRegister: (userData: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    location: string;
    phone?: string;
    avatar?: File;
    preferences?: {
      theme?: string;
      notification?: boolean;
      language?: string;
    };
  }) => Promise<void>;
  loading?: boolean;
  error?: string;
  loginUrl?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegister,
  loading = false,
  error,
  loginUrl = '/login'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    location: '',
    phone: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.location) {
      errors.location = 'Location is required for delivery';
    } else if (formData.location.length < 5) {
      errors.location = 'Please provide a more detailed location';
    }

    if (formData.phone && !/^[\d+\-\s()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.passwordConfirm) {
      errors.passwordConfirm = 'Password confirmation is required';
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onRegister({
        ...formData,
        avatar: avatarFile || undefined,
        preferences: {
          theme: 'light',
          notification: true,
          language: 'en'
        }
      });
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">
            Join Barbie's Hair to discover amazing hair products
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Sign Up</h2>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Global Error */}
              {error && (
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Profile Picture Upload */}
              <ImageUpload
                label="Profile Picture"
                placeholder="Upload your photo"
                variant="avatar"
                value={avatarPreview}
                onChange={(file, preview) => {
                  setAvatarFile(file);
                  setAvatarPreview(preview || '');
                }}
                maxSize={3}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
              />

              {/* Name Field */}
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange('name')}
                error={formErrors.name}
                leftIcon={<User className="h-4 w-4" />}
                required
                fullWidth
              />

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

              {/* Location Field */}
              <Input
                label="Delivery Address"
                type="text"
                placeholder="Enter your location for delivery"
                value={formData.location}
                onChange={handleChange('location')}
                error={formErrors.location}
                leftIcon={<MapPin className="h-4 w-4" />}
                required
                fullWidth
              />

              {/* Phone Field */}
              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number (optional)"
                value={formData.phone}
                onChange={handleChange('phone')}
                error={formErrors.phone}
                leftIcon={<Phone className="h-4 w-4" />}
                fullWidth
              />

              {/* Password Field */}
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange('password')}
                error={formErrors.password}
                helper="Password must be at least 8 characters"
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

              {/* Password Confirmation Field */}
              <Input
                label="Confirm Password"
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.passwordConfirm}
                onChange={handleChange('passwordConfirm')}
                error={formErrors.passwordConfirm}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
                fullWidth
              />

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-0.5 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  href={loginUrl}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
