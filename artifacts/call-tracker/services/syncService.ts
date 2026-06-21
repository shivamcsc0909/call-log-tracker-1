import type { SyncRecord } from "@/types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let syncState: SyncRecord = {
  pendingCount: 3,
  syncedCount: 12,
  failedCount: 1,
  lastSyncTime: "Today at 11:45 AM",
  isSyncing: false,
};

export const syncService = {
  getSyncStatus: async (): Promise<SyncRecord> => {
    await delay(500);
    return { ...syncState };
  },

  syncNow: async (onProgress?: (progress: number) => void): Promise<SyncRecord> => {
    syncState.isSyncing = true;

    for (let i = 0; i <= 100; i += 10) {
      await delay(150);
      onProgress?.(i);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    syncState = {
      pendingCount: 0,
      syncedCount: syncState.syncedCount + syncState.pendingCount,
      failedCount: 0,
      lastSyncTime: `${dateStr} at ${timeStr}`,
      isSyncing: false,
    };

    return { ...syncState };
  },
};
