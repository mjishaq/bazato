import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type ComponentProps, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Chip } from "../components/ui";
import { illustrations } from "../theme/assets";
import { colors } from "../theme/colors";
import { fonts, radius } from "../theme/typography";

export type CustomerOnboardingProfile = {
  address: string;
  email: string;
  name: string;
  otp?: string;
  phone: string;
  preference: string;
};

type CustomerOnboardingScreenProps = {
  onComplete: (profile: CustomerOnboardingProfile) => Promise<void> | void;
  onLogin: () => void;
  onRequestOtp: (phone: string) => Promise<unknown>;
};

const preferences = ["Groceries", "Fruits", "Bakery", "Snacks"];

export function CustomerOnboardingScreen({
  onComplete,
  onLogin,
  onRequestOtp
}: CustomerOnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [address, setAddress] = useState("");
  const [preference, setPreference] = useState(preferences[0]);
  const [error, setError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneDigits = useMemo(() => phone.replace(/\D/g, ""), [phone]);
  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  const canContinue = useMemo(
    () =>
      name.trim().length >= 2 &&
      emailValid &&
      phoneDigits.length >= 10 &&
      address.trim().length >= 8 &&
      isOtpSent &&
      otp.length === 4,
    [address, emailValid, isOtpSent, name, otp, phoneDigits]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 14 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logo}>
            <MaterialCommunityIcons color={colors.onPrimary} name="basket" size={26} />
          </View>
          <Image resizeMode="contain" source={illustrations.scooter} style={styles.heroArt} />
        </View>

        <Text style={styles.brand}>BAZZATO</Text>
        <Text style={styles.title}>Set up your{"\n"}shopping profile</Text>
        <Text style={styles.subtitle}>
          Register once — we use this number for OTP login and this address at checkout.
        </Text>

        <View style={styles.form}>
          <Field
            label="Your name"
            autoCapitalize="words"
            onChangeText={setName}
            placeholder="Mohammed"
            value={name}
          />
          <Field
            label="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="name@example.com"
            value={email}
          />

          <Text style={styles.label}>Mobile number for OTP login</Text>
          <View style={styles.phoneField}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={(value) => {
                setPhone(value);
                setOtp("");
                setIsOtpSent(false);
              }}
              placeholder="98765 43210"
              placeholderTextColor={colors.faint}
              style={styles.phoneInput}
              value={phone}
            />
          </View>
          {!isOtpSent ? (
            <Button
              disabled={phoneDigits.length < 10 || isSubmitting}
              label={isSubmitting ? "Sending..." : "Send OTP"}
              onPress={async () => {
                try {
                  setError("");
                  setIsSubmitting(true);
                  await onRequestOtp(phoneDigits);
                  setIsOtpSent(true);
                } catch (otpError) {
                  setError(
                    otpError instanceof Error
                      ? otpError.message
                      : "Could not send OTP. Please try again."
                  );
                } finally {
                  setIsSubmitting(false);
                }
              }}
              style={styles.otpButton}
              variant="ghost"
            />
          ) : (
            <>
              <Text style={styles.label}>Enter OTP</Text>
              <TextInput
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={(value) => setOtp(value.replace(/\D/g, ""))}
                placeholder="1234"
                placeholderTextColor={colors.faint}
                style={styles.input}
                value={otp}
              />
            </>
          )}

          <Text style={styles.label}>Default delivery address</Text>
          <TextInput
            multiline
            onChangeText={setAddress}
            placeholder="Building, street, area, landmark"
            placeholderTextColor={colors.faint}
            style={[styles.input, styles.addressInput]}
            textAlignVertical="top"
            value={address}
          />

          <Text style={styles.label}>What do you buy most?</Text>
          <View style={styles.preferenceGrid}>
            {preferences.map((item) => (
              <Chip
                key={item}
                active={item === preference}
                label={item}
                onPress={() => setPreference(item)}
              />
            ))}
          </View>

          <Button
            disabled={!canContinue || isSubmitting}
            label={isSubmitting ? "Creating..." : "Create profile"}
            onPress={async () => {
              try {
                setError("");
                setIsSubmitting(true);
                await onComplete({
                  address: address.trim(),
                  email: email.trim().toLowerCase(),
                  name: name.trim(),
                  otp,
                  phone: phoneDigits,
                  preference
                });
              } catch (profileError) {
                setError(
                  profileError instanceof Error
                    ? profileError.message
                    : "Could not create profile. Please try again."
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable onPress={onLogin} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Already registered? Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  ...inputProps
}: {
  label: string;
} & ComponentProps<typeof TextInput>) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.faint} style={styles.input} {...inputProps} />
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 36,
    backgroundColor: colors.background
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  logo: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.primary
  },
  heroArt: {
    width: 96,
    height: 96
  },
  brand: {
    color: colors.primaryDark,
    fontFamily: fonts.extrabold,
    fontSize: 13,
    letterSpacing: 2,
    marginTop: 12
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 32,
    lineHeight: 36,
    marginTop: 6
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 22
  },
  form: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18
  },
  label: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 13,
    marginBottom: 8
  },
  input: {
    minHeight: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    color: colors.ink,
    fontFamily: fonts.semibold,
    fontSize: 15,
    paddingHorizontal: 14,
    marginBottom: 16
  },
  phoneField: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 16,
    overflow: "hidden"
  },
  otpButton: {
    marginBottom: 16
  },
  countryCode: {
    paddingHorizontal: 14,
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 15
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    color: colors.ink,
    fontFamily: fonts.semibold,
    fontSize: 15
  },
  addressInput: {
    minHeight: 92,
    paddingTop: 14
  },
  preferenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22
  },
  loginButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12
  },
  loginButtonText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 10,
    textAlign: "center"
  }
});
