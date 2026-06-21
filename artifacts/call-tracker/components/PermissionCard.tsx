import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
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
    await new Promise((r) => setTimeout(r, 800));
    onGrant();
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isGranted ? colors.success + "50" : colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: isGranted ? colors.success + "18" : colors.primary + "14",
            borderRadius: colors.radius,
          },
        ]}
      >
        <Feather
          name={permission.icon as keyof typeof Feather.glyphMap}
          size={22}
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
        <View style={[styles.grantedBadge, { backgroundColor: colors.success + "18", borderRadius: 8 }]}>
          <Feather name="check" size={14} color={colors.success} />
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
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.grantText, { color: colors.primaryForeground }]}>Grant</Text>
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
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  grantedBadge: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  grantBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  grantText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
