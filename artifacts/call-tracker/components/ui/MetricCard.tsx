import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { shadow, typography } from "@/constants/spacing";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  iconColor,
  trend,
  trendUp,
  subtitle,
}: MetricCardProps) {
  const colors = useColors();
  const color = iconColor ?? colors.primary;

  return (
    <View
      style={[
        styles.card,
        shadow.sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 14,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: color + "12", borderRadius: 10 }]}>
          <Feather name={icon} size={16} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trendUp ? colors.successMuted : "#FEE2E2", borderRadius: 6 }]}>
            <Feather
              name={trendUp ? "trending-up" : "trending-down"}
              size={10}
              color={trendUp ? colors.successForeground : "#991B1B"}
            />
            <Text style={[styles.trendText, { color: trendUp ? colors.successForeground : "#991B1B" }]}>
              {trend}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: "space-between",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  trendText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  value: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  label: {
    ...typography.captionMedium,
    letterSpacing: 0,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
});
