"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/contexts/authContext";

export default function WithLayout({ children }: { children: ReactNode }) {
  // const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
