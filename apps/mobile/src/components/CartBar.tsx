import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import type { getCartSummary } from "../utils/cart";
import { formatMoney } from "../utils/cart";

type CartSummary = ReturnType<typeof getCartSummary>;

type CartBarProps = {
  summary: CartSummary;
  onPress: () => void;
};

export function CartBar({ summary, onPress }: CartBarProps) {
  if (summary.itemCount === 0) {
    return null;
  }

  return (
    <Pressable onPress={onPress} style={styles.bar}>
      <View>
        <Text style={styles.title}>
          {summary.itemCount} items - {formatMoney(summary.subtotal)}
        </Text>
        <Text style={styles.subtitle}>You save {formatMoney(summary.savings)}</Text>
      </View>
      <Text style={styles.action}>Go to cart</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    backgroundColor: colors.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#1e2a24",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 6
  },
  title: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900"
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2
  },
  action: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900"
  }
});
