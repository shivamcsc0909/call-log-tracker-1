import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useColors } from "@/hooks/useColors";
import spacing, { shadow, typography } from "@/constants/spacing";
import { useAuthStore } from "@/store/authStore";
import { usePermissionStore } from "@/store/permissionStore";

function MenuRow({
  icon,
  label,
  value,
  onPress,
  danger,
  showArrow = true,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  showArrow?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: danger ? colors.destructive + "14" : colors.secondary,
            borderRadius: 9,
          },
        ]}
      >
        <Feather name={icon} size={15} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text
        style={[
          styles.menuLabel,
          { color: danger ? colors.destructive : colors.foreground },
        ]}
      >
        {label}
      </Text>
      {value && (
        <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{value}</Text>
      )}
      {showArrow && (
        <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const { reset: resetPermissions } = usePermissionStore();

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          resetPermissions();
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      {/* Avatar Card */}
      <View
        style={[
          styles.avatarCard,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }, shadow.md]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{user?.name}</Text>
        <Text style={[styles.role, { color: colors.primary }]}>{user?.role}</Text>
        <View
          style={[
            styles.deptBadge,
            { backgroundColor: colors.secondary, borderRadius: 8 },
          ]}
        >
          <Feather name="briefcase" size={12} color={colors.primary} />
          <Text style={[styles.deptText, { color: colors.secondaryForeground }]}>
            {user?.department}
          </Text>
        </View>
      </View>

      {/* Info Card */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        Account Details
      </Text>
      <AppCard style={styles.infoCard} padding={0}>
        <InfoRow label="Employee ID" value={user?.employeeId ?? "—"} />
        <InfoRow label="Email" value={user?.email ?? "—"} />
        <InfoRow label="Department" value={user?.department ?? "—"} />
        <View style={[styles.infoRow, { borderBottomWidth: 0, borderBottomColor: "transparent" }]}>
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Member Since</Text>
          <Text style={[styles.infoValue, { color: colors.foreground }]}>Jan 2024</Text>
        </View>
      </AppCard>

      {/* Stats */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Activity</Text>
      <View style={styles.statsRow}>
        {[
          { label: "Total Calls", value: "126" },
          { label: "Synced", value: "122" },
          { label: "This Week", value: "18" },
        ].map((s) => (
          <View
            key={s.label}
            style={[
              styles.statBox,
              shadow.xs,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Manage</Text>
      <AppCard style={styles.menuCard} padding={0}>
        <MenuRow
          icon="user"
          label="Edit Profile"
          onPress={() => Alert.alert("Edit Profile", "Profile editing coming soon.")}
        />
        <MenuRow
          icon="settings"
          label="Settings"
          onPress={() => router.push("/settings")}
        />
        <MenuRow
          icon="shield"
          label="Permissions"
          onPress={() => router.push("/permissions")}
        />
        <MenuRow
          icon="help-circle"
          label="Help & Support"
          onPress={() => {}}
          showArrow
        />
        <MenuRow
          icon="phone-call"
          label="Total Calls Logged"
          value="126"
          onPress={() => {}}
          showArrow={false}
        />
      </AppCard>

      {/* Sign Out */}
      <View style={styles.signOut}>
        <AppButton
          label="Sign Out"
          variant="danger"
          onPress={handleLogout}
          loading={isLoading}
          size="lg"
          leftIcon={<Feather name="log-out" size={17} color="#fff" />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarCard: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.screenH,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  avatarText: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  role: { ...typography.bodyMedium },
  deptBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginTop: spacing.xs,
  },
  deptText: { ...typography.captionMedium },
  sectionLabel: {
    ...typography.label,
    marginHorizontal: spacing.screenH,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  infoCard: { marginHorizontal: spacing.screenH },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  infoLabel: { ...typography.bodyMedium },
  infoValue: { ...typography.bodyMedium, textAlign: "right", flex: 1, marginLeft: spacing.md },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.screenH,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.base,
    borderWidth: 1,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  statLabel: { ...typography.caption, marginTop: 2 },
  menuCard: { marginHorizontal: spacing.screenH },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  menuIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, ...typography.body },
  menuValue: { ...typography.bodyMedium },
  signOut: { marginHorizontal: spacing.screenH, marginTop: spacing.xl },
});
