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
      {/* Header Margin Spacer */}
      <View style={{ height: insets.top }} />

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: 6,
            },
            shadow.none,
          ]}
        >
          <Feather name="search" size={13} color={colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search logs by name or number…"
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={10}>
              <Feather name="x" size={13} color={colors.mutedForeground} />
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
                  backgroundColor: active ? `${meta.color}0A` : colors.card,
                  borderColor: active ? `${meta.color}1F` : colors.border,
                  borderRadius: 100,
                },
              ]}
            >
              <Feather name={meta.icon} size={10} color={active ? meta.color : colors.mutedForeground} />
              <Text
                style={[
                  styles.chipText,
                  { color: active ? meta.color : colors.mutedForeground },
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
        <View style={[styles.countRow, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {filteredLogs.length} {filteredLogs.length === 1 ? "record found" : "records found"}
            {searchQuery ? ` matching "${searchQuery}"` : ""}
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={{ paddingTop: spacing.xs }}>
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
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: 2 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
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
    height: 38,
    paddingHorizontal: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchIcon: {
    marginTop: 1,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.screenH,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  chipText: { ...typography.label, fontSize: 10, letterSpacing: 0, fontWeight: "600" },
  countRow: {
    paddingHorizontal: spacing.screenH,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  countText: { ...typography.caption, fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.2 },
});
