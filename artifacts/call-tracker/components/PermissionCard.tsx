import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import spacing, { shadow, typography } from "@/constants/spacing";
import type { Permission } from "@/types";
import { AppCard } from "@/components/ui/AppCard";

interface PermissionCardProps {
  permission: Permission;
  onGrant: () => void;
}

export function PermissionCard({ permission, onGrant }: PermissionCardProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const isGranted = permission.status === "granted";

  const handleGrant = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 900));
    onGrant();
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <AppCard
      style={[
        styles.card,
        {
          borderColor: isGranted ? `${colors.success}22` : colors.border,
        },
      ]}
      padding={16}
      shadowLevel="xs"
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: isGranted ? `${colors.success}0A` : `${colors.primary}0A`,
            borderColor: isGranted ? `${colors.success}1A` : `${colors.primary}1A`,
            borderWidth: 1,
            borderRadius: 8,
          },
        ]}
      >
        <Feather
          name={permission.icon as keyof typeof Feather.glyphMap}
          size={16}
          color={isGranted ? colors.success : colors.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>{permission.title}</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {permission.description}
        </Text>
      </View>

      {isGranted ? (
        <View style={[styles.grantedBadge, { backgroundColor: `${colors.success}0A`, borderColor: `${colors.success}22`, borderWidth: 1, borderRadius: 100 }]}>
          <Feather name="check" size={13} color={colors.success} />
        </View>
      ) : (
        <Pressable
          onPress={handleGrant}
          disabled={loading}
          style={({ pressed }) => [
            styles.grantBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: 6,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.grantText}>Allow</Text>
          )}
        </Pressable>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: { flex: 1, gap: 1 },
  title: {
    ...typography.captionMedium,
    fontWeight: "600",
    letterSpacing: -0.1,
    fontSize: 13,
  },
  desc: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 15,
  },
  grantedBadge: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  grantBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 56,
    minHeight: 28,
    flexShrink: 0,
  },
  grantText: {
    color: "#fff",
    ...typography.captionMedium,
    fontWeight: "600",
    letterSpacing: 0,
    fontSize: 11,
  },
});
