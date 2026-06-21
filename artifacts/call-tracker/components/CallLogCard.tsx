import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { CallLog } from "@/types";

interface CallLogCardProps {
  log: CallLog;
  onPress?: () => void;
}

const TYPE_CONFIG = {
  Incoming: { icon: "phone-incoming" as const, label: "Incoming" },
  Outgoing: { icon: "phone-outgoing" as const, label: "Outgoing" },
  Missed: { icon: "phone-missed" as const, label: "Missed" },
};

const STATUS_CONFIG = {
  Synced: { bg: "#D1FAE5", text: "#065F46", dark_bg: "#064E3B", dark_text: "#6EE7B7" },
  Pending: { bg: "#FEF3C7", text: "#92400E", dark_bg: "#451A03", dark_text: "#FDE68A" },
  Failed: { bg: "#FEE2E2", text: "#991B1B", dark_bg: "#450A0A", dark_text: "#FCA5A5" },
};

export function CallLogCard({ log, onPress }: CallLogCardProps) {
  const colors = useColors();
  const isDark = colors.background === "#0F1117";
  const typeConfig = TYPE_CONFIG[log.type];
  const statusConfig = STATUS_CONFIG[log.status];

  const iconColor =
    log.type === "Missed"
      ? colors.destructive
      : log.type === "Incoming"
        ? colors.success
        : colors.primary;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + "18" }]}>
        <Feather name={typeConfig.icon} size={18} color={iconColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {log.name ?? log.number}
        </Text>
        {log.name && (
          <Text style={[styles.number, { color: colors.mutedForeground }]}>
            {log.number}
          </Text>
        )}
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {log.date} · {log.time}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.duration, { color: colors.foreground }]}>{log.duration}</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isDark ? statusConfig.dark_bg : statusConfig.bg,
              borderRadius: 6,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isDark ? statusConfig.dark_text : statusConfig.text },
            ]}
          >
            {log.status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  number: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  meta: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  duration: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
});
