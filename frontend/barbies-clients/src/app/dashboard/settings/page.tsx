"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { DashboardLayout } from "../../../../../../shared/components/layout/DashboardLayout";
import { UserSettingsPage } from "../../../../../../shared/components/profile/UserSettingsPage";
import { UserSettings } from "../../../../../../shared/components/types/index";
import {
  getUserSettings,
  updateUserSettings,
} from "../../../../../../shared/components/services/userSettings";

export default function ClientSettings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch settings from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getUserSettings();
        setSettings(data);
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch user settings", err);
        setError("Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle updating settings
  const handleUpdateSettings = async (updates: Partial<UserSettings>) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateUserSettings(updates);
      setSettings(updated);
      setSuccess("Settings updated successfully!");
    } catch (err) {
      console.error("Error updating settings", err);
      setError("Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change (stub for now)
  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: integrate your real change password API later
      console.log("Change password:", { currentPassword, newPassword });

      setSuccess("Password changed successfully!");
    } catch (err) {
      console.error("Error changing password", err);
      setError("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Settings"
      description="Manage your account preferences and security"
      roles={["customer"]}
      user={user}
      onLogout={logout}
    >
      {settings && (
        <UserSettingsPage
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onChangePassword={handleChangePassword}
          loading={loading}
          error={error}
          success={success}
        />
      )}
    </DashboardLayout>
  );
}
