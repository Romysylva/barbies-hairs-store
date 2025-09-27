"use client";
import React, { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Eye,
  EyeOff,
  Lock,
  Save,
  Moon,
  Sun,
  Monitor,
  BellOff,
} from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "../utils";
import { usePreferences } from "../../../shared/contexts/PreferencesContext";
import { UserSettings } from "../../../shared/components/types/index";

// interface UserSettings {
//   notifications: {
//     email: boolean;
//     push: boolean;
//     marketing: boolean;
//     orderUpdates: boolean;
//     productUpdates: boolean;
//   };
//   privacy: {
//     profileVisible: boolean;
//     showLastActive: boolean;
//     allowDataCollection: boolean;
//   };
//   preferences: {
//     theme: "light" | "dark" | "system";
//     language: string;
//     currency: string;
//     timezone: string;
//   };
//   security: {
//     twoFactorEnabled: boolean;
//     sessionTimeout: number; // in minutes
//   };
// }

interface UserSettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  onChangePassword?: (
    currentPassword: string,
    newPassword: string
  ) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  className?: string;
  success?: string;
}

export const UserSettingsPage: React.FC<UserSettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onChangePassword,
  loading = false,
  error,
  className,
  success,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );

  const updateSetting = (
    section: keyof UserSettings,
    key: string,
    value: any
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      await onUpdateSettings(localSettings);
      setHasChanges(false);
    } catch (err) {
      // Error handling is done by parent component
    }
  };
  const { setPreference } = usePreferences();

  const validatePasswordChange = () => {
    const errors: Record<string, string> = {};

    if (!currentPassword) {
      errors.current = "Current password is required";
    }

    if (!newPassword) {
      errors.new = "New password is required";
    } else if (newPassword.length < 8) {
      errors.new = "Password must be at least 8 characters";
    }

    if (newPassword !== confirmPassword) {
      errors.confirm = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordChange()) return;

    // This would integrate with the password change API
    if (onChangePassword) {
      await onChangePassword(currentPassword, newPassword);
    }

    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors({});
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className={cn("container mx-auto px-4 py-8 max-w-4xl", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Global Error */}
        {error && (
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose what notifications you want to receive
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(localSettings.notifications).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {key === "email" && "Email Notifications"}
                        {key === "push" && "Push Notifications"}
                        {key === "marketing" && "Marketing Emails"}
                        {key === "orderUpdates" && "Order Updates"}
                        {key === "productUpdates" && "Product Updates"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {key === "email" && "Receive notifications via email"}
                        {key === "push" &&
                          "Receive push notifications in browser"}
                        {key === "marketing" && "Promotional emails and offers"}
                        {key === "orderUpdates" && "Updates about your orders"}
                        {key === "productUpdates" &&
                          "New products and restocks"}
                      </p>
                    </div>

                    {/* Toggle switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={value}
                        onChange={(e) =>
                          updateSetting("notifications", key, e.target.checked)
                        }
                      />
                      {/* Track */}
                      <div
                        className="
                                    w-12 h-6
                                    bg-gray-300
                                    rounded-full
                                    peer-checked:bg-primary
                                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20
                                    transition-colors duration-300"
                      ></div>
                      <div
                        className="
                                      absolute top-[2px] left-[2px]
                                      h-5 w-5
                                      bg-white rounded-full
                                      shadow-md
                                      transition-transform duration-300
                                      peer-checked:translate-x-6"
                      ></div>
                    </label>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Privacy</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Control who can see your information
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(localSettings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {key === "profileVisible" && "Public Profile"}
                      {key === "showLastActive" && "Show Last Active"}
                      {key === "allowDataCollection" && "Data Collection"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {key === "profileVisible" &&
                        "Make your profile visible to other users"}
                      {key === "showLastActive" &&
                        "Show when you were last active"}
                      {key === "allowDataCollection" &&
                        "Allow data collection for analytics"}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={value}
                      onChange={(e) =>
                        updateSetting("privacy", key, e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Preferences</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Customize your experience
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme Selection */}
              <div>
                <label className="font-medium text-sm mb-2 block">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "light", label: "Light", icon: Sun },
                      { value: "dark", label: "Dark", icon: Moon },
                      { value: "system", label: "System", icon: Monitor },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        updateSetting("preferences", "theme", value); // local state
                        setPreference("theme", value); // global + backend
                      }}
                      className={cn(
                        "p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors",
                        localSettings.preferences.theme === value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="font-medium text-sm mb-2 block">
                  Language
                </label>
                <select
                  value={localSettings.preferences.language}
                  onChange={(e) =>
                    updateSetting("preferences", "language", e.target.value)
                  }
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="font-medium text-sm mb-2 block">
                  Currency
                </label>
                <select
                  value={localSettings.preferences.currency}
                  onChange={(e) =>
                    updateSetting("preferences", "currency", e.target.value)
                  }
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Security</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Keep your account secure
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-sm">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                  <Badge
                    variant={
                      localSettings.security.twoFactorEnabled
                        ? "success"
                        : "warning"
                    }
                    size="sm"
                    className="mt-2"
                  >
                    {localSettings.security.twoFactorEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateSetting(
                      "security",
                      "twoFactorEnabled",
                      !localSettings.security.twoFactorEnabled
                    )
                  }
                >
                  {localSettings.security.twoFactorEnabled
                    ? "Disable"
                    : "Enable"}
                </Button>
              </div>

              {/* Session Timeout */}
              <div>
                <label className="font-medium text-sm mb-2 block">
                  Session Timeout
                </label>
                <select
                  value={localSettings.security.sessionTimeout}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "sessionTimeout",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={180}>3 hours</option>
                  <option value={480}>8 hours</option>
                  <option value={1440}>24 hours</option>
                </select>
              </div>

              {/* Change Password */}
              <div className="border-t border-border pt-4">
                <h3 className="font-medium text-sm mb-3">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <Input
                    label="Current Password"
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    error={passwordErrors.current}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    fullWidth
                  />

                  <Input
                    label="New Password"
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    error={passwordErrors.new}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    fullWidth
                  />

                  <Input
                    label="Confirm New Password"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={passwordErrors.confirm}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    loading={loading}
                  >
                    Change Password
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Changes Button */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-50">
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">
                    You have unsaved changes
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLocalSettings(settings);
                        setHasChanges(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveSettings}
                      loading={loading}
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
