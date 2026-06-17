import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { colors } from "../theme/colors";

export type CustomerOnboardingProfile = {
  address: string;
  name: string;
  preference: string;
};

type CustomerOnboardingScreenProps = {
  onComplete: (profile: CustomerOnboardingProfile) => void;
};

const preferences = ["Groceries", "Fruits", "Bakery", "Snacks"];

export function CustomerOnboardingScreen({
  onComplete
}: CustomerOnboardingScreenProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [preference, setPreference] = useState(preferences[0]);

  const canContinue = useMemo(
    () => name.trim().length >= 2 && address.trim().length >= 8,
    [address, name]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logoRow}>
            <View style={styles.logo}>
              <MaterialCommunityIcons color={colors.white} name="basket" size={30} />
            </View>
            <View>
              <Text style={styles.brand}>Bazzato</Text>
              <Text style={styles.eyebrow}>Customer onboarding</Text>
            </View>
          </View>
          <Text style={styles.title}>Set up your nearby shopping profile</Text>
          <Text style={styles.subtitle}>
            Save your delivery area once and Bazzato will use it during checkout
            and order tracking.
          </Text>
        </View>

        <View style={styles.form}>
          <Label text="Your name" />
          <TextInput
            autoCapitalize="words"
            onChangeText={setName}
            placeholder="Mohammed"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            value={name}
          />

          <Label text="Default delivery address" />
          <TextInput
            multiline
            onChangeText={setAddress}
            placeholder="Building, street, area, landmark"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, styles.addressInput]}
            textAlignVertical="top"
            value={address}
          />

          <Label text="What do you buy most?" />
          <View style={styles.preferenceGrid}>
            {preferences.map((item) => {
              const selected = item === preference;

              return (
                <Pressable
                  key={item}
                  onPress={() => setPreference(item)}
                  style={[styles.preferenceButton, selected && styles.preferenceActive]}
                >
                  <Text
                    style={[
                      styles.preferenceText,
                      selected && styles.preferenceTextActive
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            disabled={!canContinue}
            onPress={() =>
              onComplete({
                address: address.trim(),
                name: name.trim(),
                preference
              })
            }
            style={[styles.primaryButton, !canContinue && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>Create profile</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: 22,
    backgroundColor: colors.background
  },
  hero: {
    paddingTop: 12,
    marginBottom: 24
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22
  },
  logo: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.orange
  },
  brand: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  eyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900"
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 39,
    marginBottom: 10
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22
  },
  form: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 16
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.panel,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    paddingHorizontal: 13,
    marginBottom: 14
  },
  addressInput: {
    minHeight: 92,
    paddingTop: 13
  },
  preferenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16
  },
  preferenceButton: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.orangeSoft,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  preferenceActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft
  },
  preferenceText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  preferenceTextActive: {
    color: colors.green
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
  }
});
