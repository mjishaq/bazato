import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import {
  getKeycloakConfigurationWarning,
  isKeycloakAuthEnabled,
  phoneAuthGateway,
  type AuthSession
} from "../services/authGateway";
import { useKeycloakAuth } from "../services/keycloakAuth";
import { colors } from "../theme/colors";

type LoginStep = "phone" | "otp";

type LoginScreenProps = {
  initialPhone?: string;
  lockPhone?: boolean;
  onComplete: (session: AuthSession) => void;
};

export function LoginScreen({
  initialPhone = "",
  lockPhone = false,
  onComplete
}: LoginScreenProps) {
  const keycloakAuth = useKeycloakAuth();
  const keycloakEnabled = isKeycloakAuthEnabled();
  const keycloakWarning = getKeycloakConfigurationWarning();
  const [step, setStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const phoneDigits = useMemo(() => phone.replace(/\D/g, ""), [phone]);
  const canRequestOtp = phoneDigits.length >= 10;
  const canVerifyOtp = otp.length === 4;

  useEffect(() => {
    setPhone(initialPhone);
  }, [initialPhone]);

  useEffect(() => {
    if (resendIn === 0) {
      return;
    }

    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);

    return () => clearTimeout(timer);
  }, [resendIn]);

  const requestOtp = async () => {
    if (!canRequestOtp) {
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      await phoneAuthGateway.requestOtp(phoneDigits);
      setStep("otp");
      setOtp("");
      setResendIn(30);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not request OTP. Check backend API URL."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!canVerifyOtp) {
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      onComplete(await phoneAuthGateway.verifyOtp(phoneDigits, otp));
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Could not verify OTP. Try 1234 in mock mode."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeycloakSignIn = async () => {
    try {
      setError("");
      setIsSubmitting(true);
      onComplete(await keycloakAuth.signIn());
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Could not complete Keycloak sign-in."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
    >
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <MaterialCommunityIcons color={colors.white} name="shopping" size={28} />
          </View>
          <Text style={styles.brand}>Bazzato</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in with the mobile number registered during onboarding.
          </Text>
        </View>

        {keycloakEnabled ? (
          <View style={styles.card}>
            <Text style={styles.label}>Secure sign in</Text>
            <Pressable
              disabled={!keycloakAuth.isReady || isSubmitting}
              onPress={handleKeycloakSignIn}
              style={[
                styles.primaryButton,
                (!keycloakAuth.isReady || isSubmitting) && styles.disabledButton
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Opening..." : "Continue with Keycloak"}
              </Text>
            </Pressable>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.helpText}>
              Login is handled securely by the configured identity provider.
            </Text>
          </View>
        ) : null}

        {!keycloakEnabled && step === "phone" ? (
          <View style={styles.card}>
            {keycloakWarning ? (
              <Text style={styles.warningText}>{keycloakWarning}</Text>
            ) : null}
            <Text style={styles.label}>
              {lockPhone ? "Registered mobile number" : "Mobile number"}
            </Text>
            <View style={styles.phoneField}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                editable={!lockPhone}
                keyboardType="phone-pad"
                maxLength={10}
                onChangeText={setPhone}
                placeholder="98765 43210"
                placeholderTextColor={colors.placeholder}
                style={[styles.input, lockPhone && styles.lockedInput]}
                value={phone}
              />
            </View>
            <Pressable
              disabled={!canRequestOtp || isSubmitting}
              onPress={requestOtp}
              style={[
                styles.primaryButton,
                (!canRequestOtp || isSubmitting) && styles.disabledButton
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Sending..." : "Send OTP"}
              </Text>
            </Pressable>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.helpText}>
              We will send a 4-digit code to your onboarded mobile number.
            </Text>
          </View>
        ) : null}

        {!keycloakEnabled && step === "otp" ? (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.label}>Enter OTP</Text>
                <Text style={styles.mutedText}>Sent to +91 {phoneDigits}</Text>
              </View>
              {!lockPhone ? (
                <Pressable onPress={() => setStep("phone")}>
                  <Text style={styles.linkText}>Edit</Text>
                </Pressable>
              ) : null}
            </View>
            <TextInput
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={setOtp}
              placeholder="0000"
              placeholderTextColor={colors.placeholder}
              style={styles.otpInput}
              value={otp}
            />
            <Pressable
              disabled={!canVerifyOtp || isSubmitting}
              onPress={handleVerifyOtp}
              style={[
                styles.primaryButton,
                (!canVerifyOtp || isSubmitting) && styles.disabledButton
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Verifying..." : "Verify and continue"}
              </Text>
            </Pressable>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Pressable disabled={resendIn > 0} onPress={requestOtp}>
              <Text style={[styles.resendText, resendIn > 0 && styles.disabledText]}>
                {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    backgroundColor: colors.background
  },
  hero: {
    paddingTop: 26
  },
  logo: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.orange,
    marginBottom: 18
  },
  brand: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8
  },
  title: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 42,
    marginBottom: 12
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24
  },
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: colors.white,
    padding: 18,
    shadowColor: "#1e2a24",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 34,
    elevation: 5
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8
  },
  phoneField: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.panel,
    marginBottom: 14,
    overflow: "hidden"
  },
  countryCode: {
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700"
  },
  lockedInput: {
    color: colors.muted
  },
  otpInput: {
    height: 62,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.panel,
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 12,
    paddingHorizontal: 16,
    marginBottom: 14
  },
  primaryButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.green
  },
  disabledButton: {
    backgroundColor: "#a9b5aa"
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  },
  helpText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12
  },
  errorText: {
    color: colors.magenta,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 10
  },
  warningText: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
    marginBottom: 12
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12
  },
  mutedText: {
    color: colors.muted,
    fontSize: 12
  },
  linkText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "900"
  },
  resendText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 14
  },
  disabledText: {
    color: "#879084"
  }
});
