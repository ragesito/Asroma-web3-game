import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface NotificationSettings {
  messageNotifications: boolean;
  friendRequestNotifications: boolean;
  inviteNotifications: boolean;
  sound: boolean;
  vibration: boolean;
  inAppBanners: boolean;
}

interface NotificationStore extends NotificationSettings {
  setSetting: (key: keyof NotificationSettings, value: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      messageNotifications: true,
      friendRequestNotifications: true,
      inviteNotifications: true,
      sound: true,
      vibration: true,
      inAppBanners: true,

      setSetting: (key, value) =>
        set((state) => ({
          ...state,
          [key]: value,
        })),
    }),
    {
      name: "notification-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
