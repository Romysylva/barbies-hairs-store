"use client";
import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Edit, Save, X, Camera } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ImageUpload } from '../ui/ImageUpload';
import { Badge } from '../ui/Badge';
import { cn } from '../utils';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'customer';
  joinDate: string;
  lastActive?: string;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
}

interface UserProfilePageProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile & { avatar?: File }>) => Promise<void>;
  onUploadAvatar?: (file: File) => Promise<string>;
  loading?: boolean;
  error?: string;
  canEdit?: boolean;
  className?: string;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  user,
  onUpdateProfile,
  onUploadAvatar,
  loading = false,
  error,
  canEdit = true,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || '');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d+\-\s()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const updates: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined
      };

      if (avatarFile) {
        updates.avatar = avatarFile;
      }

      await onUpdateProfile(updates);
      setIsEditing(false);
      setAvatarFile(null);
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

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    });
    setAvatarFile(null);
    setAvatarPreview(user.avatar || '');
    setFormErrors({});
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'warning';
      case 'customer':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={cn('container mx-auto px-4 py-8 max-w-4xl', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Profile Information</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your account details and preferences
                </p>
              </div>
              {canEdit && (
                <Button
                  variant={isEditing ? 'ghost' : 'outline'}
                  size="sm"
                  onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                  leftIcon={isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Global Error */}
                {error && (
                  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Profile Picture Section */}
                <div className="flex items-center gap-6">
                  {isEditing ? (
                    <ImageUpload
                      variant="avatar"
                      value={avatarPreview}
                      onChange={(file, preview) => {
                        setAvatarFile(file);
                        setAvatarPreview(preview || '');
                      }}
                      maxSize={5}
                      acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                      className="flex-shrink-0"
                    />
                  ) : (
                    <div className="relative flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-24 w-24 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Enter your full name"
                    value={isEditing ? formData.name : user.name}
                    onChange={handleChange('name')}
                    error={formErrors.name}
                    leftIcon={<User className="h-4 w-4" />}
                    disabled={!isEditing}
                    required
                    fullWidth
                  />

                  {/* Email Field */}
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={isEditing ? formData.email : user.email}
                    onChange={handleChange('email')}
                    error={formErrors.email}
                    leftIcon={<Mail className="h-4 w-4" />}
                    disabled={!isEditing}
                    required
                    fullWidth
                  />

                  {/* Phone Field */}
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={isEditing ? formData.phone : (user.phone || 'Not provided')}
                    onChange={handleChange('phone')}
                    error={formErrors.phone}
                    leftIcon={<Phone className="h-4 w-4" />}
                    disabled={!isEditing}
                    fullWidth
                  />

                  {/* Role Field (Read-only) */}
                  <Input
                    label="Role"
                    type="text"
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    leftIcon={<User className="h-4 w-4" />}
                    disabled
                    fullWidth
                  />
                </div>

                {/* Account Status */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Account Status
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant={user.isEmailVerified ? 'success' : 'warning'}
                      size="sm"
                    >
                      Email {user.isEmailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                    {user.phone && (
                      <Badge 
                        variant={user.isPhoneVerified ? 'success' : 'warning'}
                        size="sm"
                      >
                        Phone {user.isPhoneVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>

              {isEditing && (
                <CardFooter className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              )}
            </form>
          </Card>
        </div>

        {/* Account Info Sidebar */}
        <div className="space-y-6">
          {/* Account Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Account Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {user.lastActive && (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Last Active</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.lastActive).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" size="sm" fullWidth className="justify-start">
                Change Password
              </Button>
              <Button variant="ghost" size="sm" fullWidth className="justify-start">
                Privacy Settings
              </Button>
              <Button variant="ghost" size="sm" fullWidth className="justify-start">
                Notification Preferences
              </Button>
              {!user.isEmailVerified && (
                <Button variant="ghost" size="sm" fullWidth className="justify-start text-warning">
                  Verify Email Address
                </Button>
              )}
              {user.phone && !user.isPhoneVerified && (
                <Button variant="ghost" size="sm" fullWidth className="justify-start text-warning">
                  Verify Phone Number
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Account Stats (for customers) */}
          {user.role === 'customer' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Account Summary</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">12</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">8</p>
                    <p className="text-xs text-muted-foreground">Wishlist</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">💎</p>
                    <p className="text-xs text-muted-foreground">VIP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
