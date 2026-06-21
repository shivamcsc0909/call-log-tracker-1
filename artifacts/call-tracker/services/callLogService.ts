import type { CallLog, DashboardStats } from "@/types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const MOCK_CALL_LOGS: CallLog[] = [
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
  { id: 11, number: "+91 7345678901", name: "Meera Iyer", duration: "5m 20s", durationSeconds: 320, date: "17 Jun 2026", time: "10:22 AM", status: "Synced", type: "Incoming" },
  { id: 12, number: "+91 6456789012", name: "Suresh Babu", duration: "9m 10s", durationSeconds: 550, date: "17 Jun 2026", time: "08:55 AM", status: "Synced", type: "Outgoing" },
  { id: 13, number: "+91 5567890123", duration: "0m 00s", durationSeconds: 0, date: "16 Jun 2026", time: "05:30 PM", status: "Pending", type: "Missed" },
  { id: 14, number: "+91 4678901234", name: "Kavya Reddy", duration: "7m 15s", durationSeconds: 435, date: "16 Jun 2026", time: "02:45 PM", status: "Synced", type: "Incoming" },
  { id: 15, number: "+91 3789012345", name: "Ravi Menon", duration: "2m 30s", durationSeconds: 150, date: "15 Jun 2026", time: "11:10 AM", status: "Synced", type: "Outgoing" },
];

export const callLogService = {
  getCallLogs: async (): Promise<CallLog[]> => {
    await delay(800);
    return MOCK_CALL_LOGS;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(600);
    return {
      todayCalls: 18,
      weeklyCalls: 126,
      totalDuration: "7h 35m",
      syncStatus: "Synced",
    };
  },

  searchCallLogs: async (query: string): Promise<CallLog[]> => {
    await delay(300);
    const q = query.toLowerCase();
    return MOCK_CALL_LOGS.filter(
      (log) =>
        log.number.includes(q) ||
        (log.name?.toLowerCase().includes(q) ?? false) ||
        log.type.toLowerCase().includes(q)
    );
  },
};
