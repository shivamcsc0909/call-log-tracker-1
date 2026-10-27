import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { typography } from "@/constants/spacing";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: any;
}

export function SectionHeader({ title, actionLabel, onAction, style }: SectionHeaderProps) {
  const colors = useColors();
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.actionButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          hitSlop={12}
        >
          <Text style={[styles.actionText, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  title: {
    ...typography.sectionTitle,
    fontWeight: "700",
  },
  actionButton: {
    paddingVertical: 2,
  },
  actionText: {
    ...typography.captionMedium,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
});
