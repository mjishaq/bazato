import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { CartBar } from "../components/CartBar";
import { ProductTile } from "../components/ProductTile";
import { Chip, IconButton, Screen } from "../components/ui";
import { categories, type Product, type ProductCategory } from "../data/catalog";
import type { Store } from "../data/catalog";
import { foodShots } from "../theme/assets";
import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";
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
    <Screen
      scroll
      contentStyle={styles.content}
      overlay={<CartBar onPress={onCart} summary={cartSummary} />}
    >
      <View style={styles.hero}>
        <Image resizeMode="cover" source={foodShots.plate} style={styles.heroImage} />
        <View style={styles.heroTop}>
          <IconButton icon="chevron-left" onPress={onBack} tone="light" />
          <IconButton icon="heart-outline" tone="light" />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text numberOfLines={1} style={styles.storeName}>
            {selectedShop?.name ?? "Nearby shop"}
          </Text>
          <View style={styles.ratingPill}>
            <MaterialCommunityIcons color={colors.onPrimary} name="star" size={13} />
            <Text style={styles.ratingPillText}>{selectedShop?.rating ?? "4.7"}</Text>
          </View>
        </View>
        <Text style={styles.storeMeta}>
          {selectedShop?.category ?? "Groceries"} · {selectedShop?.distance ?? "Nearby"} away
        </Text>
        <View style={styles.metaRow}>
          <Meta icon="clock-fast" text={selectedShop?.eta ?? "15–20 min"} />
          <Meta icon="bike-fast" text="Free delivery" />
          <Meta icon="cash" text="COD" />
        </View>
        <View style={styles.offer}>
          <View style={styles.offerIcon}>
            <MaterialCommunityIcons color={colors.onPrimary} name="sale" size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.offerTitle}>Weekend essentials</Text>
            <Text style={styles.offerText}>Save on fruits, dairy, bread and snacks.</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {categories.map((item) => (
          <Chip
            key={item}
            active={category === item}
            label={item}
            onPress={() => setCategory(item)}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular items</Text>
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
    </Screen>
  );
}

function Meta({
  icon,
  text
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.meta}>
      <MaterialCommunityIcons color={colors.primaryDark} name={icon} size={15} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 130
  },
  hero: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    overflow: "hidden"
  },
  heroImage: {
    width: "100%",
    height: "100%"
  },
  heroTop: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  card: {
    marginTop: -34,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    marginBottom: 18,
    ...shadow.card
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  storeName: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 25
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 6
  },
  ratingPillText: {
    color: colors.onPrimary,
    fontFamily: fonts.extrabold,
    fontSize: 13
  },
  storeMeta: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginTop: 4
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 14
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  metaText: {
    color: colors.inkSoft,
    fontFamily: fonts.bold,
    fontSize: 12.5
  },
  offer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    padding: 12,
    marginTop: 16
  },
  offerIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primary
  },
  offerTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 13.5
  },
  offerText: {
    color: colors.inkSoft,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 1
  },
  chips: {
    gap: 8,
    paddingBottom: 18,
    paddingRight: 8
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 19
  },
  sectionSub: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 12.5
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  }
});
