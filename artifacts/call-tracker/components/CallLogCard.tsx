import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { useColors } from "@/hooks/useColors";
import spacing, { typography } from "@/constants/spacing";
import type { CallLog } from "@/types";

interface CallLogCardProps {
  log: CallLog;
  onPress?: () => void;
}

const TYPE_CONFIG = {
  Incoming: { icon: "phone-incoming" as const, color: "#22C55E" },
  Outgoing: { icon: "phone-outgoing" as const, color: "#2563EB" },
  Missed: { icon: "phone-missed" as const, color: "#EF4444" },
};

export function CallLogCard({ log, onPress }: CallLogCardProps) {
  const colors = useColors();
  const tc = TYPE_CONFIG[log.type];

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: tc.color + "12", borderRadius: 22 }]}>
        <Feather name={tc.icon} size={16} color={tc.color} />
      </View>

      <View style={styles.main}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {log.name ?? log.number}
        </Text>
        {log.name && (
          <Text style={[styles.number, { color: colors.mutedForeground }]} numberOfLines={1}>
            {log.number}
          </Text>
        )}
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {log.date} · {log.time}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.duration, { color: log.type === "Missed" ? colors.destructive : colors.foreground }]}>
          {log.type === "Missed" ? "Missed" : log.duration}
        </Text>
        <StatusBadge status={log.status} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.screenH,
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  main: { flex: 1, gap: 2 },
  name: { ...typography.bodyMedium },
  number: { ...typography.caption },
  meta: { ...typography.caption },
  right: { alignItems: "flex-end", gap: spacing.xs },
  duration: { ...typography.captionMedium },
});
