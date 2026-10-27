import { create } from "zustand";

import { ApiError } from "@workspace/api-client-react";
import { syncService } from "@/services/syncService";
import type { SyncHistoryItem, SyncRecord } from "@/types";

interface SyncState extends SyncRecord {
  history: SyncHistoryItem[];
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
  history: [],
  syncProgress: 0,
  error: null,

  fetchStatus: async () => {
    try {
      const [status, history] = await Promise.all([
        syncService.getSyncStatus(),
        syncService.getSyncHistory(),
      ]);
      set({ ...status, history, error: null });
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
      const history = await syncService.getSyncHistory();
      set({ ...result, history, isSyncing: false, syncProgress: 100 });
      setTimeout(() => set({ syncProgress: 0 }), 800);
    } catch (err: any) {
      let message = "Sync failed. Please try again.";
      if (err instanceof ApiError) {
        const errorBody = err.data as any;
        message = errorBody?.message || errorBody?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ isSyncing: false, error: message });
    }
  },
}));

