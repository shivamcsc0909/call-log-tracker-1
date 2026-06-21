import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CallLogCard } from "@/components/CallLogCard";
import { CallLogSkeleton } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";
import { useCallLogStore } from "@/store/callLogStore";
import type { CallLog } from "@/types";

const FILTER_OPTIONS = ["All", "Incoming", "Outgoing", "Missed"] as const;

export default function LogsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    filteredLogs,
    isLoading,
    isRefreshing,
    searchQuery,
    filterType,
    fetchLogs,
    refresh,
    setSearch,
    setFilter,
  } = useCallLogStore();

  useEffect(() => {
    fetchLogs();
  }, []);

  const renderItem = ({ item }: { item: CallLog }) => <CallLogCard log={item} />;

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="phone-off"
        title="No call logs found"
        description={searchQuery ? `No results for "${searchQuery}"` : "No calls recorded yet. Start making calls to see them here."}
        actionLabel={searchQuery ? "Clear search" : undefined}
        onAction={searchQuery ? () => setSearch("") : undefined}
      />
    );
  };

  const renderSkeleton = () => (
    <View>
      {Array.from({ length: 8 }).map((_, i) => (
        <CallLogSkeleton key={i} />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.muted,
            borderColor: colors.border,
            borderRadius: colors.radius,
            marginHorizontal: 16,
            marginTop: 12,
          },
        ]}
      >
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search by name or number..."
          placeholderTextColor={colors.mutedForeground}
          value={searchQuery}
          onChangeText={setSearch}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Feather name="x-circle" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      <View style={styles.filters}>
        {FILTER_OPTIONS.map((f) => (
          <Pressable
            key={f}
            onPress={() => {
              Haptics.selectionAsync();
              setFilter(f);
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor: filterType === f ? colors.primary : colors.muted,
                borderRadius: 20,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filterType === f ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.meta}>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {isLoading ? "Loading..." : `${filteredLogs.length} records`}
        </Text>
        <View style={styles.legend}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>In</Text>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Out</Text>
          <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Missed</Text>
        </View>
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: 4 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  count: { fontSize: 12, fontFamily: "Inter_400Regular" },
  legend: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 10, fontFamily: "Inter_400Regular", marginRight: 4 },
});
