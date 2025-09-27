import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { AuthProvider } from "@/context/auth-context";
import { AuthProvider } from "@/shared/contexts/AuthContext";
// import { AuthProvider } from "@/context/contexts/authContext";
import "./globals.css";
// import "@/styles/globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barbie's Hair",
  description: "Barbie's Hair E_shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
