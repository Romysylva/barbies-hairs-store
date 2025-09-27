import { UserSettings } from "../types/index";
import apiClient from "../apiClient";

export const getUserSettings = async (): Promise<UserSettings> => {
  const res = await apiClient.get<UserSettings>("/user-settings");
  return res.data;
};

export const updateUserSettings = async (
  settings: Partial<UserSettings>
): Promise<UserSettings> => {
  const res = await apiClient.put<UserSettings>("/user-settings", settings);
  return res.data;
};

export const updatePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ status: string; message: string }> => {
  const res = await apiClient.patch<{ status: string; message: string }>(
    "/users/update-password",
    { currentPassword, newPassword }
  );
  return res.data;
};
