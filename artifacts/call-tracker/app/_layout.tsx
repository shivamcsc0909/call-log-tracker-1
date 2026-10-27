import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments, useRouter, usePathname, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuthStore } from "@/store/authStore";
import { usePermissionStore } from "@/store/permissionStore";
import { setBaseUrl } from "@workspace/api-client-react";

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://demo.bytelinkup.com";
setBaseUrl(apiUrl);

// SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { token, tempUserId, hasHydrated: authHydrated } = useAuthStore();
  const { allGranted, hasHydrated: permissionHydrated } = usePermissionStore();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const segmentsList = segments as string[];
  const inTabsGroup = segmentsList[0] === "(tabs)";
  const inPermissions = segmentsList[0] === "permissions";
  const inLogin = segmentsList[0] === "login";
  const inSelectOrg = segmentsList[0] === "select-organization";
  const inSettings = segmentsList[0] === "settings";
  const onIndex = segmentsList.length === 0 || segmentsList[0] === "" || segmentsList[0] === "index";

  useEffect(() => {
    console.log("[ROUTER_READY]");
  }, []);

  useEffect(() => {
    console.log(`[Navigation State] Current pathname: ${pathname}, segments: ${JSON.stringify(segmentsList)}, LoggedIn: ${!!token}, TempUser: ${!!tempUserId}, Permissions granted: ${allGranted}`);
  }, [pathname, segmentsList, token, tempUserId, allGranted]);

  useEffect(() => {
    if (!authHydrated || !permissionHydrated) {
      console.log("[ROUTER NAVIGATION] Stores not hydrated yet");
      return;
    }
    if (!rootNavigationState?.key) {
      console.log("[ROUTER NAVIGATION] Root navigation state not ready yet");
      return;
    }

    const timer = setTimeout(() => {
      console.log(`[ROUTER NAVIGATION] Running navigation check. Token: ${!!token}, TempUser: ${!!tempUserId}, Permissions: ${allGranted}`);
      // If not authenticated
      if (!token) {
        if (tempUserId) {
          // Authenticated but needs to select organization
          if (!inSelectOrg) {
            console.log("[ROUTER NAVIGATION] Redirecting to select-organization");
            router.replace("/select-organization");
          }
        } else {
          // Not authenticated
          if (!inLogin) {
            console.log("[ROUTER NAVIGATION] Redirecting to login");
            router.replace("/login");
          }
        }
      } else {
        // Authenticated with token
        if (!allGranted) {
          if (!inPermissions && !inSettings) {
            console.log("[ROUTER NAVIGATION] Redirecting to permissions");
            router.replace("/permissions");
          }
        } else {
          if (inLogin || inSelectOrg || inPermissions || onIndex) {
            console.log("[ROUTER NAVIGATION] Redirecting to tabs");
            router.replace("/(tabs)");
          }
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [token, tempUserId, allGranted, inLogin, inSelectOrg, inPermissions, inSettings, onIndex, rootNavigationState?.key, authHydrated, permissionHydrated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="select-organization" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

function RootLayoutInner() {
  console.log("[FONTS_LOADING]");
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const permissionHydrated = usePermissionStore((state) => state.hasHydrated);

  const [fallbackReady, setFallbackReady] = React.useState(false);

  useEffect(() => {
    console.log("[APP STARTED]");
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      console.log("[FONTS_LOADED]");
    } else if (fontError) {
      console.error("[FONTS_LOADED] Error loading fonts:", fontError);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (authHydrated) {
      console.log("[AUTH_STORE_HYDRATED]");
    }
  }, [authHydrated]);

  useEffect(() => {
    if (permissionHydrated) {
      console.log("[PERMISSION_STORE_HYDRATED]");
    }
  }, [permissionHydrated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.warn("Startup timeout: forcing app initialization fallback");
      setFallbackReady(true);
    }, 3000); // Failsafe mode: After max 3 seconds, force ready state

    return () => clearTimeout(timer);
  }, []);

  const storesHydrated = authHydrated && permissionHydrated;
  // Failsafe: isReady is always true
  const isReady = true;

  useEffect(() => {
    if (isReady) {
      console.log("[SPLASH_HIDE_CALLED]");
      SplashScreen.hideAsync()
        .then(() => {
          console.log("[SPLASH HIDDEN]");
        })
        .catch((err) => {
          console.warn("Failed to hide splash screen:", err);
        });
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <RootLayoutNav />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  console.log("[ROOT_LAYOUT_RENDERED]");
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <RootLayoutInner />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
