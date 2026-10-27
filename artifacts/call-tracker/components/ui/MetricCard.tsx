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
        shadow.xs,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 12,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}0A`, borderRadius: 8, borderWidth: 1, borderColor: `${color}1A` }]}>
          <Feather name={icon} size={14} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trendUp ? `${colors.success}0A` : `${colors.destructive}0A`, borderColor: trendUp ? `${colors.success}1A` : `${colors.destructive}1A`, borderRadius: 100 }]}>
            <Feather
              name={trendUp ? "arrow-up-right" : "arrow-down-left"}
              size={10}
              color={trendUp ? colors.success : colors.destructive}
            />
            <Text style={[styles.trendText, { color: trendUp ? colors.success : colors.destructive }]}>
              {trend}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
        )}
      </View>
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
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
    borderWidth: 1,
  },
  trendText: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    marginTop: 2,
  },
  value: {
    ...typography.cardValue,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  label: {
    ...typography.captionMedium,
    fontWeight: "500",
    letterSpacing: 0,
    fontSize: 12,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 2,
  },
});
