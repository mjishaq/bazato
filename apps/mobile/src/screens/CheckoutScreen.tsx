import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { colors } from "../theme/colors";
import type { Store } from "../data/catalog";
import type { getCartSummary } from "../utils/cart";
import { formatMoney } from "../utils/cart";

type CheckoutScreenProps = {
  cartSummary: ReturnType<typeof getCartSummary>;
  deliveryAddress: string;
  onBack: () => void;
  onDeliveryAddressChange: (address: string) => void;
  onPlaceOrder: () => Promise<void>;
  selectedShop: Store | null;
};

export function CheckoutScreen({
  cartSummary,
  deliveryAddress,
  onBack,
  onDeliveryAddressChange,
  onPlaceOrder,
  selectedShop
}: CheckoutScreenProps) {
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={onBack}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Checkout</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.notice}>
          <MaterialCommunityIcons color={colors.orange} name="cash" size={26} />
          <Text style={styles.noticeTitle}>Cash on delivery</Text>
          <Text style={styles.noticeText}>
            Pay {formatMoney(cartSummary.total)} at your door after the shop packs
            your order.
          </Text>
        </View>

        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons color={colors.orange} name="map-marker-radius" size={21} />
            </View>
            <View>
              <Text style={styles.optionLabel}>Delivery address</Text>
              <Text style={styles.optionValue}>Saved for this order</Text>
            </View>
          </View>
          <TextInput
            multiline
            onChangeText={onDeliveryAddressChange}
            placeholder="Flat, building, street, landmark"
            placeholderTextColor={colors.placeholder}
            style={styles.addressInput}
            value={deliveryAddress}
          />
        </View>
        <Option icon="clock-fast" label="Delivery slot" value="ASAP - 15-20 minutes" />
        <Option
          icon="storefront-outline"
          label="Shop"
          value={`${selectedShop?.name ?? "Selected shop"} - ${selectedShop?.distance ?? "nearby"}`}
        />

        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <View style={styles.paymentOption}>
            <View>
              <Text style={styles.paymentTitle}>Cash on delivery</Text>
              <Text style={styles.paymentText}>Phase 1 default payment method</Text>
            </View>
            <View style={styles.radio} />
          </View>
          <View style={styles.lockedOption}>
            <View>
              <Text style={styles.lockedTitle}>Online payment</Text>
              <Text style={styles.lockedText}>Phase 2</Text>
            </View>
            <Text style={styles.lockedBadge}>Locked</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <SummaryLine label="Items" value={formatMoney(cartSummary.subtotal)} />
          <SummaryLine label="Delivery" value={formatMoney(cartSummary.deliveryFee)} />
          <SummaryLine label="Savings" value={formatMoney(cartSummary.savings)} />
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total due</Text>
            <Text style={styles.totalValue}>{formatMoney(cartSummary.total)}</Text>
          </View>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          disabled={isPlacing || cartSummary.itemCount === 0}
          onPress={handlePlaceOrder}
          style={[
            styles.placeButton,
            (isPlacing || cartSummary.itemCount === 0) && styles.disabledButton
          ]}
        >
          <Text style={styles.placeButtonText}>
            {isPlacing ? "Placing order..." : "Place COD order"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Option({
  icon,
  label,
  value
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.option}>
      <View style={styles.optionIcon}>
        <MaterialCommunityIcons color={colors.orange} name={icon} size={21} />
      </View>
      <View>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionValue}>{value}</Text>
      </View>
      <Text style={styles.optionArrow}>Edit</Text>
    </View>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryLine}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    paddingBottom: 108
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    marginBottom: 16
  },
  backText: {
    color: colors.green,
    fontSize: 14,
    fontWeight: "900"
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900"
  },
  headerSpacer: {
    width: 34
  },
  notice: {
    borderRadius: 22,
    backgroundColor: colors.orangeSoft,
    padding: 16,
    marginBottom: 12,
    gap: 5
  },
  noticeTitle: {
    color: colors.orange,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4
  },
  noticeText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 10
  },
  addressCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 10
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10
  },
  addressInput: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    color: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top"
  },
  optionIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.orangeSoft
  },
  optionLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  optionValue: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  optionArrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900"
  },
  paymentCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 12
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 12
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 8,
    backgroundColor: colors.greenSoft,
    padding: 12,
    marginBottom: 10
  },
  paymentTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  paymentText: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
    fontWeight: "700"
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 6,
    borderColor: colors.green,
    borderRadius: 10,
    backgroundColor: colors.white
  },
  lockedOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 12,
    opacity: 0.56
  },
  lockedTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  lockedText: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3
  },
  lockedBadge: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900"
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 14
  },
  errorText: {
    color: colors.magenta,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 12
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  summaryValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 11,
    marginTop: 2
  },
  totalLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  totalValue: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
    padding: 14
  },
  placeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.green
  },
  disabledButton: {
    backgroundColor: "#a9b5aa"
  },
  placeButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  }
});
