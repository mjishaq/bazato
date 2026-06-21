import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";
import type { getCartSummary } from "../utils/cart";
import { formatMoney } from "../utils/cart";

type CartSummary = ReturnType<typeof getCartSummary>;

type CartBarProps = {
  summary: CartSummary;
  onPress: () => void;
  withNav?: boolean;
};

export function CartBar({ summary, onPress, withNav = false }: CartBarProps) {
  const insets = useSafeAreaInsets();

  if (summary.itemCount === 0) {
    return null;
  }

  const bottom = insets.bottom + 12 + (withNav ? 76 : 0);

  return (
    <Pressable onPress={onPress} style={[styles.bar, { bottom }]}>
      <View style={styles.left}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{summary.itemCount}</Text>
        </View>
        <View>
          <Text style={styles.title}>View cart</Text>
          <Text style={styles.subtitle}>
            {summary.savings > 0
              ? `You save ${formatMoney(summary.savings)}`
              : `${summary.itemCount} items added`}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.total}>{formatMoney(summary.subtotal)}</Text>
        <View style={styles.arrow}>
          <MaterialCommunityIcons color={colors.primary} name="arrow-right" size={18} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 18,
    right: 18,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 9,
    ...shadow.yellow
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  badge: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: colors.ink
  },
  badgeText: {
    color: colors.primary,
    fontFamily: fonts.extrabold,
    fontSize: 16
  },
  title: {
    color: colors.onPrimary,
    fontFamily: fonts.extrabold,
    fontSize: 15
  },
  subtitle: {
    color: "rgba(22,19,13,0.66)",
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    marginTop: 1
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 4
  },
  total: {
    color: colors.onPrimary,
    fontFamily: fonts.extrabold,
    fontSize: 16
  },
  arrow: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: colors.ink
  }
});
