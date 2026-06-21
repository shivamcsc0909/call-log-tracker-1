import { create } from "zustand";

import { syncService } from "@/services/syncService";
import type { SyncRecord } from "@/types";

interface SyncState extends SyncRecord {
  syncProgress: number;
  error: string | null;
  fetchStatus: () => Promise<void>;
  syncNow: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set) => ({
  pendingCount: 0,
  syncedCount: 0,
  failedCount: 0,
  lastSyncTime: null,
  isSyncing: false,
  syncProgress: 0,
  error: null,

  fetchStatus: async () => {
    try {
      const status = await syncService.getSyncStatus();
      set({ ...status, error: null });
    } catch {
      set({ error: "Failed to load sync status" });
    }
  },

  syncNow: async () => {
    set({ isSyncing: true, syncProgress: 0, error: null });
    try {
      const result = await syncService.syncNow((progress) => {
        set({ syncProgress: progress });
      });
      set({ ...result, isSyncing: false, syncProgress: 100 });
      setTimeout(() => set({ syncProgress: 0 }), 800);
    } catch {
      set({ isSyncing: false, error: "Sync failed. Please try again." });
    }
  },
}));
