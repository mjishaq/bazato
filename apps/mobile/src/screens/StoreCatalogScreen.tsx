import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CartBar } from "../components/CartBar";
import { ProductTile } from "../components/ProductTile";
import { categories, type Product, type ProductCategory } from "../data/catalog";
import type { Store } from "../data/catalog";
import { colors } from "../theme/colors";
import type { CartQuantities } from "../types/cart";
import type { getCartSummary } from "../utils/cart";

type StoreCatalogScreenProps = {
  cart: CartQuantities;
  cartSummary: ReturnType<typeof getCartSummary>;
  onAdd: (productId: string) => void;
  onBack: () => void;
  onCart: () => void;
  onRemove: (productId: string) => void;
  products: Product[];
  selectedShop: Store | null;
};

export function StoreCatalogScreen({
  cart,
  cartSummary,
  onAdd,
  onBack,
  onCart,
  onRemove,
  products,
  selectedShop
}: StoreCatalogScreenProps) {
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const visibleProducts = products.filter(
    (product) => category === "All" || product.category === category
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Pressable onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <View style={styles.rating}>
              <MaterialCommunityIcons color={colors.white} name="star" size={13} />
              <Text style={styles.ratingText}>4.7</Text>
            </View>
          </View>
          <View style={styles.storeMark}>
            <MaterialCommunityIcons color={colors.orange} name="storefront-outline" size={34} />
          </View>
          <Text style={styles.storeName}>{selectedShop?.name ?? "Nearby shop"}</Text>
          <Text style={styles.storeMeta}>
            {selectedShop?.distance ?? "Nearby"} away - {selectedShop?.eta ?? "Fast"} - COD available
          </Text>
          <View style={styles.offerBanner}>
            <Text style={styles.offerTitle}>Weekend essentials</Text>
            <Text style={styles.offerText}>Save on fruits, dairy, bread, and snacks.</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[styles.chip, category === item && styles.activeChip]}
            >
              <Text style={[styles.chipText, category === item && styles.activeChipText]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Frequently bought</Text>
          <Text style={styles.sectionSub}>{visibleProducts.length} items</Text>
        </View>

        <View style={styles.grid}>
          {visibleProducts.map((product) => (
            <ProductTile
              key={product.id}
              onAdd={onAdd}
              onRemove={onRemove}
              product={product}
              quantity={cart[product.id] ?? 0}
            />
          ))}
        </View>
      </ScrollView>

      <CartBar onPress={onCart} summary={cartSummary} />
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
    paddingBottom: 104
  },
  hero: {
    borderRadius: 26,
    backgroundColor: colors.orange,
    padding: 18,
    marginBottom: 16
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30
  },
  backButton: {
    minHeight: 34,
    justifyContent: "center"
  },
  backText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900"
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  ratingText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900"
  },
  storeMark: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.white,
    marginBottom: 14
  },
  storeName: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 4
  },
  storeMeta: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 16
  },
  offerBanner: {
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 14
  },
  offerTitle: {
    color: colors.magenta,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 3
  },
  offerText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700"
  },
  chips: {
    marginBottom: 16
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginRight: 8
  },
  activeChip: {
    borderColor: colors.green,
    backgroundColor: colors.green
  },
  chipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  activeChipText: {
    color: colors.white
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  sectionSub: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  }
});
