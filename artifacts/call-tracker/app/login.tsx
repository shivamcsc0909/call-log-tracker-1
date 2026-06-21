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

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import spacing, { shadow, typography } from "@/constants/spacing";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("demo@company.com");
  const [password, setPassword] = useState("123456");
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
      router.replace("/permissions");
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
          { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Section */}
        <View style={styles.brand}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary, borderRadius: 18 }, shadow.md]}>
            <Feather name="phone-call" size={26} color="#fff" />
          </View>
          <View style={styles.brandText}>
            <Text style={[styles.appName, { color: colors.foreground }]}>CallTrack Pro</Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
              Enterprise Call Management
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <View
          style={[
            styles.formCard,
            shadow.md,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: 18,
            },
          ]}
        >
          <View style={styles.formHeader}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Welcome back</Text>
            <Text style={[styles.formSub, { color: colors.mutedForeground }]}>
              Sign in to your account to continue
            </Text>
          </View>

          <View style={styles.fields}>
            <AppInput
              label="Email Address"
              placeholder="you@company.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              leftIcon={<Feather name="mail" size={16} color={colors.mutedForeground} />}
            />
            <AppInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
              secureTextEntry={!showPassword}
              error={errors.password}
              leftIcon={<Feather name="lock" size={16} color={colors.mutedForeground} />}
              rightIcon={
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={16}
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
            />
          </View>

          <AppButton
            label="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
          />

          <View style={[styles.demoNote, { backgroundColor: colors.secondary, borderRadius: 10 }]}>
            <Feather name="info" size={13} color={colors.primary} />
            <Text style={[styles.demoText, { color: colors.secondaryForeground }]}>
              Demo: demo@company.com · 123456
            </Text>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          CallTrack Pro · Enterprise Edition · v1.0.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenH,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.xs,
  },
  logoMark: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { flex: 1 },
  appName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.caption,
    marginTop: 2,
  },
  formCard: {
    padding: spacing.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  formHeader: { marginBottom: spacing.xl },
  formTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  formSub: { ...typography.body },
  fields: { gap: spacing.base, marginBottom: spacing.base },
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: spacing.lg,
    marginTop: -spacing.xs,
  },
  demoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.base,
  },
  demoText: { ...typography.caption, flex: 1 },
  footer: {
    textAlign: "center",
    ...typography.caption,
    marginTop: spacing.lg,
  },
});
