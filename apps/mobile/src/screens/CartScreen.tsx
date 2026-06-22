import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconButton, Screen } from "../components/ui";
import type { Product, Store } from "../data/catalog";
import { categoryImage, illustrations } from "../theme/assets";
import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";
import type { getCartSummary } from "../utils/cart";
import { formatMoney } from "../utils/cart";

type CartScreenProps = {
  cartSummary: ReturnType<typeof getCartSummary>;
  onAdd: (productId: string) => void;
  onBack: () => void;
  onCheckout: () => void;
  onClear: () => void;
  onRemove: (productId: string) => void;
  products: Product[];
  selectedShop: Store | null;
};

export function CartScreen({
  cartSummary,
  onAdd,
  onBack,
  onCheckout,
  onClear,
  onRemove,
  products,
  selectedShop
}: CartScreenProps) {
  const insets = useSafeAreaInsets();
  const isEmpty = cartSummary.lines.length === 0;
  const addOns = products.filter(
    (product) => !cartSummary.lines.some((line) => line.product.id === product.id)
  );

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      overlay={
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}>
          <View>
            <Text style={styles.barCaption}>Total payable</Text>
            <Text style={styles.barTotal}>{formatMoney(cartSummary.total)}</Text>
          </View>
          <Button
            disabled={isEmpty}
            icon="arrow-right"
            label="Checkout"
            onPress={onCheckout}
            style={styles.barButton}
          />
        </View>
      }
    >
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={onBack} />
        <Text style={styles.title}>Your cart</Text>
        {!isEmpty ? (
          <Pressable onPress={onClear}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : (
          <View style={{ width: 46 }} />
        )}
      </View>

      <View style={styles.delivery}>
        <Image resizeMode="contain" source={illustrations.scooter} style={styles.deliveryImage} />
        <View style={{ flex: 1 }}>
          <Text style={styles.deliveryTitle}>
            {selectedShop?.name ?? "Selected shop"} · {selectedShop?.eta ?? "15–20 min"}
          </Text>
          <Text style={styles.deliveryText}>
            Cash on delivery · shop is {selectedShop?.distance ?? "nearby"} away
          </Text>
        </View>
      </View>

      {isEmpty ? (
        <View style={styles.emptyCard}>
          <Image resizeMode="contain" source={illustrations.cloche} style={styles.emptyImage} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add essentials from {selectedShop?.name ?? "this shop"} to get started.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {cartSummary.lines.map((line) => (
            <View key={line.product.id} style={styles.row}>
              <View style={styles.thumb}>
                <Image
                  resizeMode="contain"
                  source={
                    line.product.imageUrl
                      ? { uri: line.product.imageUrl }
                      : categoryImage(line.product.category)
                  }
                  style={styles.thumbImage}
                />
              </View>
              <View style={styles.rowCopy}>
                <Text numberOfLines={1} style={styles.itemName}>
                  {line.product.name}
                </Text>
                <Text style={styles.itemMeta}>{line.product.unit}</Text>
                <Text style={styles.itemPrice}>{formatMoney(line.product.price)}</Text>
              </View>
              <View style={styles.qty}>
                <Pressable hitSlop={6} onPress={() => onRemove(line.product.id)} style={styles.qtyButton}>
                  <MaterialCommunityIcons color={colors.white} name="minus" size={15} />
                </Pressable>
                <Text style={styles.qtyCount}>{line.quantity}</Text>
                <Pressable hitSlop={6} onPress={() => onAdd(line.product.id)} style={styles.qtyButton}>
                  <MaterialCommunityIcons color={colors.white} name="plus" size={15} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.noteCard}>
        <Text style={styles.cardLabel}>Delivery note</Text>
        <TextInput
          placeholder="e.g. call before arriving"
          placeholderTextColor={colors.faint}
          style={styles.noteInput}
        />
      </View>

      {addOns.length > 0 ? (
        <View style={styles.addOnCard}>
          <Text style={styles.cardLabel}>Add a little more</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addOnRow}>
            {addOns.slice(0, 5).map((product) => (
              <View key={product.id} style={styles.addOnTile}>
                <View style={styles.addOnImageBox}>
                  <Image
                    resizeMode="contain"
                    source={product.imageUrl ? { uri: product.imageUrl } : categoryImage(product.category)}
                    style={styles.addOnImage}
                  />
                </View>
                <Text numberOfLines={1} style={styles.addOnName}>
                  {product.name}
                </Text>
                <Text style={styles.addOnPrice}>{formatMoney(product.price)}</Text>
                <Pressable onPress={() => onAdd(product.id)} style={styles.addOnButton}>
                  <MaterialCommunityIcons color={colors.onPrimary} name="plus" size={18} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.billCard}>
        <BillLine label="Item total" value={formatMoney(cartSummary.subtotal)} />
        <BillLine label="Delivery fee" value={formatMoney(cartSummary.deliveryFee)} />
        <BillLine label="You save" value={`- ${formatMoney(cartSummary.savings)}`} highlight />
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatMoney(cartSummary.total)}</Text>
        </View>
      </View>
    </Screen>
  );
}

function BillLine({
  label,
  value,
  highlight
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.billLine}>
      <Text style={styles.billLabel}>{label}</Text>
      <Text style={[styles.billValue, highlight && { color: colors.success }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 150
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
  clear: {
    color: colors.danger,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  delivery: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    padding: 14,
    marginBottom: 16
  },
  deliveryImage: {
    width: 56,
    height: 56
  },
  deliveryTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 14
  },
  deliveryText: {
    color: colors.inkSoft,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2
  },
  emptyCard: {
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 26,
    marginBottom: 16
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 8
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 18
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4
  },
  list: {
    gap: 12,
    marginBottom: 16
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12
  },
  thumb: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    overflow: "hidden"
  },
  thumbImage: {
    width: "84%",
    height: "84%"
  },
  rowCopy: {
    flex: 1
  },
  itemName: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 15
  },
  itemMeta: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    marginTop: 2
  },
  itemPrice: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 13.5,
    marginTop: 4
  },
  qty: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    paddingHorizontal: 2
  },
  qtyButton: {
    width: 30,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  qtyCount: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 13,
    minWidth: 16,
    textAlign: "center"
  },
  noteCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 14
  },
  cardLabel: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 14,
    marginBottom: 12
  },
  noteInput: {
    minHeight: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    color: colors.ink,
    fontFamily: fonts.medium,
    fontSize: 14,
    paddingHorizontal: 14
  },
  addOnCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 14
  },
  addOnRow: {
    gap: 12,
    paddingRight: 4
  },
  addOnTile: {
    width: 110,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    padding: 10
  },
  addOnImageBox: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    overflow: "hidden",
    marginBottom: 8
  },
  addOnImage: {
    width: "80%",
    height: "80%"
  },
  addOnName: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 12.5
  },
  addOnPrice: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    marginTop: 2
  },
  addOnButton: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.primary
  },
  billCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16
  },
  billLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  billLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13.5
  },
  billValue: {
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
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 20,
    paddingTop: 14,
    ...shadow.float
  },
  barCaption: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 11.5
  },
  barTotal: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 22,
    marginTop: 2
  },
  barButton: {
    minWidth: 168
  }
});
