import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { StatusChip } from "@/components/ui/StatusChip";
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
      <View style={[styles.iconWrap, { backgroundColor: `${tc.color}0A`, borderColor: `${tc.color}1A`, borderWidth: 1, borderRadius: 8 }]}>
        <Feather name={tc.icon} size={14} color={tc.color} />
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
        <StatusChip status={log.status} size="sm" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.screenH,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  main: { flex: 1, gap: 1 },
  name: { ...typography.captionMedium, fontWeight: "600", fontSize: 13, letterSpacing: -0.1 },
  number: { ...typography.caption, fontSize: 11 },
  meta: { ...typography.caption, fontSize: 10, marginTop: 1 },
  right: { alignItems: "flex-end", gap: 3 },
  duration: { ...typography.captionMedium, fontWeight: "600", fontSize: 11, letterSpacing: -0.1, marginBottom: 2 },
});
