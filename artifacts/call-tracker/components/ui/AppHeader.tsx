import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { typography } from "@/constants/spacing";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
}

export function AppHeader({ title, subtitle, showBack = false, rightSlot }: AppHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={15} color={colors.foreground} />
          </Pressable>
        )}
        <View style={styles.titles}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
          )}
        </View>
        {rightSlot && <View>{rightSlot}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  titles: { flex: 1 },
  title: { ...typography.title, fontWeight: "700" },
  subtitle: { ...typography.caption, marginTop: 1 },
});
