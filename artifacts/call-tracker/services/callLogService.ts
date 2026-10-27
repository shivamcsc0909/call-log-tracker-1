import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform, PermissionsAndroid } from "react-native";
import type { CallLog, DashboardStats } from "@/types";

const { CallLogModule } = NativeModules;
const STORAGE_KEY = "local_call_logs";

const INITIAL_MOCK_LOGS: Record<string, CallLog[]> = {
  "demo@company.com": [
    { id: 1, number: "+91 9876543210", name: "Rajesh Kumar", duration: "4m 20s", durationSeconds: 260, date: "21 Jun 2026", time: "11:45 AM", status: "Synced", type: "Outgoing" },
    { id: 2, number: "+91 8765432109", name: "Priya Sharma", duration: "2m 05s", durationSeconds: 125, date: "21 Jun 2026", time: "10:30 AM", status: "Synced", type: "Incoming" },
    { id: 3, number: "+91 7654321098", duration: "0m 45s", durationSeconds: 45, date: "21 Jun 2026", time: "09:15 AM", status: "Pending", type: "Missed" },
    { id: 4, number: "+91 9988776655", name: "Amit Patel", duration: "8m 32s", durationSeconds: 512, date: "20 Jun 2026", time: "04:22 PM", status: "Synced", type: "Incoming" },
    { id: 5, number: "+91 8877665544", name: "Sunita Verma", duration: "1m 18s", durationSeconds: 78, date: "20 Jun 2026", time: "02:10 PM", status: "Synced", type: "Outgoing" },
    { id: 6, number: "+91 7766554433", duration: "0m 00s", durationSeconds: 0, date: "20 Jun 2026", time: "01:05 PM", status: "Pending", type: "Missed" },
    { id: 7, number: "+91 6655443322", name: "Deepak Singh", duration: "12m 44s", durationSeconds: 764, date: "19 Jun 2026", time: "11:30 AM", status: "Synced", type: "Outgoing" },
    { id: 8, number: "+91 5544332211", name: "Anita Rao", duration: "3m 56s", durationSeconds: 236, date: "19 Jun 2026", time: "09:48 AM", status: "Synced", type: "Incoming" },
    { id: 9, number: "+91 9123456789", name: "Vikram Nair", duration: "6m 02s", durationSeconds: 362, date: "18 Jun 2026", time: "03:15 PM", status: "Synced", type: "Outgoing" },
    { id: 10, number: "+91 8234567890", duration: "0m 00s", durationSeconds: 0, date: "18 Jun 2026", time: "01:40 PM", status: "Failed", type: "Missed" },
  ],
  "client.test@company.com": [
    { id: 101, number: "+1 555-0199", name: "John Doe", duration: "5m 12s", durationSeconds: 312, date: "22 Jun 2026", time: "04:15 PM", status: "Synced", type: "Outgoing" },
    { id: 102, number: "+1 555-0142", name: "Jane Smith", duration: "2m 30s", durationSeconds: 150, date: "22 Jun 2026", time: "03:30 PM", status: "Synced", type: "Incoming" },
    { id: 103, number: "+1 555-0188", duration: "0m 00s", durationSeconds: 0, date: "22 Jun 2026", time: "02:10 PM", status: "Pending", type: "Missed" },
    { id: 104, number: "+1 555-0177", name: "Robert Johnson", duration: "4m 15s", durationSeconds: 255, date: "22 Jun 2026", time: "01:45 PM", status: "Pending", type: "Incoming" },
    { id: 105, number: "+1 555-0166", name: "Emily Davis", duration: "1m 45s", durationSeconds: 105, date: "22 Jun 2026", time: "11:20 AM", status: "Pending", type: "Outgoing" },
    { id: 106, number: "+1 555-0155", name: "Michael Brown", duration: "8m 20s", durationSeconds: 500, date: "21 Jun 2026", time: "05:12 PM", status: "Synced", type: "Incoming" },
    { id: 107, number: "+1 555-0133", duration: "0m 00s", durationSeconds: 0, date: "21 Jun 2026", time: "03:05 PM", status: "Failed", type: "Missed" },
    { id: 108, number: "+1 555-0122", name: "William Jones", duration: "3m 10s", durationSeconds: 190, date: "20 Jun 2026", time: "10:30 AM", status: "Synced", type: "Outgoing" },
  ],
};

const formatDate = (date: Date): string => {
  const day = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const getActiveUserEmail = (): string => {
  try {
    const { useAuthStore } = require("@/store/authStore");
    return useAuthStore.getState().user?.email || "demo@company.com";
  } catch {
    return "demo@company.com";
  }
};

const loadAllLogs = async (): Promise<Record<string, CallLog[]>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error loading call logs:", e);
  }
  // Initialize with mock logs if not found
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_LOGS));
  return INITIAL_MOCK_LOGS;
};

const saveAllLogs = async (logs: Record<string, CallLog[]>) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error("Error saving call logs:", e);
  }
};

export const callLogService = {
  getCallLogs: async (): Promise<CallLog[]> => {
    const email = getActiveUserEmail();
    const all = await loadAllLogs();
    const existingLogs = all[email] || [];

    if (Platform.OS === "android" && CallLogModule) {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
        );
        if (hasPermission) {
          const deviceLogs: CallLog[] = await CallLogModule.getCallLogs(0);
          
          // Merge device logs with existing logs to preserve sync status
          const existingMap = new Map(existingLogs.map((l) => [l.id, l]));
          const mergedLogs = deviceLogs.map((dLog) => {
            const existing = existingMap.get(dLog.id);
            return {
              ...dLog,
              status: existing ? existing.status : ("Pending" as const),
            };
          });

          // Preserve manual/test logs not present on device (e.g., added via app UI)
          const deviceLogIds = new Set(deviceLogs.map((l) => l.id));
          const manuallyAddedLogs = existingLogs.filter((l) => !deviceLogIds.has(l.id));

          const finalLogs = [...mergedLogs, ...manuallyAddedLogs];

          all[email] = finalLogs;
          await saveAllLogs(all);
          return finalLogs;
        }
      } catch (e) {
        console.error("Error reading device call logs:", e);
      }
    }

    return existingLogs;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const email = getActiveUserEmail();
    const logs = await callLogService.getCallLogs();

    let todayStr = formatDate(new Date());
    // Fallback to mock dates for demo data if no records match today's actual date
    if (!logs.some((log) => log.date === todayStr) && logs.length > 0) {
      const mockToday = email === "client.test@company.com" ? "22 Jun 2026" : "21 Jun 2026";
      if (logs.some((log) => log.date === mockToday)) {
        todayStr = mockToday;
      }
    }

    const todayCalls = logs.filter((log) => log.date === todayStr).length;
    const weeklyCalls = logs.length;

    const totalSeconds = logs
      .filter((log) => log.type !== "Missed")
      .reduce((sum, log) => sum + log.durationSeconds, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const totalDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const hasPending = logs.some((log) => log.status === "Pending");
    const hasFailed = logs.some((log) => log.status === "Failed");
    const syncStatus = hasPending ? "Pending" : hasFailed ? "Failed" : "Synced";

    return {
      todayCalls,
      weeklyCalls,
      totalDuration,
      syncStatus,
    };
  },

  searchCallLogs: async (query: string): Promise<CallLog[]> => {
    const email = getActiveUserEmail();
    const all = await loadAllLogs();
    const logs = all[email] || [];
    const q = query.toLowerCase();
    return logs.filter(
      (log) =>
        log.number.includes(q) ||
        (log.name?.toLowerCase().includes(q) ?? false) ||
        log.type.toLowerCase().includes(q)
    );
  },

  addCallLog: async (number: string, type: "Incoming" | "Outgoing" | "Missed", durationSeconds: number, name?: string): Promise<CallLog> => {
    const email = getActiveUserEmail();
    const all = await loadAllLogs();
    const logs = all[email] || [];

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const dateStr = formatDate(now);

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const duration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    const newLog: CallLog = {
      id: Date.now(),
      number,
      name,
      duration,
      durationSeconds,
      date: dateStr,
      time: timeStr,
      status: "Pending",
      type,
    };

    all[email] = [newLog, ...logs];
    await saveAllLogs(all);
    return newLog;
  },

  markLogsAsSynced: async (email: string, logIds: number[]) => {
    const all = await loadAllLogs();
    const logs = all[email] || [];
    all[email] = logs.map((log) => {
      if (logIds.includes(log.id)) {
        return { ...log, status: "Synced" as const };
      }
      return log;
    });
    await saveAllLogs(all);
  },

  markLogsAsFailed: async (email: string, logIds: number[]) => {
    const all = await loadAllLogs();
    const logs = all[email] || [];
    all[email] = logs.map((log) => {
      if (logIds.includes(log.id)) {
        return { ...log, status: "Failed" as const };
      }
      return log;
    });
    await saveAllLogs(all);
  },
};
