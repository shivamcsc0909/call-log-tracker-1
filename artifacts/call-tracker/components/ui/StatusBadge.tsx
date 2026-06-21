import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { typography } from "@/constants/spacing";

type Status = "Synced" | "Pending" | "Failed" | "Success" | "Active" | "Inactive" | string;

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const colors = useColors();

  const config: Record<string, { bg: string; text: string; dot: string }> = {
    Synced: { bg: colors.successMuted, text: colors.successForeground, dot: colors.success },
    Success: { bg: colors.successMuted, text: colors.successForeground, dot: colors.success },
    Active: { bg: colors.successMuted, text: colors.successForeground, dot: colors.success },
    Pending: { bg: colors.warningMuted, text: colors.warningForeground, dot: colors.warning },
    Failed: { bg: "#FEE2E2", text: "#991B1B", dot: colors.destructive },
    Inactive: { bg: colors.muted, text: colors.mutedForeground, dot: colors.mutedForeground },
  };

  const c = config[status] ?? {
    bg: colors.muted,
    text: colors.mutedForeground,
    dot: colors.mutedForeground,
  };

  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderRadius: 6 }, size === "md" && styles.badgeMd]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.text, { color: c.text }, size === "md" && { fontSize: 12 }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
    alignSelf: "flex-start",
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  text: {
    ...typography.label,
    letterSpacing: 0.2,
  },
});
