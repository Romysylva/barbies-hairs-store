/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginPage as SharedLoginPage } from "../../../../../../shared/components/auth/LoginPage";
import { useAuth } from "@/shared/contexts/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      setError("");

      const result = await login({ email, password });

      if (result.success) {
        console.log("Login successful, redirecting to admin dashboard");
        router.push("/admin");
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SharedLoginPage
      onLogin={handleLogin}
      loading={loading}
      error={error}
      isAdminPortal={true}
      forgotPasswordUrl="/admin/forgot-password"
    />
  );
}
