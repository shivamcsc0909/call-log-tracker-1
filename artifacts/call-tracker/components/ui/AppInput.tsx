import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { typography } from "@/constants/spacing";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function AppInput({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: AppInputProps) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      )}
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: error
              ? colors.destructive
              : focused
                ? colors.primary
                : colors.border,
            borderRadius: 6,
          },
          focused && {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 1,
          },
          !focused && {
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.02,
            shadowRadius: 2,
            elevation: 0.5,
          }
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: colors.foreground },
            !leftIcon && { paddingLeft: 12 },
            style,
          ]}
          placeholderTextColor={colors.mutedForeground}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIcon}
            hitSlop={8}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    ...typography.captionMedium,
    fontWeight: "600",
    letterSpacing: -0.1,
    fontSize: 12,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    borderWidth: 1,
  },
  leftIcon: {
    paddingLeft: 12,
    paddingRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rightIcon: {
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingRight: 12,
  },
  error: {
    ...typography.caption,
    marginTop: 2,
  },
});
