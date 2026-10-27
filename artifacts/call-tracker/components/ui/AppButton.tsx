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
import { shadow } from "@/constants/spacing";

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
    secondary: { bg: colors.card, text: colors.foreground, border: colors.border },
    ghost: { bg: "transparent", text: colors.primary },
    danger: { bg: colors.destructive, text: colors.destructiveForeground },
    outline: { bg: "transparent", text: colors.primary, border: colors.primary },
  };

  const sizeStyles: Record<Size, { height: number; px: number; fontSize: number; borderRadius: number }> = {
    sm: { height: 34, px: 12, fontSize: 13, borderRadius: 6 },
    md: { height: 44, px: 16, fontSize: 14, borderRadius: 8 },
    lg: { height: 50, px: 20, fontSize: 15, borderRadius: 10 },
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
          borderRadius: ss.borderRadius,
          borderWidth: vs.border ? 1 : 0,
          borderColor: vs.border ?? "transparent",
          alignSelf: fullWidth ? "stretch" : "flex-start",
          opacity: pressed ? 0.85 : isDisabled ? 0.4 : 1,
        },
        variant === "primary" && {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: 3,
          elevation: 1,
        },
        variant === "secondary" && {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 2,
          elevation: 0.5,
        },
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
