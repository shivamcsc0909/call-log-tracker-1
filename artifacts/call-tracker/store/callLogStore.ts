import { create } from "zustand";

import { callLogService } from "@/services/callLogService";
import type { CallLog, DashboardStats } from "@/types";

interface CallLogState {
  logs: CallLog[];
  filteredLogs: CallLog[];
  stats: DashboardStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
  filterType: "All" | "Incoming" | "Outgoing" | "Missed";
  fetchLogs: () => Promise<void>;
  fetchStats: () => Promise<void>;
  refresh: () => Promise<void>;
  setSearch: (query: string) => void;
  setFilter: (type: "All" | "Incoming" | "Outgoing" | "Missed") => void;
}

export const useCallLogStore = create<CallLogState>((set, get) => ({
  logs: [],
  filteredLogs: [],
  stats: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  searchQuery: "",
  filterType: "All",

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const logs = await callLogService.getCallLogs();
      set({ logs, filteredLogs: logs, isLoading: false });
    } catch {
      set({ error: "Failed to load call logs", isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await callLogService.getDashboardStats();
      set({ stats });
    } catch {
      set({ error: "Failed to load stats" });
    }
  },

  refresh: async () => {
    set({ isRefreshing: true });
    try {
      const [logs, stats] = await Promise.all([
        callLogService.getCallLogs(),
        callLogService.getDashboardStats(),
      ]);
      set({ logs, filteredLogs: logs, stats, isRefreshing: false });
    } catch {
      set({ isRefreshing: false });
    }
  },

  setSearch: (query) => {
    const { logs, filterType } = get();
    const q = query.toLowerCase();
    let filtered = logs;
    if (q) {
      filtered = filtered.filter(
        (log) =>
          log.number.includes(q) ||
          (log.name?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filterType !== "All") {
      filtered = filtered.filter((log) => log.type === filterType);
    }
    set({ searchQuery: query, filteredLogs: filtered });
  },

  setFilter: (type) => {
    const { logs, searchQuery } = get();
    const q = searchQuery.toLowerCase();
    let filtered = logs;
    if (q) {
      filtered = filtered.filter(
        (log) =>
          log.number.includes(q) ||
          (log.name?.toLowerCase().includes(q) ?? false)
      );
    }
    if (type !== "All") {
      filtered = filtered.filter((log) => log.type === type);
    }
    set({ filterType: type, filteredLogs: filtered });
  },
}));
