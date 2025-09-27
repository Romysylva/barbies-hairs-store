"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginPage as SharedLoginPage } from "../../../../../shared/components/auth/LoginPage";
import { useAuth } from "../../../../../shared/contexts/Authcontext";
// import { useAuth } from "@/context/AuthContext";

export default function ClientLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // const handleLogin = async (email: string, password: string) => {
  //   try {
  //     setLoading(true);
  //     setError("");
  //     await login(email, password);
  //     router.push("/dashboard");
  //   } catch (err) {
  //     if (err instanceof Error)
  //       setError(err.message || "Login failed. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError("");

      const result = await login({ email, password });
      router.push("/dashboard");

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SharedLoginPage
      onLogin={handleLogin}
      loading={loading}
      error={error}
      isAdminPortal={false}
      registerUrl="/register"
      forgotPasswordUrl="/forgot-password"
    />
  );
}
