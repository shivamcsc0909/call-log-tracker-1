import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { typography } from "@/constants/spacing";

export type StatusType = "Synced" | "Pending" | "Failed" | "Success" | "Active" | "Inactive" | string;

interface StatusChipProps {
  status: StatusType;
  size?: "sm" | "md";
}

export function StatusChip({ status, size = "sm" }: StatusChipProps) {
  const colors = useColors();

  const config: Record<string, { bg: string; text: string; dot: string }> = {
    Synced: { bg: `${colors.success}12`, text: colors.success, dot: colors.success },
    Success: { bg: `${colors.success}12`, text: colors.success, dot: colors.success },
    Active: { bg: `${colors.success}12`, text: colors.success, dot: colors.success },
    Pending: { bg: `${colors.warning}12`, text: colors.warning, dot: colors.warning },
    Failed: { bg: `${colors.destructive}12`, text: colors.destructive, dot: colors.destructive },
    Inactive: { bg: `${colors.mutedForeground}12`, text: colors.mutedForeground, dot: colors.mutedForeground },
  };

  const c = config[status] ?? {
    bg: `${colors.mutedForeground}12`,
    text: colors.mutedForeground,
    dot: colors.mutedForeground,
  };

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: c.bg,
          borderColor: `${c.text}25`,
        },
        size === "md" ? styles.chipMd : styles.chipSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.text, { color: c.text }, size === "md" && { fontSize: 12 }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    alignSelf: "flex-start",
    gap: 6,
  },
  chipSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  chipMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  text: {
    ...typography.label,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0,
    textTransform: "capitalize",
  },
});
