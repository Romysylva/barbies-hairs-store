"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ForgotPasswordPage } from "../../../../../shared/components/auth/ForgotPasswordPage";

export default function ClientForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async (email: string) => {
    setLoading(true);
    setError("");

    try {
      // Simulate API call for password reset
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, this would call your password reset API
      // await api.auth.resetPassword(email);

      console.log("Password reset requested for:", email);

      // The ForgotPasswordPage component handles showing the success state
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset instructions. Please try again."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ForgotPasswordPage
      onResetPassword={handleResetPassword}
      loading={loading}
      error={error}
      loginUrl="/auth/login"
      onSuccess={() => {
        // Optional: You could redirect after a delay
        // setTimeout(() => router.push('/auth/login'), 3000);
      }}
    />
  );
}
