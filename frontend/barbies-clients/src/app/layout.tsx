import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CompareProvider } from "@/context/CompareContext";
// import { AuthProvider } from "../context/AuthContext";
import { AuthProvider } from "../../../../shared/contexts/Authcontext";
import { PreferencesProvider } from "../../../../shared/contexts/PreferencesContext";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barbies Hair - Premium Hair Products",
  description: "Shop premium hair products at Barbies Hair store",
};
// suppressHydrationWarnings
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black dark:bg-gray-900 dark:text-white`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PreferencesProvider>
            <Providers>
              <CompareProvider>
                <AuthProvider>{children}</AuthProvider>
              </CompareProvider>
            </Providers>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
