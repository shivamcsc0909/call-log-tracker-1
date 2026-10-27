import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View, Platform, PermissionsAndroid, Linking, Alert, AppState, AppStateStatus } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PermissionCard } from "@/components/PermissionCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useColors } from "@/hooks/useColors";
import spacing, { shadow, typography } from "@/constants/spacing";
import { usePermissionStore } from "@/store/permissionStore";

export default function PermissionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { permissions, allGranted, grantPermission, denyPermission } = usePermissionStore();

  const grantedCount = permissions.filter((p) => p.status === "granted").length;
  const pct = (grantedCount / permissions.length) * 100;
  const anyDenied = permissions.some((p) => p.status === "denied");

  const checkAndRequestAllPermissions = async () => {
    if (Platform.OS !== "android") {
      // Auto-grant for non-Android platforms
      grantPermission("call_log");
      grantPermission("phone_state");
      return;
    }

    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      ]);

      const callLogResult = results[PermissionsAndroid.PERMISSIONS.READ_CALL_LOG];
      const phoneStateResult = results[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE];

      if (callLogResult === PermissionsAndroid.RESULTS.GRANTED) {
        grantPermission("call_log");
      } else {
        denyPermission("call_log");
      }

      if (phoneStateResult === PermissionsAndroid.RESULTS.GRANTED) {
        grantPermission("phone_state");
      } else {
        denyPermission("phone_state");
      }
    } catch (err) {
      console.warn("[Permissions] Error requesting Android permissions:", err);
    }
  };

  const handleSingleGrant = async (id: string) => {
    if (Platform.OS !== "android") {
      grantPermission(id);
      return;
    }

    const permissionMap: Record<string, any> = {
      call_log: PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      phone_state: PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    };

    const androidPermission = permissionMap[id];
    if (!androidPermission) return;

    try {
      const result = await PermissionsAndroid.request(androidPermission);

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        grantPermission(id);
      } else {
        denyPermission(id);
        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            "Permission Required",
            "This permission has been permanently denied. Please open settings and grant it manually to proceed.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        }
      }
    } catch (err) {
      console.warn(`[Permissions] Error requesting permission for ${id}:`, err);
    }
  };

  React.useEffect(() => {
    // Attempt permission request on mount (first app launch)
    checkAndRequestAllPermissions();

    // Listen for AppState changes to auto-grant if user returns from system settings
    const subscription = AppState.addEventListener("change", async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && Platform.OS === "android") {
        try {
          const callLogGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
          );
          const phoneStateGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
          );

          if (callLogGranted) {
            grantPermission("call_log");
          } else if (permissions.find((p) => p.id === "call_log")?.status === "granted") {
            denyPermission("call_log");
          }

          if (phoneStateGranted) {
            grantPermission("phone_state");
          } else if (permissions.find((p) => p.id === "phone_state")?.status === "granted") {
            denyPermission("phone_state");
          }
        } catch (err) {
          console.warn("[AppState] Error re-checking permissions:", err);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.shieldOutline, { borderColor: colors.border }]}>
            <View
              style={[styles.shieldWrap, { backgroundColor: `${colors.primary}08` }]}
            >
              <Feather name="shield" size={22} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Workspace Permissions</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            CallTrack Pro requires access to logs and location data to automatically synchronize your organizational workspace activity.
          </Text>
        </View>

        {/* Permission Denied Explanation Screen */}
        {anyDenied && (
          <AppCard
            style={[
              styles.errorCard,
              { backgroundColor: `${colors.destructive}08`, borderColor: `${colors.destructive}22`, borderWidth: 1 }
            ]}
            padding={16}
            shadowLevel="xs"
          >
            <View style={styles.errorRow}>
              <View style={[styles.errorIconWrap, { backgroundColor: `${colors.destructive}10`, borderRadius: 6 }]}>
                <Feather name="alert-triangle" size={16} color={colors.destructive} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.errorTitle, { color: colors.destructive }]}>Permissions Denied</Text>
                <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
                  CallTrack Pro requires Call Log and Phone State permissions to function. Without these, the application cannot read or sync device logs.
                </Text>
              </View>
            </View>
            <View style={styles.errorActions}>
              <AppButton
                label="Retry Request"
                onPress={checkAndRequestAllPermissions}
                variant="outline"
                size="sm"
                style={{ marginTop: spacing.sm, marginRight: spacing.xs }}
              />
              <AppButton
                label="Open Settings"
                onPress={() => Linking.openSettings()}
                variant="ghost"
                size="sm"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </AppCard>
        )}

        {/* Progress Tracker */}
        <AppCard style={styles.progressCard} padding={20} shadowLevel="xs">
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.foreground }]}>Setup Completion</Text>
            <Text style={[styles.progressPct, { color: colors.primary }]}>
              {grantedCount} of {permissions.length} items enabled
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.muted, borderRadius: 100 }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: colors.primary, borderRadius: 100, width: `${pct}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressSub, { color: colors.mutedForeground }]}>
            {allGranted ? "All permissions granted. Ready to proceed." : "Please enable required permissions below to proceed to your workspace."}
          </Text>
        </AppCard>

        {/* Permission List */}
        <View style={styles.cards}>
          {permissions.map((p) => (
            <PermissionCard key={p.id} permission={p} onGrant={() => handleSingleGrant(p.id)} />
          ))}
        </View>

        {/* Trust/Security box */}
        <AppCard
          style={[
            styles.infoBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          padding={16}
          shadowLevel="xs"
        >
          <View style={styles.infoRow}>
            <View style={[styles.lockIconWrap, { backgroundColor: `${colors.success}0A`, borderRadius: 6 }]}>
              <Feather name="lock" size={13} color={colors.success} />
            </View>
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Data Privacy Guard: </Text>
              Your information is fully encrypted and synced directly to your secure enterprise workspace. We do not store or distribute call audio.
            </Text>
          </View>
        </AppCard>

        <AppButton
          label={allGranted ? "Continue to Workspace" : `Authorize Access (${grantedCount}/${permissions.length})`}
          onPress={() => router.replace("/(tabs)")}
          disabled={!allGranted}
          size="lg"
          rightIcon={<Feather name="arrow-right" size={15} color="#fff" />}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.screenH, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: spacing.xl },
  shieldOutline: {
    borderWidth: 1,
    padding: 5,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: spacing.base,
  },
  shieldWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    ...typography.captionMedium,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  progressCard: {
    borderWidth: 1,
    marginBottom: spacing.lg,
    borderRadius: 16,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.captionMedium,
    fontWeight: "600",
  },
  progressPct: {
    ...typography.captionMedium,
    fontWeight: "700",
    fontSize: 12,
  },
  track: { height: 6, marginBottom: spacing.sm, overflow: "hidden" },
  fill: { height: 6 },
  progressSub: { ...typography.caption, fontSize: 11, lineHeight: 15 },
  cards: { gap: spacing.sm, marginBottom: spacing.lg },
  infoBox: {
    borderWidth: 1,
    marginBottom: spacing.xl,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  lockIconWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  infoText: { flex: 1, ...typography.caption, fontSize: 11, lineHeight: 16 },
  errorCard: {
    borderWidth: 1,
    marginBottom: spacing.lg,
    borderRadius: 16,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  errorIconWrap: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  errorTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  errorText: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 15,
  },
  errorActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
