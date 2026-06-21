import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PermissionCard } from "@/components/PermissionCard";
import { AppButton } from "@/components/ui/AppButton";
import { useColors } from "@/hooks/useColors";
import spacing, { shadow, typography } from "@/constants/spacing";
import { usePermissionStore } from "@/store/permissionStore";

export default function PermissionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { permissions, allGranted, grantPermission } = usePermissionStore();

  const grantedCount = permissions.filter((p) => p.status === "granted").length;
  const pct = (grantedCount / permissions.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[styles.shieldWrap, { backgroundColor: colors.secondary, borderRadius: 16 }]}
          >
            <Feather name="shield" size={26} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>App Permissions</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            CallTrack Pro needs the following permissions to monitor and sync call activity from your device.
          </Text>
        </View>

        {/* Progress */}
        <View
          style={[
            styles.progressCard,
            shadow.xs,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 },
          ]}
        >
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.foreground }]}>Setup progress</Text>
            <Text style={[styles.progressPct, { color: colors.primary }]}>
              {grantedCount}/{permissions.length}
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.muted, borderRadius: 4 }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: colors.primary, borderRadius: 4, width: `${pct}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressSub, { color: colors.mutedForeground }]}>
            {allGranted ? "All permissions granted — you're ready to go!" : "Grant all permissions to continue"}
          </Text>
        </View>

        {/* Permission Cards */}
        <View style={styles.cards}>
          {permissions.map((p) => (
            <PermissionCard key={p.id} permission={p} onGrant={() => grantPermission(p.id)} />
          ))}
        </View>

        {/* Info */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.secondary, borderColor: colors.accent, borderRadius: 12 },
          ]}
        >
          <Feather name="lock" size={14} color={colors.primary} style={{ marginTop: 1 }} />
          <Text style={[styles.infoText, { color: colors.secondaryForeground }]}>
            Your data is encrypted and only shared with your organization's admin portal. No third parties.
          </Text>
        </View>

        <AppButton
          label={allGranted ? "Continue to Dashboard" : `Waiting for permissions (${grantedCount}/${permissions.length})`}
          onPress={() => router.replace("/(tabs)")}
          disabled={!allGranted}
          size="lg"
          rightIcon={allGranted ? <Feather name="arrow-right" size={18} color="#fff" /> : undefined}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.screenH },
  header: { alignItems: "center", marginBottom: spacing.xl },
  shieldWrap: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 22,
  },
  progressCard: {
    padding: spacing.base,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  progressLabel: { ...typography.bodyMedium },
  progressPct: { ...typography.title },
  track: { height: 6, marginBottom: spacing.sm, overflow: "hidden" },
  fill: { height: 6 },
  progressSub: { ...typography.caption },
  cards: { gap: spacing.sm, marginBottom: spacing.lg },
  infoBox: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.xl,
    alignItems: "flex-start",
  },
  infoText: { flex: 1, ...typography.caption, lineHeight: 18 },
});
