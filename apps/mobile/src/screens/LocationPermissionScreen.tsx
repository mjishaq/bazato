import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { Button, IconButton, Screen } from "../components/ui";
import { illustrations } from "../theme/assets";
import { colors } from "../theme/colors";
import { fonts, radius } from "../theme/typography";

type PermissionState = "idle" | "requesting" | "granted" | "denied" | "demo";

type LocationPermissionScreenProps = {
  onBack: () => void;
  onContinue: (location?: { latitude: number; longitude: number }) => void;
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
    setMessage("Opening your device permission prompt…");

    const result = await Location.requestForegroundPermissionsAsync();

    if (result.status === Location.PermissionStatus.GRANTED) {
      const current = await Location.getCurrentPositionAsync({});
      setPermissionState("granted");
      setMessage("Location access is on. Nearby shops will appear next.");
      onContinue({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude
      });
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
  const ready = permissionState === "granted" || permissionState === "demo";

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={onBack} />
        <Text style={styles.step}>Step 2 of 2</Text>
      </View>

      <View style={styles.mapCard}>
        <Image resizeMode="contain" source={illustrations.pins} style={styles.mapArt} />
        <View style={styles.radiusBadge}>
          <MaterialCommunityIcons color={colors.onPrimary} name="target" size={13} />
          <Text style={styles.radiusBadgeText}>100m pilot radius</Text>
        </View>
      </View>

      <Text style={styles.brand}>BAZZATO</Text>
      <Text style={styles.title}>Find stores close to you</Text>
      <Text style={styles.subtitle}>
        Share location access so we can show shops, distance, delivery radius, and faster
        COD options around you.
      </Text>

      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={styles.statusIcon}>
            <MaterialCommunityIcons color={colors.primaryDark} name="map-marker-radius" size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>
              {ready ? "Location ready" : "Location permission"}
            </Text>
            <Text style={styles.statusText}>{message}</Text>
          </View>
        </View>

        <Button
          disabled={isBusy}
          icon="crosshairs-gps"
          label={isBusy ? "Requesting…" : "Allow location access"}
          onPress={requestLocation}
          style={{ marginBottom: 10 }}
        />
        <Button label="Continue with demo area" onPress={useDemoArea} variant="ghost" />

        <View style={styles.tip}>
          <MaterialCommunityIcons color={colors.muted} name="information-outline" size={15} />
          <Text style={styles.tipText}>
            For Expo Go and simulators, the demo area skips device permissions.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  step: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 12.5
  },
  mapCard: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    overflow: "hidden",
    marginBottom: 24
  },
  mapArt: {
    width: "70%",
    height: "78%"
  },
  radiusBadge: {
    position: "absolute",
    bottom: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  radiusBadgeText: {
    color: colors.onPrimary,
    fontFamily: fonts.extrabold,
    fontSize: 11
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
    fontSize: 32,
    lineHeight: 36,
    marginBottom: 10
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 22
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18
  },
  statusIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft
  },
  statusTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 15,
    marginBottom: 3
  },
  statusText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 18
  },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    marginTop: 14
  },
  tipText: {
    flex: 1,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17
  }
});
