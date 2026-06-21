import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";

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
    if (!email.trim()) e.email = "Email is required";
    else if (!email.includes("@")) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await login(email.trim(), password);
      router.replace("/permissions");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      Alert.alert("Login Failed", msg);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "A reset link will be sent to your registered email address.",
      [{ text: "OK" }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.logoWrap,
              { backgroundColor: colors.primary, borderRadius: colors.radius + 4 },
            ]}
          >
            <Feather name="phone-call" size={28} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>CallTrack Pro</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Enterprise Call Management
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius + 4,
            },
          ]}
        >
          <Text style={[styles.signIn, { color: colors.foreground }]}>Sign in to your account</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Use <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium" }}>demo@company.com</Text> / 123456
          </Text>

          <View style={styles.fields}>
            <View>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Employee Email</Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.muted,
                    borderColor: errors.email ? colors.destructive : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Feather name="mail" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: colors.destructive }]}>{errors.email}</Text>
              )}
            </View>

            <View>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.muted,
                    borderColor: errors.password ? colors.destructive : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: colors.destructive }]}>{errors.password}</Text>
              )}
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.loginBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: colors.radius,
                opacity: pressed || isLoading ? 0.8 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.loginBtnText, { color: colors.primaryForeground }]}>
                Sign In
              </Text>
            )}
          </Pressable>

          <Pressable onPress={handleForgotPassword} style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
          </Pressable>
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          CallTrack Pro v1.0.0 · Enterprise Edition
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrap: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  card: {
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 24,
  },
  signIn: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
  },
  fields: {
    gap: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  loginBtn: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loginBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  forgotBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
