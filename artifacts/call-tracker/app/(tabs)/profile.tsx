import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

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
        { borderBottomColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: danger ? `${colors.destructive}0A` : `${colors.primary}0A`,
            borderColor: danger ? `${colors.destructive}1A` : `${colors.primary}1A`,
            borderWidth: 1,
            borderRadius: 6,
          },
        ]}
      >
        <Feather name={icon} size={12} color={danger ? colors.destructive : colors.primary} />
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
        <Feather name="chevron-right" size={12} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border, borderBottomWidth: last ? 0 : 1 }]}>
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
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "US";

  const handleLogout = () => {
    const performLogout = async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      resetPermissions();
      await logout();
      router.replace("/login");
    };

    if (Platform.OS === "web") {
      performLogout();
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: performLogout,
        },
      ]);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      {/* Spacer */}
      <View style={{ height: insets.top + spacing.sm }} />

      {/* Avatar Hero Card */}
      <View style={styles.avatarSection}>
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
        <Text style={[styles.name, { color: colors.foreground }]}>{user?.name}</Text>
        <Text style={[styles.role, { color: colors.mutedForeground }]}>{user?.role}</Text>
        
        <View
          style={[
            styles.deptBadge,
            { backgroundColor: `${colors.primary}0A`, borderColor: `${colors.primary}1A`, borderWidth: 1, borderRadius: 100 },
          ]}
        >
          <Feather name="briefcase" size={10} color={colors.primary} />
          <Text style={[styles.deptText, { color: colors.primary }]}>
            {user?.department}
          </Text>
        </View>
      </View>

      {/* Account Info Card */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        Employee Profile
      </Text>
      <AppCard style={styles.infoCard} padding={0} shadowLevel="xs">
        <InfoRow label="Employee ID" value={user?.employeeId ?? "—"} />
        <InfoRow label="Business Email" value={user?.email ?? "—"} />
        <InfoRow label="Department" value={user?.department ?? "—"} />
        <InfoRow label="Member Since" value="Jan 2024" last />
      </AppCard>

      {/* Stats Grid */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Performance Logs</Text>
      <View style={styles.statsRow}>
        {[
          { label: "Total Logs", value: "126" },
          { label: "Synced", value: "122" },
          { label: "This Week", value: "18" },
        ].map((s) => (
          <View
            key={s.label}
            style={[
              styles.statBox,
              shadow.xs,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12, borderWidth: 1 },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Operations Menu */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Operations</Text>
      <AppCard style={styles.menuCard} padding={0} shadowLevel="xs">
        <MenuRow
          icon="user"
          label="Edit Profile Details"
          onPress={() => Alert.alert("Edit Profile", "Profile editing coming soon.")}
        />
        <MenuRow
          icon="settings"
          label="Settings Preferences"
          onPress={() => router.push("/settings")}
        />
        <MenuRow
          icon="shield"
          label="App System Permissions"
          onPress={() => router.push("/permissions")}
        />
        <MenuRow
          icon="help-circle"
          label="Enterprise Help & Support"
          onPress={() => {}}
          showArrow
        />
        <MenuRow
          icon="phone-call"
          label="Lifetime Calls Synced"
          value="126"
          onPress={() => {}}
          showArrow={false}
        />
      </AppCard>

      {/* Sign Out CTA */}
      <View style={styles.signOut}>
        <AppButton
          label="Sign Out of Corporate Account"
          variant="danger"
          onPress={handleLogout}
          loading={isLoading}
          size="lg"
          leftIcon={<Feather name="log-out" size={15} color="#fff" />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.screenH,
    gap: 4,
  },
  avatarOutline: {
    borderWidth: 1,
    padding: 4,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.4 },
  name: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  role: { ...typography.captionMedium, fontWeight: "500" },
  deptBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: spacing.sm,
  },
  deptText: { ...typography.captionMedium, fontSize: 11, fontWeight: "600" },
  sectionLabel: {
    ...typography.label,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginHorizontal: spacing.screenH,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  infoCard: { marginHorizontal: spacing.screenH, borderWidth: 1, borderRadius: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: 12,
  },
  infoLabel: { ...typography.captionMedium, fontWeight: "500" },
  infoValue: { ...typography.captionMedium, fontWeight: "600", textAlign: "right", flex: 1, marginLeft: spacing.md },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.screenH,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  statLabel: { ...typography.caption, fontSize: 11, fontWeight: "500", marginTop: 1 },
  menuCard: { marginHorizontal: spacing.screenH, borderWidth: 1, borderRadius: 12 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: 12,
    gap: spacing.md,
    borderBottomWidth: 1,
  },
  menuIcon: { width: 26, height: 26, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, ...typography.captionMedium, fontWeight: "500" },
  menuValue: { ...typography.captionMedium, fontWeight: "600" },
  signOut: { marginHorizontal: spacing.screenH, marginTop: spacing.xl },
});
