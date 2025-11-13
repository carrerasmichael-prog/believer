// src/stores/settings.ts
import { persist } from "zustand/middleware";
import { create } from "zustand";
import localforage from "localforage";
import { isTouchDevice } from "@/shared/utils/isTouchDevice";

interface SettingsState {
  appearance: {
    theme: "light" | "dark";
    showRightColumn: boolean;
    singleColumnLayout: boolean;
    limitedMaxWidth: boolean;
  };
  content: {
    blurNSFW: boolean;
    maxFollowDistanceForReplies: number | undefined;
    hidePostsByMutedMoreThanFollowed: boolean;
    autoplayVideos: boolean;
    showLikes: boolean;
    showReposts: boolean;
    showReplies: boolean;
    showZaps: boolean;
    showReactionsBar: boolean;
    showReactionCounts: boolean;
    showReactionCountsInStandalone: boolean;
    hideReactionsBarInStandalone: boolean;
    hideZapsBarInStandalone: boolean;
  };
  imgproxy: {
    url: string;
    key: string;
    salt: string;
    enabled: boolean;
    fallbackToOriginal: boolean;
  };
  notifications: {
    server: string;
  };
  debug: {
    enabled: boolean;
    privateKey: string | null;
  };
  updateAppearance: (settings: Partial<SettingsState["appearance"]>) => void;
  updateContent: (settings: Partial<SettingsState["content"]>) => void;
  updateImgproxy: (settings: Partial<SettingsState["imgproxy"]>) => void;
  updateNotifications: (settings: Partial<SettingsState["notifications"]>) => void;
  updateDebug: (settings: Partial<SettingsState["debug"]>) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: {
        theme: "light",
        showRightColumn: true,
        singleColumnLayout: true,
        limitedMaxWidth: false,
      },
      content: {
        blurNSFW: true,
        maxFollowDistanceForReplies: 5,
        hidePostsByMutedMoreThanFollowed: true,
        autoplayVideos: true,
        showLikes: true,
        showReposts: true,
        showReplies: true,
        showZaps: true,
        showReactionsBar: true,
        showReactionCounts: !isTouchDevice,
        showReactionCountsInStandalone: true,
        hideReactionsBarInStandalone: false,
        hideZapsBarInStandalone: false,
      },
      imgproxy: {
        url: "https://imgproxy.coracle.social",
        key: "",
        salt: "",
        enabled: true,
        fallbackToOriginal: true,
      },
      notifications: {
        server: CONFIG.defaultSettings.notificationServer,
      },
      debug: {
        enabled: false,
        privateKey: null,
      },
      updateAppearance: (settings) =>
        set((state) => ({
          appearance: { ...state.appearance, ...settings },
        })),
      updateContent: (settings) =>
        set((state) => ({
          content: { ...state.content, ...settings },
        })),
      updateImgproxy: (settings) =>
        set((state) => {
          const newImgproxy = { ...state.imgproxy, ...settings };
          localforage.setItem("imgproxy-settings", newImgproxy);
          return { imgproxy: newImgproxy };
        }),
      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
      updateDebug: (settings) =>
        set((state) => ({
          debug: { ...state.debug, ...settings },
        })),
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.appearance.theme === "dark" ? "light" : "dark";
          document.documentElement.classList.toggle("dark", newTheme === "dark");
          document.documentElement.setAttribute("data-theme", newTheme);
          return {
            appearance: {
              ...state.appearance,
              theme: newTheme,
            },
          };
        });
      },
    }),
    {
      name: "settings-storage",
      storage: localforage,
    }
  )
);