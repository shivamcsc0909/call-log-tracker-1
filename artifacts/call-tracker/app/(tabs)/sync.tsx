import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useColors } from "@/hooks/useColors";
import spacing, { shadow, typography } from "@/constants/spacing";
import { useSyncStore } from "@/store/syncStore";

function StatPill({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statPill,
        shadow.xs,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "14", borderRadius: 10 }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const HISTORY = [
  { time: "Today, 11:45 AM", count: 12, status: "Synced" as const },
  { time: "Yesterday, 6:30 PM", count: 8, status: "Synced" as const },
  { time: "Jun 20, 10:15 AM", count: 15, status: "Synced" as const },
  { time: "Jun 19, 4:22 PM", count: 3, status: "Pending" as const },
];

export default function SyncScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pendingCount, syncedCount, failedCount, lastSyncTime, isSyncing, syncProgress, fetchStatus, syncNow } = useSyncStore();

  const progressWidth = useSharedValue(0);

  useEffect(() => { fetchStatus(); }, []);

  useEffect(() => {
    progressWidth.value = withTiming(syncProgress / 100, { duration: 250 });
  }, [syncProgress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await syncNow();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const overallStatus = pendingCount > 0 ? "Pending" : failedCount > 0 ? "Failed" : "Synced";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.heroIcon, { backgroundColor: isSyncing ? colors.warningMuted : colors.secondary, borderRadius: 20 }]}>
          <Feather
            name="refresh-cw"
            size={28}
            color={isSyncing ? colors.warning : colors.primary}
          />
        </View>
        <View style={styles.heroText}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            {isSyncing ? "Syncing records…" : "Call Log Sync"}
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            {isSyncing
              ? `Uploading ${pendingCount} records to server`
              : lastSyncTime
                ? `Last synced ${lastSyncTime}`
                : "Never synced"}
          </Text>
        </View>
        <StatusBadge status={overallStatus} size="md" />
      </View>

      {/* Progress Bar */}
      {isSyncing && (
        <View style={[styles.progressWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.foreground }]}>Upload progress</Text>
            <Text style={[styles.progressPct, { color: colors.primary }]}>
              {Math.round(syncProgress)}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted, borderRadius: 4 }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, borderRadius: 4 },
                barStyle,
              ]}
            />
          </View>
        </View>
      )}

      {/* Summary */}
      <SectionTitle title="Summary" />
      <View style={styles.stats}>
        <StatPill label="Pending" value={pendingCount} icon="clock" color={colors.warning} />
        <StatPill label="Synced" value={syncedCount} icon="check-circle" color={colors.success} />
        <StatPill label="Failed" value={failedCount} icon="alert-circle" color={colors.destructive} />
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <AppButton
          label={isSyncing ? "Syncing…" : "Sync Now"}
          onPress={handleSync}
          loading={isSyncing}
          size="lg"
          leftIcon={!isSyncing ? <Feather name="upload-cloud" size={18} color="#fff" /> : undefined}
        />
      </View>

      {/* History */}
      <SectionTitle title="Sync History" />
      <AppCard style={styles.historyCard} padding={0}>
        {HISTORY.map((item, i) => (
          <View
            key={i}
            style={[
              styles.histRow,
              { borderBottomColor: colors.border, borderBottomWidth: i < HISTORY.length - 1 ? 1 : 0 },
            ]}
          >
            <View style={[styles.histDot, { backgroundColor: item.status === "Synced" ? colors.success : colors.warning }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.histTime, { color: colors.foreground }]}>{item.time}</Text>
              <Text style={[styles.histCount, { color: colors.mutedForeground }]}>
                {item.count} records
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>
        ))}
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  heroIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { flex: 1 },
  heroTitle: { ...typography.title, marginBottom: 2 },
  heroSub: { ...typography.caption },
  progressWrap: {
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  progressLabel: { ...typography.bodyMedium },
  progressPct: { ...typography.title },
  progressTrack: { height: 6, overflow: "hidden" },
  progressFill: { height: 6 },
  stats: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.screenH,
  },
  statPill: {
    flex: 1,
    alignItems: "center",
    padding: spacing.base,
    borderWidth: 1,
    gap: spacing.sm,
  },
  statIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  statLabel: { ...typography.captionMedium },
  cta: { paddingHorizontal: spacing.screenH, marginTop: spacing.xl },
  historyCard: { marginHorizontal: spacing.screenH },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  histDot: { width: 8, height: 8, borderRadius: 4 },
  histTime: { ...typography.bodyMedium, marginBottom: 2 },
  histCount: { ...typography.caption },
});
