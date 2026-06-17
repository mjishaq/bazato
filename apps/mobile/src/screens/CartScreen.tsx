import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { Product } from "../data/catalog";
import type { Store } from "../data/catalog";
import { colors } from "../theme/colors";
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
  const addOns = products.filter(
    (product) => !cartSummary.lines.some((line) => line.product.id === product.id)
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={onBack}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Cart</Text>
          <Pressable onPress={onClear}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>

        <View style={styles.deliveryCard}>
          <MaterialCommunityIcons color={colors.orange} name="bike-fast" size={24} />
          <Text style={styles.deliveryTitle}>
            {selectedShop?.name ?? "Selected shop"} delivers in {selectedShop?.eta ?? "15-20 min"}
          </Text>
          <Text style={styles.deliveryText}>
            COD order - shop is {selectedShop?.distance ?? "nearby"}
          </Text>
        </View>

        {cartSummary.lines.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>
              Add essentials from {selectedShop?.name ?? "this shop"} to checkout.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {cartSummary.lines.map((line) => (
              <View key={line.product.id} style={styles.cartRow}>
                <View style={styles.itemIcon}>
                  <MaterialCommunityIcons
                    color={colors.orange}
                    name="shopping-outline"
                    size={22}
                  />
                </View>
                <View style={styles.itemCopy}>
                  <Text style={styles.itemName}>{line.product.name}</Text>
                  <Text style={styles.itemMeta}>{line.product.unit}</Text>
                  <Text style={styles.itemPrice}>{formatMoney(line.product.price)}</Text>
                </View>
                <View style={styles.qty}>
                  <Pressable onPress={() => onRemove(line.product.id)} style={styles.qtyButton}>
                    <Text style={styles.qtyText}>-</Text>
                  </Pressable>
                  <Text style={styles.qtyCount}>{line.quantity}</Text>
                  <Pressable onPress={() => onAdd(line.product.id)} style={styles.qtyButton}>
                    <Text style={styles.qtyText}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.noteCard}>
          <Text style={styles.noteLabel}>Delivery note</Text>
          <TextInput
            placeholder="Example: call before arriving"
            placeholderTextColor={colors.placeholder}
            style={styles.noteInput}
          />
        </View>

        <View style={styles.addOnCard}>
          <Text style={styles.addOnTitle}>Last minute add-ons</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {addOns.slice(0, 4).map((product) => (
              <View key={product.id} style={styles.addOnTile}>
                <Text style={styles.addOnIcon}>{product.name[0]}</Text>
                <Text numberOfLines={1} style={styles.addOnName}>
                  {product.name}
                </Text>
                <Text style={styles.addOnPrice}>{formatMoney(product.price)}</Text>
                <Pressable onPress={() => onAdd(product.id)} style={styles.addOnButton}>
                  <Text style={styles.addOnButtonText}>ADD</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.billCard}>
          <BillLine label="Items" value={formatMoney(cartSummary.subtotal)} />
          <BillLine label="Delivery" value={formatMoney(cartSummary.deliveryFee)} />
          <BillLine label="You save" value={formatMoney(cartSummary.savings)} />
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatMoney(cartSummary.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutTotal}>{formatMoney(cartSummary.total)}</Text>
          <Text style={styles.checkoutSub}>{cartSummary.itemCount} items</Text>
        </View>
        <Pressable
          disabled={cartSummary.itemCount === 0}
          onPress={onCheckout}
          style={[
            styles.checkoutButton,
            cartSummary.itemCount === 0 && styles.disabledButton
          ]}
        >
          <Text style={styles.checkoutButtonText}>Proceed</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BillLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.billLine}>
      <Text style={styles.billLabel}>{label}</Text>
      <Text style={styles.billValue}>{value}</Text>
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
  clearText: {
    color: colors.orange,
    fontSize: 13,
    fontWeight: "900"
  },
  deliveryCard: {
    borderRadius: 8,
    backgroundColor: colors.orangeSoft,
    padding: 14,
    marginBottom: 12,
    gap: 4
  },
  deliveryTitle: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 3
  },
  deliveryText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700"
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: colors.white,
    padding: 18,
    marginBottom: 12
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4
  },
  list: {
    gap: 10,
    marginBottom: 12
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 12
  },
  itemIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.orangeSoft
  },
  itemCopy: {
    flex: 1
  },
  itemName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  itemMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2
  },
  itemPrice: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4
  },
  qty: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: colors.green
  },
  qtyButton: {
    width: 28,
    height: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  qtyText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900"
  },
  qtyCount: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
    minWidth: 18,
    textAlign: "center"
  },
  noteCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 12
  },
  noteLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8
  },
  noteInput: {
    height: 42,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    color: colors.ink,
    paddingHorizontal: 12
  },
  addOnCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 12
  },
  addOnTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12
  },
  addOnTile: {
    width: 100,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 10,
    marginRight: 10
  },
  addOnIcon: {
    height: 38,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.panel,
    color: colors.green,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8
  },
  addOnName: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900"
  },
  addOnPrice: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3
  },
  addOnButton: {
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 18,
    marginTop: 8
  },
  addOnButtonText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900"
  },
  billCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 14
  },
  billLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  billLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  billValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
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
  checkoutBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 20
  },
  checkoutTotal: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  checkoutSub: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2
  },
  checkoutButton: {
    minWidth: 132,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.green
  },
  disabledButton: {
    backgroundColor: "#a9b5aa"
  },
  checkoutButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900"
  }
});
