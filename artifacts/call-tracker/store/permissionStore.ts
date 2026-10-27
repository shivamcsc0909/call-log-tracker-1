import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Permission } from "@/types";

interface PermissionState {
  permissions: Permission[];
  allGranted: boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  grantPermission: (id: string) => void;
  denyPermission: (id: string) => void;
  reset: () => void;
}

const DEFAULT_PERMISSIONS: Permission[] = [
  {
    id: "call_log",
    title: "Call Log Access",
    description: "Required to read and capture your device call history for tracking and reporting purposes.",
    icon: "phone-call",
    status: "undetermined",
  },
  {
    id: "phone_state",
    title: "Phone State Access",
    description: "Monitors active call states so call events can be captured in real-time accurately.",
    icon: "smartphone",
    status: "undetermined",
  },
];

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      permissions: DEFAULT_PERMISSIONS,
      allGranted: false,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),

      grantPermission: (id) => {
        const perms = get().permissions.map((p) =>
          p.id === id ? { ...p, status: "granted" as const } : p
        );
        set({
          permissions: perms,
          allGranted: perms.every((p) => p.status === "granted"),
        });
      },

      denyPermission: (id) => {
        const perms = get().permissions.map((p) =>
          p.id === id ? { ...p, status: "denied" as const } : p
        );
        set({
          permissions: perms,
          allGranted: false,
        });
      },

      reset: () =>
        set({ permissions: DEFAULT_PERMISSIONS, allGranted: false }),
    }),
    {
      name: "permission-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        permissions: state.permissions,
        allGranted: state.allGranted,
      }),
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (error) {
            console.error("[Permissions Loaded] Error hydrating permission store:", error);
          } else {
            console.log(`[Permissions Loaded] Permission store hydrated. All granted: ${state?.allGranted}`);
          }
          state?.setHasHydrated(true);
        };
      },
    }
  )
);
