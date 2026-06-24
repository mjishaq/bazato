import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconButton, Screen } from "../components/ui";
import type { Store } from "../data/catalog";
import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";
import type { getCartSummary } from "../utils/cart";
import { formatMoney } from "../utils/cart";

type CheckoutScreenProps = {
  cartSummary: ReturnType<typeof getCartSummary>;
  deliveryAddress: string;
  onAddressBook: () => void;
  onBack: () => void;
  onDeliveryAddressChange: (address: string) => void;
  onPlaceOrder: () => Promise<void>;
  selectedShop: Store | null;
};

export function CheckoutScreen({
  cartSummary,
  deliveryAddress,
  onAddressBook,
  onBack,
  onDeliveryAddressChange,
  onPlaceOrder,
  selectedShop
}: CheckoutScreenProps) {
  const insets = useSafeAreaInsets();
  const [error, setError] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      setError("");
      setIsPlacing(true);
      await onPlaceOrder();
    } catch (placeOrderError) {
      setError(
        placeOrderError instanceof Error
          ? placeOrderError.message
          : "Could not place order. Check backend API."
      );
      setIsPlacing(false);
    }
  };

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      overlay={
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}>
          <Button
            disabled={cartSummary.itemCount === 0}
            icon="cash"
            label={isPlacing ? "Placing order…" : `Place COD order · ${formatMoney(cartSummary.total)}`}
            loading={isPlacing}
            onPress={handlePlaceOrder}
          />
        </View>
      }
    >
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={onBack} />
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 46 }} />
      </View>

      <View style={styles.notice}>
        <View style={styles.noticeIcon}>
          <MaterialCommunityIcons color={colors.onPrimary} name="cash-multiple" size={24} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.noticeTitle}>Cash on delivery</Text>
          <Text style={styles.noticeText}>
            Pay {formatMoney(cartSummary.total)} at your door once the shop packs your order.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons color={colors.primaryDark} name="map-marker" size={20} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Delivery address</Text>
            <Text style={styles.cardSub}>Saved for this order</Text>
          </View>
        </View>
        <Button
          icon="book-marker"
          label="Choose saved address"
          onPress={onAddressBook}
          style={{ marginBottom: 12 }}
          variant="ghost"
        />
        <TextInput
          multiline
          onChangeText={onDeliveryAddressChange}
          placeholder="Flat, building, street, landmark"
          placeholderTextColor={colors.faint}
          style={styles.addressInput}
          value={deliveryAddress}
        />
      </View>

      <Row icon="clock-fast" label="Delivery slot" value="ASAP · 15–20 minutes" />
      <Row
        icon="storefront"
        label="Shop"
        value={`${selectedShop?.name ?? "Selected shop"} · ${selectedShop?.distance ?? "nearby"}`}
      />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Payment method</Text>
        <View style={styles.paySelected}>
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons color={colors.primaryDark} name="cash" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.payTitle}>Cash on delivery</Text>
            <Text style={styles.paySub}>Default for Phase 1</Text>
          </View>
          <MaterialCommunityIcons color={colors.primaryDark} name="check-circle" size={22} />
        </View>
        <View style={styles.payLocked}>
          <View style={{ flex: 1 }}>
            <Text style={styles.payLockedTitle}>Online payment</Text>
            <Text style={styles.paySub}>Coming in Phase 2</Text>
          </View>
          <View style={styles.lockedBadge}>
            <MaterialCommunityIcons color={colors.muted} name="lock" size={12} />
            <Text style={styles.lockedBadgeText}>Locked</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order summary</Text>
        <SummaryLine label="Item total" value={formatMoney(cartSummary.subtotal)} />
        <SummaryLine label="Savings" value={`- ${formatMoney(cartSummary.savings)}`} success />
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Total due</Text>
          <Text style={styles.totalValue}>{formatMoney(cartSummary.total)}</Text>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </Screen>
  );
}

function Row({
  icon,
  label,
  value
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.cardIcon}>
        <MaterialCommunityIcons color={colors.primaryDark} name={icon} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{label}</Text>
        <Text style={styles.cardSub}>{value}</Text>
      </View>
      <Text style={styles.edit}>Edit</Text>
    </View>
  );
}

function SummaryLine({
  label,
  value,
  success
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <View style={styles.summaryLine}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, success && { color: colors.success }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 140
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
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    padding: 16,
    marginBottom: 14
  },
  noticeIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: "rgba(22,19,13,0.12)"
  },
  noticeTitle: {
    color: colors.onPrimary,
    fontFamily: fonts.extrabold,
    fontSize: 16
  },
  noticeText: {
    color: "rgba(22,19,13,0.74)",
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2
  },
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 12
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12
  },
  cardIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 14.5
  },
  cardSub: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    marginTop: 2
  },
  addressInput: {
    minHeight: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    color: colors.ink,
    fontFamily: fonts.semibold,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: "top"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 12
  },
  edit: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 12.5
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 15,
    marginBottom: 12
  },
  paySelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    padding: 12,
    marginBottom: 10
  },
  payTitle: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  paySub: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    marginTop: 2
  },
  payLocked: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    opacity: 0.7
  },
  payLockedTitle: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  lockedBadgeText: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  summaryLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13.5
  },
  summaryValue: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 13.5
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
    marginTop: 2
  },
  totalLabel: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 17
  },
  totalValue: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 17
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 20,
    paddingTop: 14,
    ...shadow.float
  }
});
