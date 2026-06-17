import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Product } from "../data/catalog";
import { colors } from "../theme/colors";
import { formatMoney } from "../utils/cart";

type ProductTileProps = {
  product: Product;
  quantity: number;
  onAdd: (productId: string) => void;
  onRemove: (productId: string) => void;
};

export function ProductTile({
  product,
  quantity,
  onAdd,
  onRemove
}: ProductTileProps) {
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  const icon = getProductIcon(product.id);

  return (
    <View style={styles.card}>
      <View style={styles.imageBox}>
        {discount > 0 ? <Text style={styles.discount}>{discount}% OFF</Text> : null}
        {product.imageUrl ? (
          <Image
            resizeMode="contain"
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
          />
        ) : (
          <View style={styles.iconHalo}>
            <MaterialCommunityIcons color={icon.color} name={icon.name} size={46} />
          </View>
        )}
      </View>
      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>
      <Text style={styles.unit}>{product.unit}</Text>
      <Text style={styles.tag}>{product.tag}</Text>
      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>{formatMoney(product.price)}</Text>
          <Text style={styles.mrp}>{formatMoney(product.mrp)}</Text>
        </View>
        {quantity > 0 ? (
          <View style={styles.qty}>
            <Pressable onPress={() => onRemove(product.id)} style={styles.qtyButton}>
              <Text style={styles.qtyText}>-</Text>
            </Pressable>
            <Text style={styles.qtyCount}>{quantity}</Text>
            <Pressable onPress={() => onAdd(product.id)} style={styles.qtyButton}>
              <Text style={styles.qtyText}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => onAdd(product.id)} style={styles.addButton}>
            <Text style={styles.addText}>ADD</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function getProductIcon(productId: string) {
  const icons: Record<string, { name: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
    apple: { name: "food-apple", color: "#d7382f" },
    banana: { name: "fruit-cherries", color: "#e6a600" },
    milk: { name: "bottle-soda-classic-outline", color: "#2f76c8" },
    bread: { name: "bread-slice", color: "#b9782f" },
    eggs: { name: "egg-outline", color: "#8b6f47" },
    biscuits: { name: "cookie-outline", color: "#9d5f2c" },
    chips: { name: "food-drumstick-outline", color: "#fc8019" },
    curd: { name: "cup", color: "#2f76c8" }
  };

  return icons[productId] ?? { name: "shopping-outline", color: colors.green };
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#6b3410",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3
  },
  imageBox: {
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.orangeSoft,
    marginBottom: 10,
    overflow: "hidden"
  },
  discount: {
    position: "absolute",
    left: 7,
    top: 7,
    overflow: "hidden",
    borderRadius: 7,
    backgroundColor: colors.magenta,
    color: colors.white,
    paddingHorizontal: 5,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: "900"
  },
  iconHalo: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 38,
    backgroundColor: colors.white
  },
  productImage: {
    width: "88%",
    height: "88%"
  },
  name: {
    minHeight: 36,
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18
  },
  unit: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2
  },
  tag: {
    color: colors.orange,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 6
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 9
  },
  price: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  mrp: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    textDecorationLine: "line-through"
  },
  addButton: {
    minWidth: 58,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 10,
    backgroundColor: colors.white
  },
  addText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900"
  },
  qty: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
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
  }
});
