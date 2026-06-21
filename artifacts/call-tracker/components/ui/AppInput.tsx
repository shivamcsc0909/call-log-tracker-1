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
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      )}
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.input,
            borderColor: error
              ? colors.destructive
              : focused
                ? colors.primary
                : colors.border,
            borderRadius: 10,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: colors.foreground },
            !leftIcon && { paddingLeft: 14 },
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
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1.5,
  },
  leftIcon: {
    paddingLeft: 14,
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rightIcon: {
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingRight: 14,
  },
  error: {
    ...typography.caption,
    marginTop: 2,
  },
});
