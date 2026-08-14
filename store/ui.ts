import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (val: boolean) => void;

  mobileNavOpen: boolean;
  setMobileNavOpen: (val: boolean) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (val: boolean) => void;

  activePropertyId: string;
  setActivePropertyId: (id: string) => void;

  notificationPanelOpen: boolean;
  setNotificationPanelOpen: (val: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),

      mobileNavOpen: false,
      setMobileNavOpen: (val) => set({ mobileNavOpen: val }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (val) => set({ commandPaletteOpen: val }),

      activePropertyId: "prop_001",
      setActivePropertyId: (id) => set({ activePropertyId: id }),

      notificationPanelOpen: false,
      setNotificationPanelOpen: (val) => set({ notificationPanelOpen: val }),
    }),
    {
      name: "hospitality-os-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        activePropertyId: s.activePropertyId,
      }),
    }
  )
);
