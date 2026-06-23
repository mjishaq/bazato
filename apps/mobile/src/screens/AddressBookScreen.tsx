import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Button, IconButton, Screen, Tag } from "../components/ui";
import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";

export type SavedAddress = {
  id: string;
  label: string;
  line: string;
  latitude?: number;
  longitude?: number;
};

type AddressBookScreenProps = {
  addresses: SavedAddress[];
  currentLocation: { latitude: number; longitude: number } | null;
  onAddAddress: (address: SavedAddress) => void;
  onBack: () => void;
  onSelectAddress: (addressId: string) => void;
  selectedAddressId?: string;
};

export function AddressBookScreen({
  addresses,
  currentLocation,
  onAddAddress,
  onBack,
  onSelectAddress,
  selectedAddressId
}: AddressBookScreenProps) {
  const [label, setLabel] = useState("");
  const [line, setLine] = useState("");
  const canAdd = label.trim().length >= 2 && line.trim().length >= 8;

  const addAddress = () => {
    if (!canAdd) {
      return;
    }

    onAddAddress({
      id: `address-${Date.now()}`,
      label: label.trim(),
      line: line.trim(),
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude
    });
    setLabel("");
    setLine("");
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={onBack} />
        <Text style={styles.title}>Addresses</Text>
        <View style={{ width: 46 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Saved delivery addresses</Text>
        {addresses.length === 0 ? (
          <Text style={styles.muted}>Add an address before placing an order.</Text>
        ) : null}
        {addresses.map((address) => (
          <Pressable
            key={address.id}
            onPress={() => onSelectAddress(address.id)}
            style={[
              styles.addressRow,
              selectedAddressId === address.id && styles.addressRowActive
            ]}
          >
            <View style={styles.addressIcon}>
              <MaterialCommunityIcons color={colors.primaryDark} name="map-marker" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.addressTitleRow}>
                <Text style={styles.addressLabel}>{address.label}</Text>
                {selectedAddressId === address.id ? <Tag label="Selected" tone="success" /> : null}
              </View>
              <Text style={styles.addressLine}>{address.line}</Text>
              {typeof address.latitude === "number" && typeof address.longitude === "number" ? (
                <Text style={styles.coords}>
                  {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add address</Text>
        <Text style={styles.label}>Label</Text>
        <TextInput
          onChangeText={setLabel}
          placeholder="Home, Office"
          placeholderTextColor={colors.faint}
          style={styles.input}
          value={label}
        />
        <Text style={styles.label}>Full address</Text>
        <TextInput
          multiline
          onChangeText={setLine}
          placeholder="Flat, building, street, landmark"
          placeholderTextColor={colors.faint}
          style={[styles.input, styles.addressInput]}
          textAlignVertical="top"
          value={line}
        />
        <Text style={styles.locationHint}>
          Current GPS location will be saved with this address.
        </Text>
        <Button disabled={!canAdd} icon="plus" label="Save address" onPress={addAddress} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 24
  },
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 14,
    ...shadow.card
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 16,
    marginBottom: 12
  },
  muted: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19
  },
  addressRow: {
    flexDirection: "row",
    gap: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    marginBottom: 10
  },
  addressRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  addressIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surface
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  addressLabel: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 14.5
  },
  addressLine: {
    color: colors.inkSoft,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4
  },
  coords: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    marginTop: 4
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
    marginBottom: 14
  },
  addressInput: {
    minHeight: 92,
    paddingTop: 14
  },
  locationHint: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14
  }
});
