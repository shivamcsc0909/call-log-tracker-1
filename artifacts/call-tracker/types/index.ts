export interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  role: string;
  avatar?: string;
}

export interface CallLog {
  id: number;
  number: string;
  name?: string;
  duration: string;
  durationSeconds: number;
  date: string;
  time: string;
  status: "Synced" | "Pending" | "Failed";
  type: "Incoming" | "Outgoing" | "Missed";
}

export interface SyncRecord {
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
}

export interface DashboardStats {
  todayCalls: number;
  weeklyCalls: number;
  totalDuration: string;
  syncStatus: "Synced" | "Pending" | "Failed";
}

export type PermissionStatus = "granted" | "denied" | "undetermined";

export interface Permission {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: PermissionStatus;
}
