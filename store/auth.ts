import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, AuthUser, RegisterPayload } from "@/lib/services/auth.service";
import { tokenStore } from "@/lib/api";

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const tokens = await authService.login({ email, password });
          set({ user: tokens.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const tokens = await authService.register(payload);
          set({ user: tokens.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await authService.logout();
        tokenStore.clear();
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.me();
          set({ user, isAuthenticated: true });
        } catch {
          tokenStore.clear();
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "hospitality-os-auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
