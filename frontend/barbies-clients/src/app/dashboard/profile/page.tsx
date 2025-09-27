"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../../../shared/contexts/Authcontext";
import { DashboardLayout } from "../../../../../../shared/components/layout/DashboardLayout";
import { UserProfilePage } from "../../../../../../shared/components/profile/UserProfilePage";
import { updatePassword } from "../../../../../../shared/components/services/userSettings";
import { UserSettings } from "../../../../../../shared/components/types/index";

export default function ClientProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mock user profile data - in real app, this would come from API
  const userProfile = {
    id: user?._id || "1",
    name: user?.name || "Jane Smith",
    email: user?.email || "jane.smith@example.com",
    phone: "+1 (555) 123-4567",
    avatar: user?.photo || "",
    role: "customer" as const,
    joinDate: "2023-01-15T00:00:00Z",
    lastActive: "2024-01-20T10:30:00Z",
    isEmailVerified: true,
    isPhoneVerified: false,
  };

  const handleUpdateProfile = async (updates: Partial<UserSettings>) => {
    setLoading(true);
    setError("");

    try {
      // check if both passwords are provided
      if (
        updates.changepassword?.currentPassword &&
        updates.changepassword?.newPassword
      ) {
        const updated = await updatePassword(
          updates.changepassword.currentPassword,
          updates.changepassword.newPassword
        );
        console.log("Password updated:", updated);
      } else {
        // fallback for other profile updates
        const updated = await updatePassword(updates);
        console.log("Profile updated:", updated);
      }

      // Update local user context if needed
      // updateUser({ ...user, ...updates });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Profile"
      description="Manage your account information and preferences"
      roles="customer"
    >
      <UserProfilePage
        user={userProfile}
        onUpdateProfile={handleUpdateProfile}
        loading={loading}
        error={error}
        canEdit={true}
      />
    </DashboardLayout>
  );
}
