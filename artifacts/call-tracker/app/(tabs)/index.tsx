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

import { MetricCard } from "@/components/ui/MetricCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AppCard } from "@/components/ui/AppCard";
import { StatSkeleton } from "@/components/SkeletonLoader";
import { useColors } from "@/hooks/useColors";
import spacing, { shadow, typography } from "@/constants/spacing";
import { useAuthStore } from "@/store/authStore";
import { useCallLogStore } from "@/store/callLogStore";
import { useSyncStore } from "@/store/syncStore";

function QuickActionTile({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  badge?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.tile,
        shadow.xs,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 14,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.tileIcon, { backgroundColor: colors.secondary, borderRadius: 10 }]}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.tileLabel, { color: colors.foreground }]}>{label}</Text>
      {badge && (
        <View style={[styles.tileBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.tileBadgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats, isLoading, isRefreshing, fetchStats, refresh } = useCallLogStore();
  const { fetchStatus, syncNow, isSyncing, lastSyncTime, pendingCount } = useSyncStore();

  useEffect(() => {
    fetchStats();
    fetchStatus();
  }, []);

  const firstName = user?.name.split(" ")[0] ?? "User";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleSyncNow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await syncNow();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={async () => { await refresh(); fetchStatus(); }}
          tintColor={colors.primary}
        />
      }
    >
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: insets.top + spacing.md,
          },
        ]}
      >
        <View style={styles.topBarLeft}>
          <Text style={[styles.greetingText, { color: colors.mutedForeground }]}>{greeting}</Text>
          <Text style={[styles.nameText, { color: colors.foreground }]}>{firstName}</Text>
        </View>
        <View style={styles.topBarRight}>
          <StatusBadge status={stats?.syncStatus ?? "Pending"} size="md" />
        </View>
      </View>

      {/* Sync Banner */}
      {(pendingCount > 0 || lastSyncTime) && (
        <Pressable
          onPress={handleSyncNow}
          style={[
            styles.syncBanner,
            {
              backgroundColor: pendingCount > 0 ? colors.warningMuted : colors.successMuted,
              borderColor: pendingCount > 0 ? colors.warning + "40" : colors.success + "40",
            },
          ]}
        >
          <Feather
            name={pendingCount > 0 ? "upload-cloud" : "check-circle"}
            size={14}
            color={pendingCount > 0 ? colors.warningForeground : colors.successForeground}
          />
          <Text
            style={[
              styles.syncBannerText,
              { color: pendingCount > 0 ? colors.warningForeground : colors.successForeground },
            ]}
          >
            {pendingCount > 0
              ? `${pendingCount} records pending sync — Tap to sync now`
              : `All synced · ${lastSyncTime}`}
          </Text>
          {pendingCount > 0 && (
            <Feather name="chevron-right" size={13} color={colors.warningForeground} />
          )}
        </Pressable>
      )}

      {/* Metrics */}
      <SectionTitle title="Overview" />
      {isLoading ? (
        <View style={styles.metrics}>
          <StatSkeleton />
          <StatSkeleton />
        </View>
      ) : (
        <>
          <View style={styles.metrics}>
            <MetricCard
              label="Today's Calls"
              value={stats?.todayCalls ?? 0}
              icon="phone"
              iconColor={colors.primary}
              trend="+12%"
              trendUp
            />
            <MetricCard
              label="Weekly Calls"
              value={stats?.weeklyCalls ?? 0}
              icon="bar-chart-2"
              iconColor="#7C3AED"
              trend="+8%"
              trendUp
            />
          </View>
          <View style={[styles.metrics, { marginTop: spacing.sm }]}>
            <MetricCard
              label="Talk Time"
              value={stats?.totalDuration ?? "—"}
              icon="clock"
              iconColor="#0891B2"
              subtitle="this week"
            />
            <MetricCard
              label="Sync Rate"
              value="96.8%"
              icon="refresh-cw"
              iconColor={colors.success}
              trend="+2%"
              trendUp
            />
          </View>
        </>
      )}

      {/* Quick Actions */}
      <SectionTitle title="Quick Actions" />
      <View style={styles.tiles}>
        <QuickActionTile
          icon="phone"
          label="Call Logs"
          onPress={() => router.push("/(tabs)/logs")}
        />
        <QuickActionTile
          icon="upload-cloud"
          label="Sync Now"
          onPress={handleSyncNow}
          badge={pendingCount > 0 ? String(pendingCount) : undefined}
        />
        <QuickActionTile
          icon="refresh-cw"
          label="Refresh"
          onPress={() => { refresh(); fetchStatus(); }}
        />
      </View>

      {/* Call Breakdown */}
      <SectionTitle
        title="Call Breakdown"
        actionLabel="View all"
        onAction={() => router.push("/(tabs)/logs")}
      />
      <AppCard style={styles.breakdownCard}>
        {[
          { icon: "phone-incoming" as const, label: "Incoming", value: 74, color: colors.success },
          { icon: "phone-outgoing" as const, label: "Outgoing", value: 38, color: colors.primary },
          { icon: "phone-missed" as const, label: "Missed", value: 14, color: colors.destructive },
        ].map((item, i, arr) => (
          <View
            key={item.label}
            style={[
              styles.breakdownRow,
              { borderBottomColor: colors.border, borderBottomWidth: i < arr.length - 1 ? 1 : 0 },
            ]}
          >
            <View style={[styles.breakdownIcon, { backgroundColor: item.color + "12", borderRadius: 8 }]}>
              <Feather name={item.icon} size={14} color={item.color} />
            </View>
            <Text style={[styles.breakdownLabel, { color: colors.mutedForeground }]}>
              {item.label}
            </Text>
            <View style={styles.breakdownBar}>
              <View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: item.color + "30",
                    width: `${(item.value / 126) * 100}%`,
                    borderRadius: 4,
                  },
                ]}
              >
                <View
                  style={[
                    styles.barInner,
                    { backgroundColor: item.color, borderRadius: 4, width: "100%" },
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.breakdownValue, { color: colors.foreground }]}>{item.value}</Text>
          </View>
        ))}
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
  },
  topBarLeft: {},
  topBarRight: {},
  greetingText: { ...typography.caption, marginBottom: 2 },
  nameText: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.screenH,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  syncBannerText: { flex: 1, ...typography.captionMedium },
  metrics: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.screenH },
  tiles: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.screenH,
  },
  tile: {
    flex: 1,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 86,
    justifyContent: "center",
    position: "relative",
  },
  tileIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  tileLabel: { ...typography.captionMedium, textAlign: "center" },
  tileBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tileBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  breakdownCard: { marginHorizontal: spacing.screenH, padding: 0, overflow: "hidden" },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    gap: spacing.md,
  },
  breakdownIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  breakdownLabel: { ...typography.bodyMedium, width: 68 },
  breakdownBar: { flex: 1, height: 6, borderRadius: 4, overflow: "hidden" },
  barFill: { height: 6 },
  barInner: { height: 6 },
  breakdownValue: { ...typography.title, width: 28, textAlign: "right" },
});
