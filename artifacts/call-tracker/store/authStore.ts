import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setAuthTokenGetter } from "@workspace/api-client-react";

import { authService } from "@/services/authService";
import { secureStore } from "@/services/secureStore";
import type { User } from "@/types";

export interface Organization {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  tempUserId: string | null;
  organizations: Organization[];
  selectedOrganization: Organization | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  selectOrganization: (orgId: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tempUserId: null,
      organizations: [],
      selectedOrganization: null,
      token: null,
      isLoading: false,
      error: null,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(email, password);
          if (response.success) {
            set({
              tempUserId: response.data.userId,
              organizations: response.data.organizations,
              isLoading: false,
            });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      selectOrganization: async (orgId) => {
        const userId = get().tempUserId;
        if (!userId) {
          throw new Error("No active session found. Please log in again.");
        }
        set({ isLoading: true, error: null });
        try {
          const response = await authService.selectOrganization(userId, orgId);
          if (response.success) {
            const token = response.token;
            // Store token in SecureStore
            await secureStore.setItemAsync("jwt_token", token);
            // Register with API client fetcher
            setAuthTokenGetter(() => secureStore.getItemAsync("jwt_token"));

            const rawUser = response.user as any;
            const mappedUser: User = {
              id: rawUser.userId || rawUser.id || userId,
              name: rawUser.name || `${rawUser.firstName || ""} ${rawUser.lastName || ""}`.trim(),
              email: rawUser.email || "",
              role: rawUser.role || (response.isAdmin ? "Administrator" : "User"),
              department: rawUser.department || "Operations",
              employeeId: rawUser.employeeId || `EMP-${orgId}-${userId.slice(-4)}`,
            };

            const rawOrg = response.organization as any;
            const mappedOrg: Organization = {
              id: rawOrg.id || rawOrg.orgId || orgId,
              name: rawOrg.name || "Workspace",
            };

            set({
              token,
              user: mappedUser,
              selectedOrganization: mappedOrg,
              tempUserId: null,
              organizations: [],
              isLoading: false,
            });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Organization selection failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (e) {
          console.error("Logout service error:", e);
        }
        await secureStore.deleteItemAsync("jwt_token");
        setAuthTokenGetter(null);
        set({
          user: null,
          token: null,
          tempUserId: null,
          organizations: [],
          selectedOrganization: null,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tempUserId: state.tempUserId,
        organizations: state.organizations,
        selectedOrganization: state.selectedOrganization,
      }),
      onRehydrateStorage: () => {
        return async (rehydratedState, error) => {
          if (!error && rehydratedState) {
            try {
              const token = await secureStore.getItemAsync("jwt_token");
              if (token) {
                setAuthTokenGetter(() => secureStore.getItemAsync("jwt_token"));
                useAuthStore.setState({ token });
              }
            } catch (err) {
              console.error("[Auth Load] SecureStore error loading token:", err);
            }
          }
          useAuthStore.setState({ hasHydrated: true });
        };
      },
    }
  )
);
