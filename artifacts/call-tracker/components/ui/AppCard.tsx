import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";
import { shadow } from "@/constants/spacing";

interface AppCardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  padding?: number;
  shadowLevel?: keyof typeof shadow;
  borderRadius?: number;
}

export function AppCard({
  children,
  style,
  onPress,
  padding = 16,
  shadowLevel = "xs",
  borderRadius = 12,
}: AppCardProps) {
  const colors = useColors();

  const cardStyle = [
    styles.card,
    shadow[shadowLevel],
    {
      backgroundColor: colors.card,
      borderRadius,
      borderColor: colors.border,
      padding,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...cardStyle, { opacity: pressed ? 0.9 : 1 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
