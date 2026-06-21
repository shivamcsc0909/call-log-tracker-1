import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { shadow, typography } from "@/constants/spacing";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function AppButton({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  fullWidth = true,
}: AppButtonProps) {
  const colors = useColors();

  const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary, text: colors.primaryForeground },
    secondary: { bg: colors.secondary, text: colors.secondaryForeground },
    ghost: { bg: "transparent", text: colors.primary },
    danger: { bg: colors.destructive, text: colors.destructiveForeground },
    outline: { bg: "transparent", text: colors.primary, border: colors.primary },
  };

  const sizeStyles: Record<Size, { height: number; px: number; fontSize: number }> = {
    sm: { height: 36, px: 14, fontSize: 13 },
    md: { height: 48, px: 20, fontSize: 15 },
    lg: { height: 56, px: 24, fontSize: 16 },
  };

  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: vs.bg,
          height: ss.height,
          paddingHorizontal: ss.px,
          borderRadius: 10,
          borderWidth: vs.border ? 1.5 : 0,
          borderColor: vs.border ?? "transparent",
          alignSelf: fullWidth ? "stretch" : "flex-start",
          opacity: pressed ? 0.82 : isDisabled ? 0.5 : 1,
        },
        variant === "primary" && shadow.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.label, { color: vs.text, fontSize: ss.fontSize }]}>
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.1,
  },
});
