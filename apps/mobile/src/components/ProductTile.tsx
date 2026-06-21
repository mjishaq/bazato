import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Product } from "../data/catalog";
import { categoryImage } from "../theme/assets";
import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";
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

  return (
    <View style={styles.card}>
      <View style={styles.imageBox}>
        {discount > 0 ? (
          <View style={styles.discount}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        ) : null}
        <Image
          resizeMode="contain"
          source={product.imageUrl ? { uri: product.imageUrl } : categoryImage(product.category)}
          style={styles.productImage}
        />
      </View>

      <Text numberOfLines={1} style={styles.tag}>
        {product.tag}
      </Text>
      <Text numberOfLines={1} style={styles.name}>
        {product.name}
      </Text>
      <Text style={styles.unit}>{product.unit}</Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>{formatMoney(product.price)}</Text>
          {discount > 0 ? <Text style={styles.mrp}>{formatMoney(product.mrp)}</Text> : null}
        </View>
        {quantity > 0 ? (
          <View style={styles.qty}>
            <Pressable hitSlop={6} onPress={() => onRemove(product.id)} style={styles.qtyButton}>
              <MaterialCommunityIcons color={colors.white} name="minus" size={15} />
            </Pressable>
            <Text style={styles.qtyCount}>{quantity}</Text>
            <Pressable hitSlop={6} onPress={() => onAdd(product.id)} style={styles.qtyButton}>
              <MaterialCommunityIcons color={colors.white} name="plus" size={15} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => onAdd(product.id)} style={styles.addButton}>
            <MaterialCommunityIcons color={colors.onPrimary} name="plus" size={22} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: 11,
    marginBottom: 14,
    ...shadow.card
  },
  imageBox: {
    height: 118,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    marginBottom: 11,
    overflow: "hidden"
  },
  discount: {
    position: "absolute",
    left: 8,
    top: 8,
    zIndex: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  discountText: {
    color: colors.primary,
    fontFamily: fonts.extrabold,
    fontSize: 9.5,
    letterSpacing: 0.3
  },
  productImage: {
    width: "82%",
    height: "82%"
  },
  tag: {
    color: colors.primaryDark,
    fontFamily: fonts.extrabold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 3
  },
  name: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 15
  },
  unit: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    marginTop: 2
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 11
  },
  price: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 15
  },
  mrp: {
    color: colors.faint,
    fontFamily: fonts.medium,
    fontSize: 11,
    textDecorationLine: "line-through",
    marginTop: 1
  },
  addButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    ...shadow.yellow
  },
  qty: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    paddingHorizontal: 2
  },
  qtyButton: {
    width: 30,
    height: 38,
    alignItems: "center",
    justifyContent: "center"
  },
  qtyCount: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 13,
    minWidth: 16,
    textAlign: "center"
  }
});
