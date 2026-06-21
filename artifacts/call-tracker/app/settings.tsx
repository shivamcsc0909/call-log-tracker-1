import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/ui/AppHeader";
import { AppCard } from "@/components/ui/AppCard";
import { useColors } from "@/hooks/useColors";
import spacing, { typography } from "@/constants/spacing";

function SettingRow({
  icon,
  label,
  value,
  toggle,
  toggleValue,
  onToggle,
  onPress,
  last = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  last?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={!toggle ? onPress : undefined}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: last ? 0 : 1,
          opacity: pressed && !toggle ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.secondary, borderRadius: 9 }]}>
        <Feather name={icon} size={15} color={colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary + "80" }}
          thumbColor={toggleValue ? colors.primary : colors.mutedForeground}
        />
      ) : (
        <View style={styles.rowRight}>
          {value && (
            <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
          )}
          <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
        </View>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Settings" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      >
        <Text style={[styles.section, { color: colors.mutedForeground }]}>Preferences</Text>
        <AppCard style={styles.card} padding={0}>
          <SettingRow icon="moon" label="Dark Mode" toggle toggleValue={darkMode} onToggle={setDarkMode} />
          <SettingRow icon="bell" label="Push Notifications" toggle toggleValue={notifications} onToggle={setNotifications} />
          <SettingRow icon="refresh-cw" label="Auto Sync" toggle toggleValue={autoSync} onToggle={setAutoSync} last />
        </AppCard>

        <Text style={[styles.section, { color: colors.mutedForeground }]}>App Info</Text>
        <AppCard style={styles.card} padding={0}>
          <SettingRow icon="info" label="App Version" value="1.0.0" />
          <SettingRow icon="tag" label="Build Number" value="100" />
          <SettingRow icon="code" label="Environment" value="Production" last />
        </AppCard>

        <Text style={[styles.section, { color: colors.mutedForeground }]}>Legal</Text>
        <AppCard style={styles.card} padding={0}>
          <SettingRow icon="shield" label="Privacy Policy" onPress={() => {}} />
          <SettingRow icon="file-text" label="Terms of Service" onPress={() => {}} />
          <SettingRow icon="book-open" label="Licenses" onPress={() => {}} last />
        </AppCard>

        <Text style={[styles.section, { color: colors.mutedForeground }]}>Support</Text>
        <AppCard style={styles.card} padding={0}>
          <SettingRow icon="mail" label="Contact Support" onPress={() => {}} />
          <SettingRow icon="star" label="Rate App" onPress={() => {}} />
          <SettingRow icon="share-2" label="Share App" onPress={() => {}} last />
        </AppCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: {
    ...typography.label,
    marginHorizontal: spacing.screenH,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  card: { marginHorizontal: spacing.screenH },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: 13,
    gap: spacing.md,
  },
  rowIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, ...typography.body },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  rowValue: { ...typography.bodyMedium },
});
