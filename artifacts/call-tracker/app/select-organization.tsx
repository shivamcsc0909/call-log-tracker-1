import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { usePermissionStore } from "@/store/permissionStore";
import spacing, { shadow, typography } from "@/constants/spacing";

export default function SelectOrganizationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    organizations,
    selectOrganization,
    logout,
    isLoading,
    tempUserId,
  } = useAuthStore();
  
  const { allGranted } = usePermissionStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // If no temporary session exists, redirect to login
  React.useEffect(() => {
    if (!tempUserId && organizations.length === 0) {
      router.replace("/login");
    }
  }, [tempUserId, organizations]);

  const handleSelect = async (orgId: string) => {
    setSelectedId(orgId);
    try {
      await selectOrganization(orgId);
      if (allGranted) {
        router.replace("/(tabs)");
      } else {
        router.replace("/permissions");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Selection failed";
      Alert.alert("Organization Selection Failed", msg);
      setSelectedId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand/Header Section */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoOutline, { borderColor: colors.border }]}>
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoMark}
            >
              <Feather name="grid" size={22} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Select Workspace</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Choose an organization to load your enterprise call configuration.
          </Text>
        </View>

        {/* Organizations List */}
        <View style={styles.listContainer}>
          {organizations.length === 0 ? (
            <AppCard padding={24} style={styles.emptyCard}>
              <Feather name="alert-circle" size={28} color={colors.destructive} />
              <Text style={[styles.emptyText, { color: colors.foreground }]}>
                No organizations associated with this account.
              </Text>
            </AppCard>
          ) : (
            organizations.map((org) => {
              const isPendingSelect = selectedId === org.id && isLoading;
              return (
                <Pressable
                  key={org.id}
                  disabled={isLoading}
                  onPress={() => handleSelect(org.id)}
                  style={({ pressed }) => [
                    styles.orgPressable,
                    {
                      borderColor: selectedId === org.id ? colors.primary : colors.border,
                      backgroundColor: pressed ? `${colors.primary}08` : colors.card,
                      opacity: isLoading && selectedId !== org.id ? 0.6 : 1,
                    },
                    shadow.xs,
                  ]}
                >
                  <View style={styles.orgCardContent}>
                    <View
                      style={[
                        styles.orgIcon,
                        {
                          backgroundColor: `${colors.primary}0D`,
                          borderColor: `${colors.primary}1A`,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Feather name="briefcase" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.orgDetails}>
                      <Text style={[styles.orgName, { color: colors.foreground }]}>
                        {org.name}
                      </Text>
                      <Text style={[styles.orgIdText, { color: colors.mutedForeground }]}>
                        ID: {org.id}
                      </Text>
                    </View>
                    {isPendingSelect ? (
                      <Feather name="loader" size={16} color={colors.primary} style={styles.rotating} />
                    ) : (
                      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Sign Out Trigger */}
        <View style={styles.actions}>
          <AppButton
            label="Sign Out of Account"
            variant="ghost"
            onPress={handleLogout}
            leftIcon={<Feather name="log-out" size={14} color={colors.mutedForeground} />}
            size="md"
          />
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Corporate Call Log Tracker Security Protocol
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenH,
    justifyContent: "center",
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoOutline: {
    borderWidth: 1,
    padding: 6,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: spacing.sm,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.6,
  },
  tagline: {
    ...typography.captionMedium,
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
  listContainer: {
    gap: spacing.sm,
    width: "100%",
    marginBottom: spacing.lg,
  },
  orgPressable: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  orgCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orgIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  orgDetails: {
    flex: 1,
    gap: 2,
  },
  orgName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  orgIdText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  emptyCard: {
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  emptyText: {
    ...typography.captionMedium,
    textAlign: "center",
  },
  actions: {
    alignItems: "center",
    marginTop: spacing.sm,
  },
  footer: {
    textAlign: "center",
    ...typography.caption,
    marginTop: spacing.xl,
    fontSize: 11,
  },
  rotating: {
    // Basic placeholder for loading animation indicator
  },
});
