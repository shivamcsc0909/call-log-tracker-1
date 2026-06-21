import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatCard } from "@/components/StatCard";
import { StatSkeleton } from "@/components/SkeletonLoader";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { useCallLogStore } from "@/store/callLogStore";
import { useSyncStore } from "@/store/syncStore";

function QuickAction({
  icon,
  label,
  onPress,
  accent,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  accent?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.qaIcon, { backgroundColor: (accent ?? colors.primary) + "18", borderRadius: 10 }]}>
        <Feather name={icon} size={18} color={accent ?? colors.primary} />
      </View>
      <Text style={[styles.qaLabel, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats, isLoading, isRefreshing, fetchStats, refresh } = useCallLogStore();
  const { fetchStatus, syncNow, isSyncing, lastSyncTime } = useSyncStore();

  useEffect(() => {
    fetchStats();
    fetchStatus();
  }, []);

  const handleSyncNow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await syncNow();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const firstName = user?.name.split(" ")[0] ?? "User";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statusColor =
    stats?.syncStatus === "Synced"
      ? colors.success
      : stats?.syncStatus === "Failed"
        ? colors.destructive
        : colors.warning;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 100,
        paddingTop: 8,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={[styles.topBar, { paddingHorizontal: 20 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting},</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{firstName}</Text>
        </View>
        <View style={[styles.syncBadge, { backgroundColor: statusColor + "18", borderRadius: 20 }]}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.syncBadgeText, { color: statusColor }]}>
            {stats?.syncStatus ?? "Checking..."}
          </Text>
        </View>
      </View>

      {lastSyncTime && (
        <Text style={[styles.lastSync, { color: colors.mutedForeground }]}>
          Last sync: {lastSyncTime}
        </Text>
      )}

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
      {isLoading ? (
        <View style={styles.statsGrid}>
          <StatSkeleton />
          <StatSkeleton />
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              title="Today's Calls"
              value={stats?.todayCalls ?? 0}
              subtitle="calls today"
              accent={colors.primary}
            />
            <StatCard
              title="Weekly Calls"
              value={stats?.weeklyCalls ?? 0}
              subtitle="this week"
              accent={colors.info}
            />
          </View>
          <View style={[styles.statsGrid, { marginTop: 10 }]}>
            <StatCard
              title="Total Duration"
              value={stats?.totalDuration ?? "—"}
              subtitle="total talk time"
              accent={colors.success}
            />
            <StatCard
              title="Sync Status"
              value={stats?.syncStatus ?? "—"}
              subtitle="auto-synced"
              accent={statusColor}
            />
          </View>
        </>
      )}

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <QuickAction
          icon="list"
          label="View Logs"
          onPress={() => router.push("/(tabs)/logs")}
        />
        <QuickAction
          icon="refresh-cw"
          label="Sync Now"
          onPress={handleSyncNow}
          accent={isSyncing ? colors.warning : colors.success}
        />
        <QuickAction
          icon="rotate-cw"
          label="Refresh"
          onPress={() => { refresh(); fetchStatus(); }}
          accent={colors.info}
        />
      </View>

      <View
        style={[
          styles.activityCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius + 2,
            marginHorizontal: 20,
          },
        ]}
      >
        <View style={styles.activityHeader}>
          <Text style={[styles.activityTitle, { color: colors.foreground }]}>Call Activity</Text>
          <Pressable onPress={() => router.push("/(tabs)/logs")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </Pressable>
        </View>
        {[
          { icon: "phone-incoming" as const, label: "Incoming calls", value: "74", color: colors.success },
          { icon: "phone-outgoing" as const, label: "Outgoing calls", value: "38", color: colors.primary },
          { icon: "phone-missed" as const, label: "Missed calls", value: "14", color: colors.destructive },
        ].map((item) => (
          <View key={item.label} style={[styles.activityRow, { borderTopColor: colors.border }]}>
            <View style={[styles.activityIcon, { backgroundColor: item.color + "14", borderRadius: 8 }]}>
              <Feather name={item.icon} size={14} color={item.color} />
            </View>
            <Text style={[styles.activityLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            <Text style={[styles.activityValue, { color: colors.foreground }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  greeting: { fontSize: 12, fontFamily: "Inter_400Regular" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  syncBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  syncBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  lastSync: { fontSize: 11, fontFamily: "Inter_400Regular", marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  statsGrid: { flexDirection: "row", gap: 10, marginHorizontal: 20 },
  quickActions: { flexDirection: "row", gap: 10, marginHorizontal: 20, marginBottom: 4 },
  quickAction: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  qaIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  activityCard: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  activityHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  activityTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 12,
  },
  activityIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  activityLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  activityValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
});
