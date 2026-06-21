import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
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
import spacing, { shadow, typography } from "@/constants/spacing";
import { useCallLogStore } from "@/store/callLogStore";
import type { CallLog } from "@/types";

const FILTERS = ["All", "Incoming", "Outgoing", "Missed"] as const;

const FILTER_META: Record<string, { color: string; icon: keyof typeof Feather.glyphMap }> = {
  All: { color: "#6B7280", icon: "list" },
  Incoming: { color: "#22C55E", icon: "phone-incoming" },
  Outgoing: { color: "#2563EB", icon: "phone-outgoing" },
  Missed: { color: "#EF4444", icon: "phone-missed" },
};

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

  useEffect(() => { fetchLogs(); }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
              borderRadius: 10,
            },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by name or number…"
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearch}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => {
          const active = filterType === f;
          const meta = FILTER_META[f];
          return (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? meta.color : colors.muted,
                  borderRadius: 20,
                },
              ]}
            >
              <Feather name={meta.icon} size={11} color={active ? "#fff" : colors.mutedForeground} />
              <Text
                style={[
                  styles.chipText,
                  { color: active ? "#fff" : colors.mutedForeground },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Count */}
      {!isLoading && (
        <View style={[styles.countRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {filteredLogs.length} {filteredLogs.length === 1 ? "record" : "records"}
            {searchQuery ? ` for "${searchQuery}"` : ""}
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={{ paddingTop: spacing.sm }}>
          {Array.from({ length: 7 }).map((_, i) => <CallLogSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }: { item: CallLog }) => <CallLogCard log={item} />}
          ListEmptyComponent={
            <EmptyState
              icon="phone-off"
              title="No call logs found"
              description={
                searchQuery
                  ? `No results matching "${searchQuery}". Try a different search.`
                  : "No calls match the selected filter."
              }
              actionLabel={searchQuery ? "Clear search" : undefined}
              onAction={searchQuery ? () => setSearch("") : undefined}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: spacing.xs }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { ...typography.label, letterSpacing: 0.1 },
  countRow: {
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  countText: { ...typography.caption },
});
