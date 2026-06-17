import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

type PermissionState = "idle" | "requesting" | "granted" | "denied" | "demo";

type LocationPermissionScreenProps = {
  onBack: () => void;
  onContinue: () => void;
};

export function LocationPermissionScreen({
  onBack,
  onContinue
}: LocationPermissionScreenProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
  const [message, setMessage] = useState(
    "Bazzato uses your location only to show stores that can deliver quickly nearby."
  );

  const requestLocation = async () => {
    setPermissionState("requesting");
    setMessage("Opening your device permission prompt...");

    const result = await Location.requestForegroundPermissionsAsync();

    if (result.status === Location.PermissionStatus.GRANTED) {
      setPermissionState("granted");
      setMessage("Location access is on. Nearby shops will appear on the home map next.");
      onContinue();
      return;
    }

    setPermissionState("demo");
    setMessage("Using demo area because location was not enabled.");
    onContinue();
  };

  const useDemoArea = () => {
    setPermissionState("demo");
    setMessage("Using demo area: nearby pilot shops within 100m.");
    onContinue();
  };

  const isBusy = permissionState === "requesting";
  const canContinue = permissionState === "granted" || permissionState === "demo";

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.stepText}>C02</Text>
        </View>

        <View style={styles.mapPreview}>
          <View style={styles.radius} />
          <View style={styles.userDot} />
          <View style={[styles.pin, styles.pinOne]} />
          <View style={[styles.pin, styles.pinTwo]} />
          <View style={[styles.pin, styles.pinThree]} />
          <Text style={styles.mapBadge}>100m pilot radius</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.brand}>Bazzato</Text>
          <Text style={styles.title}>Find stores close to you</Text>
          <Text style={styles.subtitle}>
            Share location access so we can show shops, distance, delivery
            radius, and faster COD order options around you.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusIcon}>
              <MaterialCommunityIcons
                color={colors.orange}
                name="map-marker-radius"
                size={24}
              />
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusTitle}>
                {canContinue ? "Location ready" : "Location permission"}
              </Text>
              <Text style={styles.statusText}>{message}</Text>
            </View>
          </View>

          <Pressable
            disabled={isBusy}
            onPress={requestLocation}
            style={[styles.primaryButton, isBusy && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>
              {isBusy ? "Requesting..." : "Allow location access"}
            </Text>
          </Pressable>

          <Pressable onPress={useDemoArea} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Use demo area</Text>
          </Pressable>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              For Expo Go and simulator testing, tap Continue with demo area.
              It takes you directly to nearby shops.
            </Text>
          </View>

          <View style={styles.nextHint}>
            <Text style={styles.nextHintText}>
              Tap either button to continue. Demo area skips device permissions.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable onPress={useDemoArea} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Continue with demo area</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 112
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    marginBottom: 18
  },
  backButton: {
    minHeight: 36,
    justifyContent: "center"
  },
  backButtonText: {
    color: colors.green,
    fontSize: 14,
    fontWeight: "900"
  },
  stepText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  mapPreview: {
    height: 210,
    borderWidth: 1,
    borderColor: colors.lineDark,
    borderRadius: 24,
    backgroundColor: colors.orangeSoft,
    overflow: "hidden",
    marginBottom: 26
  },
  radius: {
    position: "absolute",
    left: 70,
    right: 70,
    top: 42,
    bottom: 42,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.green,
    borderRadius: 1000,
    backgroundColor: "rgba(22, 131, 75, 0.1)"
  },
  userDot: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 9,
    backgroundColor: colors.blue
  },
  pin: {
    position: "absolute",
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 10,
    backgroundColor: colors.magenta
  },
  pinOne: {
    left: 82,
    top: 62
  },
  pinTwo: {
    right: 74,
    top: 96
  },
  pinThree: {
    left: 128,
    bottom: 58
  },
  mapBadge: {
    position: "absolute",
    left: 14,
    bottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: colors.white,
    color: colors.orange,
    fontSize: 11,
    fontWeight: "900"
  },
  content: {
    marginBottom: 22
  },
  brand: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8
  },
  title: {
    color: colors.ink,
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40,
    marginBottom: 12
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23
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
  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  statusIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.orangeSoft
  },
  statusCopy: {
    flex: 1
  },
  statusTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 3
  },
  statusText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  primaryButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.green,
    marginBottom: 10
  },
  disabledButton: {
    backgroundColor: "#a9b5aa"
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  },
  secondaryButton: {
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.white
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  tipBox: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.panel,
    padding: 12,
    marginTop: 12
  },
  tipText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700"
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
    padding: 16
  },
  nextButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.green
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900"
  },
  nextHint: {
    borderWidth: 1,
    borderColor: "#cfdaff",
    borderRadius: 16,
    backgroundColor: colors.blueSoft,
    padding: 12,
    marginTop: 12
  },
  nextHintText: {
    color: "#23438b",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700"
  }
});
