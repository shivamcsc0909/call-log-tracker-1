import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PermissionCard } from "@/components/PermissionCard";
import { useColors } from "@/hooks/useColors";
import { usePermissionStore } from "@/store/permissionStore";

export default function PermissionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { permissions, allGranted, grantPermission } = usePermissionStore();

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  const grantedCount = permissions.filter((p) => p.status === "granted").length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: colors.secondary, borderRadius: colors.radius + 4 },
            ]}
          >
            <Feather name="shield" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>App Permissions</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Grant the following permissions so CallTrack Pro can monitor and sync your call activity.
          </Text>

          <View
            style={[
              styles.progressBar,
              { backgroundColor: colors.muted, borderRadius: 4 },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                  width: `${(grantedCount / permissions.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
            {grantedCount} of {permissions.length} permissions granted
          </Text>
        </View>

        <View style={styles.cards}>
          {permissions.map((p) => (
            <PermissionCard key={p.id} permission={p} onGrant={() => grantPermission(p.id)} />
          ))}
        </View>

        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.secondary,
              borderRadius: colors.radius,
              borderColor: colors.accent,
            },
          ]}
        >
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.accentForeground }]}>
            These permissions are used only for call tracking within your organization. No data is shared with third parties.
          </Text>
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!allGranted}
          style={({ pressed }) => [
            styles.continueBtn,
            {
              backgroundColor: allGranted ? colors.primary : colors.muted,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.continueBtnText,
              { color: allGranted ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            {allGranted ? "Continue to Dashboard" : `Grant All Permissions (${grantedCount}/${permissions.length})`}
          </Text>
          {allGranted && <Feather name="arrow-right" size={18} color={colors.primaryForeground} style={{ marginLeft: 8 }} />}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 28 },
  iconWrap: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  progressBar: {
    width: "100%",
    height: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  cards: { marginBottom: 20 },
  infoBox: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  continueBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
