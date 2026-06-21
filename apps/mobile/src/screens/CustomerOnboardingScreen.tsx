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
  phone: string;
  preference: string;
};

type CustomerOnboardingScreenProps = {
  onComplete: (profile: CustomerOnboardingProfile) => void;
  onLogin: () => void;
};

const preferences = ["Groceries", "Fruits", "Bakery", "Snacks"];

export function CustomerOnboardingScreen({
  onComplete,
  onLogin
}: CustomerOnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preference, setPreference] = useState(preferences[0]);
  const phoneDigits = useMemo(() => phone.replace(/\D/g, ""), [phone]);
  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  const canContinue = useMemo(
    () =>
      name.trim().length >= 2 &&
      emailValid &&
      phoneDigits.length >= 10 &&
      address.trim().length >= 8,
    [address, emailValid, name, phoneDigits]
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
              onChangeText={setPhone}
              placeholder="98765 43210"
              placeholderTextColor={colors.faint}
              style={styles.phoneInput}
              value={phone}
            />
          </View>

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
            disabled={!canContinue}
            label="Create profile"
            onPress={() =>
              onComplete({
                address: address.trim(),
                email: email.trim().toLowerCase(),
                name: name.trim(),
                phone: phoneDigits,
                preference
              })
            }
          />
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
  }
});
