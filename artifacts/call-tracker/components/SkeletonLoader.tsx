import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: colors.muted,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CallLogSkeleton() {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.info}>
        <Skeleton width={120} height={14} borderRadius={4} style={styles.mb} />
        <Skeleton width={90} height={11} borderRadius={4} style={styles.mb} />
        <Skeleton width={80} height={11} borderRadius={4} />
      </View>
      <View style={styles.right}>
        <Skeleton width={50} height={12} borderRadius={4} style={styles.mb} />
        <Skeleton width={45} height={18} borderRadius={6} />
      </View>
    </View>
  );
}

export function StatSkeleton() {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Skeleton width={60} height={11} borderRadius={4} style={styles.mb} />
      <Skeleton width={50} height={26} borderRadius={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderRadius: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 90,
    justifyContent: "space-between",
  },
  info: { flex: 1, marginLeft: 12 },
  right: { alignItems: "flex-end", gap: 6 },
  mb: { marginBottom: 6 },
});
