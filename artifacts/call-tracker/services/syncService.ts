import AsyncStorage from "@react-native-async-storage/async-storage";
import { insertCallLogs, setLogCredentials } from "@workspace/api-client-react";
import type { SyncHistoryItem, SyncRecord } from "@/types";
import { callLogService } from "./callLogService";
import { useAuthStore } from "@/store/authStore";

const HISTORY_STORAGE_KEY = "local_sync_history";

const INITIAL_MOCK_HISTORY: Record<string, SyncHistoryItem[]> = {
  "demo@company.com": [
    { time: "21 Jun, 11:45 AM", count: 12, status: "Synced" },
    { time: "20 Jun, 06:30 PM", count: 8, status: "Synced" },
  ],
  "client.test@company.com": [
    { time: "22 Jun, 04:15 PM", count: 11, status: "Synced" },
    { time: "21 Jun, 03:05 PM", count: 6, status: "Synced" },
  ],
};

const getActiveUserEmail = (): string => {
  try {
    return useAuthStore.getState().user?.email || "demo@company.com";
  } catch {
    return "demo@company.com";
  }
};

const loadHistory = async (email: string): Promise<SyncHistoryItem[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed[email] || [];
    }
  } catch (e) {
    console.error("Error loading sync history:", e);
  }
  // Fallback to initial mocks
  return INITIAL_MOCK_HISTORY[email] || [];
};

const saveHistory = async (email: string, history: SyncHistoryItem[]) => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : {};
    parsed[email] = history;
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.error("Error saving sync history:", e);
  }
};

const parseToISO = (dateStr: string, timeStr: string): string => {
  try {
    const parsed = new Date(`${dateStr} ${timeStr}`);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } catch (e) {
    console.error("Failed to parse date/time string:", dateStr, timeStr, e);
  }
  return new Date().toISOString();
};

export const syncService = {
  getSyncStatus: async (): Promise<SyncRecord> => {
    const email = getActiveUserEmail();
    const logs = await callLogService.getCallLogs();

    const pendingCount = logs.filter((log) => log.status === "Pending").length;
    const syncedCount = logs.filter((log) => log.status === "Synced").length;
    const failedCount = logs.filter((log) => log.status === "Failed").length;

    const history = await loadHistory(email);
    const lastSyncTime = history[0]?.time || null;

    return {
      pendingCount,
      syncedCount,
      failedCount,
      lastSyncTime,
      isSyncing: false,
    };
  },

  getSyncHistory: async (): Promise<SyncHistoryItem[]> => {
    const email = getActiveUserEmail();
    return await loadHistory(email);
  },

  syncNow: async (onProgress?: (progress: number) => void): Promise<SyncRecord> => {
    const email = getActiveUserEmail();
    const logs = await callLogService.getCallLogs();
    const pendingLogs = logs.filter((log) => log.status === "Pending" || log.status === "Failed");
    const pendingCount = pendingLogs.length;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    const formattedHistoryTime = `${dateStr}, ${timeStr}`;

    onProgress?.(10);

    if (pendingCount > 0) {
      const syncedLogIds = new Set<number>();
      try {
        const payloadLogs = pendingLogs.map((log) => ({
          number: log.number,
          name: log.name || undefined, // Fix schema mismatch: undefined is allowed, null is rejected by Zod
          duration: log.durationSeconds,
          timestamp: parseToISO(log.date, log.time),
          type: log.type.toLowerCase(),
        }));

        onProgress?.(20);

        const batchSize = 100;
        const totalLogs = payloadLogs.length;
        console.log(`[Sync] Starting upload of ${totalLogs} call logs in batches of ${batchSize}...`);

        for (let i = 0; i < totalLogs; i += batchSize) {
          const batchPayload = payloadLogs.slice(i, i + batchSize);
          const batchLogs = pendingLogs.slice(i, i + batchSize);

          console.log(`[Sync] Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalLogs / batchSize)} (logs ${i + 1} to ${Math.min(i + batchSize, totalLogs)})...`);

          // Set logging credentials dynamically from active session
          const user = useAuthStore.getState().user;
          const org = useAuthStore.getState().selectedOrganization;
          setLogCredentials(org?.id || null, user?.id || null);

          // Execute actual API upload call for this batch
          const response = await insertCallLogs({ logs: batchPayload });

          if (response.success) {
            const batchIds = batchLogs.map((l) => l.id);
            await callLogService.markLogsAsSynced(email, batchIds);
            batchIds.forEach(id => syncedLogIds.add(id));

            const progressPct = 20 + Math.round(70 * (syncedLogIds.size / totalLogs));
            onProgress?.(progressPct);
            console.log(`[Sync] Batch successful! Synced ${syncedLogIds.size}/${totalLogs} logs.`);
          } else {
            throw new Error(response.message || "Insert API indicated failure");
          }
        }

        // Prepend successful history log
        const history = await loadHistory(email);
        const updatedHistory = [
          { time: formattedHistoryTime, count: pendingCount, status: "Synced" as const },
          ...history,
        ];
        await saveHistory(email, updatedHistory);
      } catch (err) {
        console.error("Sync API Error:", err);
        
        // Find which logs are still pending/failed and mark them as Failed
        const failedLogs = pendingLogs.filter((l) => !syncedLogIds.has(l.id));
        await callLogService.markLogsAsFailed(email, failedLogs.map((l) => l.id));

        const history = await loadHistory(email);
        const updatedHistory = [
          { time: formattedHistoryTime, count: failedLogs.length, status: "Failed" as const },
          ...history,
        ];
        await saveHistory(email, updatedHistory);

        onProgress?.(100);
        throw err;
      }
    }

    onProgress?.(100);

    // Load updated status metrics
    const updatedLogs = await callLogService.getCallLogs();
    const syncedCount = updatedLogs.filter((log) => log.status === "Synced").length;
    const failedCount = updatedLogs.filter((log) => log.status === "Failed").length;
    const newPendingCount = updatedLogs.filter((log) => log.status === "Pending").length;

    return {
      pendingCount: newPendingCount,
      syncedCount,
      failedCount,
      lastSyncTime: formattedHistoryTime,
      isSyncing: false,
    };
  },
};
