"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  getUserSettings,
  updateUserSettings,
} from "../components/services/userSettings";

// Types
interface Preferences {
  theme: "light" | "dark" | "system";
  language: string;
  currency: string;
  timezone: string;
}

interface PreferencesContextProps {
  preferences: Preferences | null;
  setPreference: <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => Promise<void>;
}

// Create Context
const PreferencesContext = createContext<PreferencesContextProps | undefined>(
  undefined
);

// Provider
export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setTheme } = useTheme();
  const [preferences, setPreferences] = useState<Preferences | null>(null);

  // Load preferences on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getUserSettings();
        if (settings?.preferences) {
          setPreferences(settings.preferences);
          setTheme(settings.preferences.theme); // sync theme immediately
        }
      } catch (err) {
        console.error("Failed to load user settings", err);
      }
    };
    loadSettings();
  }, [setTheme]);

  // Update a preference
  const setPreference = async <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    if (!preferences) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    if (key === "theme") {
      setTheme(value as Preferences["theme"]);
    }

    try {
      await updateUserSettings({ preferences: updated });
    } catch (err) {
      console.error("Failed to update preferences", err);
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, setPreference }}>
      {children}
    </PreferencesContext.Provider>
  );
};

// Hook
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
};
