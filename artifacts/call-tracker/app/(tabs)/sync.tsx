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
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusChip } from "@/components/ui/StatusChip";
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
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}0A`, borderColor: `${color}1A`, borderWidth: 1, borderRadius: 8 }]}>
        <Feather name={icon} size={14} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

// Dynamic history loaded from store

export default function SyncScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { pendingCount, syncedCount, failedCount, lastSyncTime, isSyncing, syncProgress, fetchStatus, syncNow, history, error } = useSyncStore();

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
      {/* Header Spacer */}
      <View style={{ height: insets.top }} />

      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.heroOutline, { borderColor: colors.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: isSyncing ? `${colors.warning}0A` : `${colors.primary}0A` }]}>
            <Feather
              name="refresh-cw"
              size={20}
              color={isSyncing ? colors.warning : colors.primary}
            />
          </View>
        </View>
        <View style={styles.heroText}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            {isSyncing ? "Sync Status" : "Database Sync"}
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            {isSyncing
              ? `Uploading ${pendingCount} records…`
              : lastSyncTime
                ? `Last updated: ${lastSyncTime}`
                : "Never updated"}
          </Text>
        </View>
        <StatusChip status={overallStatus} size="sm" />
      </View>

      {/* Progress Bar */}
      {isSyncing && (
        <View style={[styles.progressWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.foreground }]}>Upload Progress</Text>
            <Text style={[styles.progressPct, { color: colors.primary }]}>
              {Math.round(syncProgress)}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted, borderRadius: 100 }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, borderRadius: 100 },
                barStyle,
              ]}
            />
          </View>
        </View>
      )}

      {/* Error Banner */}
      {error && (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor: `${colors.destructive}0A`,
              borderColor: colors.destructive,
            },
          ]}
        >
          <View style={styles.errorIconContainer}>
            <Feather name="alert-triangle" size={16} color={colors.destructive} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.errorTitle, { color: colors.destructive }]}>
              Sync Failed
            </Text>
            <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
              {error}
            </Text>
          </View>
        </View>
      )}

      {/* Summary */}
      <SectionHeader title="Sync Summary" />
      <View style={styles.stats}>
        <StatPill label="Pending" value={pendingCount} icon="clock" color={colors.warning} />
        <StatPill label="Synced" value={syncedCount} icon="check-circle" color={colors.success} />
        <StatPill label="Failed" value={failedCount} icon="alert-circle" color={colors.destructive} />
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <AppButton
          label={isSyncing ? "Syncing Workspace…" : "Sync Now"}
          onPress={handleSync}
          loading={isSyncing}
          size="lg"
          variant="primary"
          style={styles.syncBtn}
          leftIcon={!isSyncing ? <Feather name="upload-cloud" size={15} color="#fff" /> : undefined}
        />
      </View>

      {/* History */}
      <SectionHeader title="Sync History Logs" />
      <AppCard style={styles.historyCard} padding={0} shadowLevel="xs">
        {history.map((item, i) => (
          <View
            key={i}
            style={[
              styles.histRow,
              { borderBottomColor: colors.border, borderBottomWidth: i < history.length - 1 ? 1 : 0 },
            ]}
          >
            <View style={[styles.histDot, { backgroundColor: item.status === "Synced" ? colors.success : item.status === "Failed" ? colors.destructive : colors.warning }]} />
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={[styles.histTime, { color: colors.foreground }]}>{item.time}</Text>
              <Text style={[styles.histCount, { color: colors.mutedForeground }]}>
                {item.count} records processed
              </Text>
            </View>
            <StatusChip status={item.status} size="sm" />
          </View>
        ))}
        {history.length === 0 && (
          <View style={{ padding: spacing.md, alignItems: "center" }}>
            <Text style={{ color: colors.mutedForeground, ...typography.caption }}>No sync history logs</Text>
          </View>
        )}
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
  heroOutline: {
    borderWidth: 1,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { flex: 1 },
  heroTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  heroSub: { ...typography.caption, fontSize: 11 },
  progressWrap: {
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressLabel: { ...typography.captionMedium, fontWeight: "600", fontSize: 11 },
  progressPct: { ...typography.captionMedium, fontWeight: "700", fontSize: 12 },
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
    paddingVertical: 14,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    gap: 4,
  },
  statIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
  },
  statLabel: { ...typography.captionMedium, fontWeight: "500", fontSize: 11 },
  cta: { paddingHorizontal: spacing.screenH, marginTop: spacing.md },
  syncBtn: {
    marginTop: spacing.xs,
  },
  historyCard: { marginHorizontal: spacing.screenH, borderWidth: 1, borderRadius: 12 },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: 12,
    gap: spacing.md,
  },
  histDot: { width: 5, height: 5, borderRadius: 100 },
  histTime: { ...typography.captionMedium, fontWeight: "600", fontSize: 12, letterSpacing: -0.1 },
  histCount: { ...typography.caption, fontSize: 11 },
  errorBanner: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: spacing.screenH,
    marginTop: spacing.md,
    padding: spacing.base,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  errorIconContainer: {
    marginTop: 2,
  },
  errorTitle: {
    ...typography.captionMedium,
    fontWeight: "700",
    fontSize: 13,
  },
  errorText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
  },
});
