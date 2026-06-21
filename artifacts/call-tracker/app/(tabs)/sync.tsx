import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useSyncStore } from "@/store/syncStore";

function SyncStatCard({
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
        styles.syncStat,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={[styles.syncStatIcon, { backgroundColor: color + "18", borderRadius: 10 }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.syncStatValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.syncStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function SyncScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    pendingCount,
    syncedCount,
    failedCount,
    lastSyncTime,
    isSyncing,
    syncProgress,
    fetchStatus,
    syncNow,
  } = useSyncStore();

  const progressWidth = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    progressWidth.value = withTiming(syncProgress / 100, { duration: 200 });
    if (isSyncing) {
      pulseScale.value = withSpring(1.05);
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [syncProgress, isSyncing]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await syncNow();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius + 4, marginHorizontal: 16, marginTop: 16 }]}>
        <Animated.View style={[styles.syncIconWrap, { backgroundColor: colors.primary + "18" }, pulseStyle]}>
          {isSyncing ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Feather name="refresh-cw" size={32} color={colors.primary} />
          )}
        </Animated.View>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          {isSyncing ? "Syncing..." : "Call Log Sync"}
        </Text>
        <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
          {isSyncing
            ? `Uploading records to server (${Math.round(syncProgress)}%)`
            : lastSyncTime
              ? `Last synced: ${lastSyncTime}`
              : "Never synced"}
        </Text>

        {isSyncing && (
          <View style={[styles.progressTrack, { backgroundColor: colors.muted, borderRadius: 6 }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, borderRadius: 6 },
                progressStyle,
              ]}
            />
          </View>
        )}

        <Pressable
          onPress={handleSync}
          disabled={isSyncing}
          style={({ pressed }) => [
            styles.syncBtn,
            {
              backgroundColor: isSyncing ? colors.muted : colors.primary,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {isSyncing ? (
            <Text style={[styles.syncBtnText, { color: colors.mutedForeground }]}>Syncing...</Text>
          ) : (
            <>
              <Feather name="upload-cloud" size={18} color={colors.primaryForeground} />
              <Text style={[styles.syncBtnText, { color: colors.primaryForeground }]}>Sync Now</Text>
            </>
          )}
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sync Summary</Text>
      <View style={styles.statsRow}>
        <SyncStatCard label="Pending" value={pendingCount} icon="clock" color={colors.warning} />
        <SyncStatCard label="Synced" value={syncedCount} icon="check-circle" color={colors.success} />
        <SyncStatCard label="Failed" value={failedCount} icon="alert-circle" color={colors.destructive} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sync History</Text>
      <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, marginHorizontal: 16 }]}>
        {[
          { time: "Today 11:45 AM", count: 12, status: "Success" },
          { time: "Yesterday 06:30 PM", count: 8, status: "Success" },
          { time: "Jun 20, 10:15 AM", count: 15, status: "Success" },
          { time: "Jun 19, 04:22 PM", count: 3, status: "Partial" },
        ].map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.historyRow,
              {
                borderBottomColor: colors.border,
                borderBottomWidth: idx < 3 ? 1 : 0,
              },
            ]}
          >
            <View style={[styles.histDot, { backgroundColor: item.status === "Success" ? colors.success : colors.warning }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.histTime, { color: colors.foreground }]}>{item.time}</Text>
              <Text style={[styles.histCount, { color: colors.mutedForeground }]}>
                {item.count} records synced
              </Text>
            </View>
            <View
              style={[
                styles.histBadge,
                {
                  backgroundColor: item.status === "Success" ? colors.success + "18" : colors.warning + "18",
                  borderRadius: 6,
                },
              ]}
            >
              <Text
                style={[
                  styles.histBadgeText,
                  { color: item.status === "Success" ? colors.success : colors.warning },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroCard: {
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 8,
  },
  syncIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 20 },
  progressTrack: { width: "100%", height: 6, marginBottom: 20, overflow: "hidden" },
  progressFill: { height: 6 },
  syncBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 50,
    width: "100%",
  },
  syncBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  statsRow: { flexDirection: "row", gap: 10, marginHorizontal: 16, marginBottom: 4 },
  syncStat: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  syncStatIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  syncStatValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  syncStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  historyCard: {
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  histDot: { width: 8, height: 8, borderRadius: 4 },
  histTime: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 2 },
  histCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  histBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  histBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
