import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import spacing, { shadow, typography } from "@/constants/spacing";
import type { Permission } from "@/types";

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
    <View
      style={[
        styles.card,
        shadow.xs,
        {
          backgroundColor: colors.card,
          borderColor: isGranted ? colors.success + "60" : colors.border,
          borderRadius: 14,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: isGranted ? colors.successMuted : colors.secondary,
            borderRadius: 12,
          },
        ]}
      >
        <Feather
          name={permission.icon as keyof typeof Feather.glyphMap}
          size={20}
          color={isGranted ? colors.successForeground : colors.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>{permission.title}</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {permission.description}
        </Text>
      </View>

      {isGranted ? (
        <View style={[styles.grantedBadge, { backgroundColor: colors.successMuted, borderRadius: 10 }]}>
          <Feather name="check" size={14} color={colors.successForeground} />
        </View>
      ) : (
        <Pressable
          onPress={handleGrant}
          disabled={loading}
          style={({ pressed }) => [
            styles.grantBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: 8,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.grantText}>Grant</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.base,
    borderWidth: 1,
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: { flex: 1 },
  title: { ...typography.bodyMedium, marginBottom: 3 },
  desc: { ...typography.caption, lineHeight: 17 },
  grantedBadge: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  grantBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 62,
    minHeight: 34,
    flexShrink: 0,
  },
  grantText: {
    color: "#fff",
    ...typography.captionMedium,
    letterSpacing: 0,
    fontSize: 13,
  },
});
