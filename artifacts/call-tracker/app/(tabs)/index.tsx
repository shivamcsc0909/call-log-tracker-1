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
import { LinearGradient } from "expo-linear-gradient";

import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusChip } from "@/components/ui/StatusChip";
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
          borderRadius: 12,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.tileIcon, { backgroundColor: `${colors.primary}0A`, borderColor: `${colors.primary}1A`, borderWidth: 1, borderRadius: 8 }]}>
        <Feather name={icon} size={14} color={colors.primary} />
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
  console.log("[DASHBOARD_RENDERED]");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats, isLoading, isRefreshing, fetchStats, refresh } = useCallLogStore();
  const { fetchStatus, syncNow, isSyncing, lastSyncTime, pendingCount } = useSyncStore();

  useEffect(() => {
    console.log("[DASHBOARD SCREEN LOADED]");
    fetchStats();
    fetchStatus();
  }, []);

  const firstName = user?.name ? user.name.split(" ")[0] : "Employee";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "US";
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
          <View style={[styles.avatarOutline, { borderColor: colors.border }]}>
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </View>
          <View style={styles.greetingWrap}>
            <Text style={[styles.greetingText, { color: colors.mutedForeground }]}>{greeting},</Text>
            <Text style={[styles.nameText, { color: colors.foreground }]}>{user?.name ?? firstName}</Text>
          </View>
        </View>
        <View style={styles.topBarRight}>
          <StatusChip status={stats?.syncStatus ?? "Synced"} size="sm" />
        </View>
      </View>

      {/* Sync Banner */}
      {(pendingCount > 0 || lastSyncTime) && (
        <Pressable
          onPress={handleSyncNow}
          style={[
            styles.syncBanner,
            {
              backgroundColor: pendingCount > 0 ? `${colors.warning}08` : `${colors.success}08`,
              borderColor: pendingCount > 0 ? `${colors.warning}1A` : `${colors.success}1A`,
            },
          ]}
        >
          <Feather
            name={pendingCount > 0 ? "upload-cloud" : "check-circle"}
            size={13}
            color={pendingCount > 0 ? colors.warning : colors.success}
          />
          <Text
            style={[
              styles.syncBannerText,
              { color: pendingCount > 0 ? colors.warning : colors.success },
            ]}
          >
            {pendingCount > 0
              ? `${pendingCount} call records ready to sync. Tap to synchronize.`
              : `All systems synchronized · ${lastSyncTime}`}
          </Text>
          {pendingCount > 0 && (
            <Feather name="chevron-right" size={13} color={colors.warning} />
          )}
        </Pressable>
      )}

      {/* Metrics */}
      <SectionHeader title="Performance Overview" />
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
              label="Weekly Logs"
              value={stats?.weeklyCalls ?? 0}
              icon="bar-chart-2"
              iconColor="#7C3AED"
              trend="+8%"
              trendUp
            />
          </View>
          <View style={[styles.metrics, { marginTop: spacing.sm }]}>
            <MetricCard
              label="Talk Duration"
              value={stats?.totalDuration ?? "—"}
              icon="clock"
              iconColor="#0891B2"
              subtitle="this active week"
            />
            <MetricCard
              label="Sync Efficiency"
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
      <SectionHeader title="Quick Operations" />
      <View style={styles.tiles}>
        <QuickActionTile
          icon="phone"
          label="Call Registry"
          onPress={() => router.push("/(tabs)/logs")}
        />
        <QuickActionTile
          icon="upload-cloud"
          label="Force Sync"
          onPress={handleSyncNow}
          badge={pendingCount > 0 ? String(pendingCount) : undefined}
        />
        <QuickActionTile
          icon="refresh-cw"
          label="Refresh Stats"
          onPress={() => { refresh(); fetchStatus(); }}
        />
      </View>

      {/* Call Breakdown */}
      <SectionHeader
        title="Volume Breakdown"
        actionLabel="View Registry"
        onAction={() => router.push("/(tabs)/logs")}
      />
      <AppCard style={styles.breakdownCard} padding={0} shadowLevel="xs">
        {[
          { icon: "phone-incoming" as const, label: "Incoming Calls", value: 74, color: colors.success },
          { icon: "phone-outgoing" as const, label: "Outgoing Calls", value: 38, color: colors.primary },
          { icon: "phone-missed" as const, label: "Missed Calls", value: 14, color: colors.destructive },
        ].map((item, i, arr) => (
          <View
            key={item.label}
            style={[
              styles.breakdownRow,
              { borderBottomColor: colors.border, borderBottomWidth: i < arr.length - 1 ? 1 : 0 },
            ]}
          >
            <View style={[styles.breakdownIcon, { backgroundColor: `${item.color}0A`, borderRadius: 8 }]}>
              <Feather name={item.icon} size={13} color={item.color} />
            </View>
            <View style={styles.breakdownDetails}>
              <View style={styles.breakdownTextRow}>
                <Text style={[styles.breakdownLabel, { color: colors.foreground }]}>
                  {item.label}
                </Text>
                <Text style={[styles.breakdownValue, { color: colors.foreground }]}>{item.value}</Text>
              </View>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: `${colors.border}`,
                      width: "100%",
                      borderRadius: 100,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.barInner,
                      { backgroundColor: item.color, borderRadius: 100, width: `${(item.value / 126) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
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
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatarOutline: {
    borderWidth: 1,
    padding: 3,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  greetingWrap: {
    justifyContent: "center",
  },
  topBarRight: {},
  greetingText: {
    ...typography.caption,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
  },
  nameText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.screenH,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  syncBannerText: { flex: 1, ...typography.captionMedium, fontSize: 11 },
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
    minHeight: 80,
    justifyContent: "center",
    position: "relative",
  },
  tileIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: { ...typography.captionMedium, fontWeight: "600", fontSize: 11, textAlign: "center", letterSpacing: -0.1 },
  tileBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 14,
    height: 14,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  tileBadgeText: { fontSize: 8, fontFamily: "Inter_700Bold", color: "#fff" },
  breakdownCard: { marginHorizontal: spacing.screenH, borderWidth: 1, borderRadius: 12 },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: 12,
    gap: spacing.md,
  },
  breakdownIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  breakdownDetails: {
    flex: 1,
    gap: 4,
  },
  breakdownTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLabel: { ...typography.captionMedium, fontWeight: "600", fontSize: 12, letterSpacing: -0.1 },
  breakdownBar: { height: 3, borderRadius: 100, overflow: "hidden", marginTop: 2 },
  barFill: { height: 3 },
  barInner: { height: 3 },
  breakdownValue: { ...typography.captionMedium, fontWeight: "700", fontSize: 12 },
});
