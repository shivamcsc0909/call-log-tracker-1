import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppCard } from "@/components/ui/AppCard";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { CONFIG } from "@/constants/config";
import spacing, { shadow, typography } from "@/constants/spacing";

export default function LoginScreen() {
  console.log("[LOGIN_SCREEN_RENDERED]");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  React.useEffect(() => {
    console.log("[LOGIN SCREEN LOADED]");
  }, []);

  const [email, setEmail] = useState(CONFIG.TEST_MODE ? "client.test@company.com" : "demo@company.com");
  const [password, setPassword] = useState(CONFIG.TEST_MODE ? "Test@123456" : "123456");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email address is required";
    else if (!email.includes("@")) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(email.trim(), password);
      router.replace("/select-organization");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      Alert.alert("Authentication Failed", msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Section */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoOutline, { borderColor: colors.border }]}>
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoMark}
            >
              <Feather name="phone-call" size={22} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>CallTrack Pro</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Enterprise Call Analytics & Cloud Synchronization
          </Text>
        </View>

        {/* Form Card */}
        <AppCard style={styles.formCard} padding={28} shadowLevel="sm">
          <View style={styles.formHeader}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Sign In</Text>
            <Text style={[styles.formSub, { color: colors.mutedForeground }]}>
              Enter your corporate credentials to access your call tracking dashboard.
            </Text>
          </View>

          <View style={styles.fields}>
            <AppInput
              label="Corporate Email"
              placeholder="name@company.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              leftIcon={<Feather name="mail" size={14} color={colors.mutedForeground} />}
            />
            <AppInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
              secureTextEntry={!showPassword}
              error={errors.password}
              leftIcon={<Feather name="lock" size={14} color={colors.mutedForeground} />}
              rightIcon={
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={14}
                  color={colors.mutedForeground}
                />
              }
              onRightIconPress={() => setShowPassword((s) => !s)}
            />
          </View>

          <View style={styles.forgotRow}>
            <AppButton
              label="Forgot password?"
              variant="ghost"
              fullWidth={false}
              size="sm"
              onPress={() =>
                Alert.alert(
                  "Reset Password",
                  "A reset link will be sent to your registered email.",
                  [{ text: "OK" }]
                )
              }
              style={styles.forgotButton}
            />
          </View>

          <AppButton
            label="Continue to Workspace"
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
            variant="primary"
            style={styles.signInButton}
            rightIcon={<Feather name="arrow-right" size={15} color="#fff" />}
          />

          <View style={[styles.demoNote, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}12`, borderWidth: 1 }]}>
            <Feather name="shield" size={13} color={colors.primary} />
            <Text style={[styles.demoText, { color: colors.mutedForeground }]}>
              {CONFIG.TEST_MODE
                ? "Test environment active. Client credentials pre-configured."
                : "Demo environment active. Credentials are pre-configured."}
            </Text>
          </View>
        </AppCard>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Secured by CallTrack Enterprise Policy. Version 1.0.0 (Build 100)
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  },
  formCard: {
    borderWidth: 1,
    marginBottom: spacing.lg,
    borderRadius: 16,
  },
  formHeader: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  formSub: {
    ...typography.captionMedium,
    fontSize: 12,
    lineHeight: 18,
  },
  fields: {
    gap: spacing.base,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginTop: spacing.sm,
    marginBottom: spacing.base,
  },
  forgotButton: {
    paddingHorizontal: 0,
  },
  signInButton: {
    marginTop: spacing.xs,
  },
  demoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 12,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  demoText: {
    ...typography.captionMedium,
    fontSize: 11,
    flex: 1,
  },
  footer: {
    textAlign: "center",
    ...typography.caption,
    marginTop: spacing.sm,
    fontSize: 11,
  },
});
