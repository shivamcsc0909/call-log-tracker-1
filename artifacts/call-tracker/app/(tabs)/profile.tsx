import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { usePermissionStore } from "@/store/permissionStore";

function ProfileMenuItem({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.destructive + "14" : colors.muted, borderRadius: 8 }]}>
        <Feather name={icon} size={16} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? colors.destructive : colors.foreground }]}>{label}</Text>
      {value && <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{value}</Text>}
      <Feather name="chevron-right" size={16} color={danger ? colors.destructive : colors.mutedForeground} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  const { reset: resetPermissions } = usePermissionStore();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
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
      ]
    );
  };

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius + 4,
            marginHorizontal: 16,
            marginTop: 16,
          },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{user?.name}</Text>
        <Text style={[styles.role, { color: colors.primary }]}>{user?.role}</Text>
        <Text style={[styles.dept, { color: colors.mutedForeground }]}>{user?.department}</Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.infoRow}>
          {[
            { label: "Employee ID", value: user?.employeeId ?? "—" },
            { label: "Email", value: user?.email ?? "—" },
          ].map((item) => (
            <View key={item.label} style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]} numberOfLines={1}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[styles.section, { color: colors.mutedForeground }]}>Account</Text>
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ProfileMenuItem
          icon="user"
          label="Edit Profile"
          onPress={() => Alert.alert("Edit Profile", "Profile editing coming soon.")}
        />
        <ProfileMenuItem
          icon="settings"
          label="Settings"
          onPress={() => router.push("/settings")}
        />
        <ProfileMenuItem
          icon="shield"
          label="Permissions"
          onPress={() => router.push("/permissions")}
        />
      </View>

      <Text style={[styles.section, { color: colors.mutedForeground }]}>Stats</Text>
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ProfileMenuItem
          icon="phone-call"
          label="Total Calls"
          value="126"
          onPress={() => {}}
        />
        <ProfileMenuItem
          icon="upload-cloud"
          label="Synced Records"
          value="122"
          onPress={() => {}}
        />
        <ProfileMenuItem
          icon="calendar"
          label="Member Since"
          value="Jan 2024"
          onPress={() => {}}
        />
      </View>

      <View style={[styles.signOutContainer, { marginHorizontal: 16, marginTop: 16 }]}>
        <Pressable
          onPress={handleLogout}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.signOutBtn,
            {
              backgroundColor: colors.destructive + "12",
              borderColor: colors.destructive + "40",
              borderRadius: colors.radius,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: {
    alignItems: "center",
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  name: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  role: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  dept: { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider: { height: 1, width: "100%", marginVertical: 16 },
  infoRow: { width: "100%", gap: 10 },
  infoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1, textAlign: "right" },
  section: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  group: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  menuValue: { fontSize: 13, fontFamily: "Inter_400Regular", marginRight: 4 },
  signOutContainer: {},
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderWidth: 1,
    gap: 10,
  },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
