import { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../components/ui";
import { phoneAuthGateway, type AuthSession } from "../services/authGateway";
import { illustrations } from "../theme/assets";
import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";

type LoginStep = "phone" | "otp";

type LoginScreenProps = {
  initialPhone?: string;
  lockPhone?: boolean;
  onComplete: (session: AuthSession) => void;
  onRegister: () => void;
};

export function LoginScreen({
  initialPhone = "",
  lockPhone = false,
  onComplete,
  onRegister
}: LoginScreenProps) {
  const insets = useSafeAreaInsets();
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
        <View>
          <Image resizeMode="contain" source={illustrations.scooter} style={styles.art} />
          <Text style={styles.brand}>BAZZATO</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in with the mobile number you registered during onboarding.
          </Text>
        </View>

        {step === "phone" ? (
          <View style={styles.card}>
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
                placeholderTextColor={colors.faint}
                style={[styles.phoneInput, lockPhone && { color: colors.muted }]}
                value={phone}
              />
            </View>
            <Button
              disabled={!canRequestOtp || isSubmitting}
              label={isSubmitting ? "Sending…" : "Send OTP"}
              onPress={requestOtp}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.helpText}>
              We will send a 4-digit code to your onboarded mobile number.
            </Text>
          </View>
        ) : (
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
              placeholderTextColor={colors.faint}
              style={styles.otpInput}
              value={otp}
            />
            <Button
              disabled={!canVerifyOtp || isSubmitting}
              label={isSubmitting ? "Verifying…" : "Verify & continue"}
              onPress={handleVerifyOtp}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Pressable disabled={resendIn > 0} onPress={requestOtp}>
              <Text style={[styles.resendText, resendIn > 0 && { color: colors.faint }]}>
                {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
              </Text>
            </Pressable>
          </View>
        )}
        <Pressable onPress={onRegister} style={styles.registerButton}>
          <Text style={styles.registerText}>New customer? Create profile</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    backgroundColor: colors.background
  },
  art: {
    width: 120,
    height: 120,
    marginBottom: 8,
    marginLeft: -8
  },
  brand: {
    color: colors.primaryDark,
    fontFamily: fonts.extrabold,
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: 8
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 38,
    lineHeight: 42,
    marginBottom: 12
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    ...shadow.card
  },
  label: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 13,
    marginBottom: 8
  },
  phoneField: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 16,
    overflow: "hidden"
  },
  countryCode: {
    paddingHorizontal: 14,
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 16
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    color: colors.ink,
    fontFamily: fonts.semibold,
    fontSize: 16
  },
  otpInput: {
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 28,
    letterSpacing: 14,
    paddingHorizontal: 18,
    marginBottom: 16
  },
  helpText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 12
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 10
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
    fontFamily: fonts.medium,
    fontSize: 12.5,
    marginTop: 3
  },
  linkText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 13
  },
  resendText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 13,
    textAlign: "center",
    marginTop: 16
  },
  registerButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginTop: 14
  },
  registerText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 14
  }
});
