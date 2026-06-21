import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CartBar } from "../components/CartBar";
import { ProductTile } from "../components/ProductTile";
import { Chip, IconButton, Screen } from "../components/ui";
import { categories, type Product, type ProductCategory } from "../data/catalog";
import { colors } from "../theme/colors";
import { fonts, radius } from "../theme/typography";
import type { CartQuantities } from "../types/cart";
import type { getCartSummary } from "../utils/cart";

type SearchScreenProps = {
  cart: CartQuantities;
  cartSummary: ReturnType<typeof getCartSummary>;
  onAdd: (productId: string) => void;
  onBack: () => void;
  onCart: () => void;
  onRemove: (productId: string) => void;
  products: Product[];
};

const popular = ["Milk", "Banana", "Bread", "Eggs", "Chips"];

export function SearchScreen({
  cart,
  cartSummary,
  onAdd,
  onBack,
  onCart,
  onRemove,
  products
}: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">("All");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesQuery = product.name
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, query, products]);

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      overlay={<CartBar onPress={onCart} summary={cartSummary} />}
    >
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={onBack} />
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchBox}>
        <MaterialCommunityIcons color={colors.muted} name="magnify" size={21} />
        <TextInput
          autoFocus
          onChangeText={setQuery}
          placeholder="Search milk, fruits, snacks…"
          placeholderTextColor={colors.faint}
          style={styles.searchInput}
          value={query}
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery("")}>
            <MaterialCommunityIcons color={colors.muted} name="close-circle" size={20} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.label}>Popular right now</Text>
      <View style={styles.popularRow}>
        {popular.map((item) => (
          <Chip key={item} label={item} onPress={() => setQuery(item)} />
        ))}
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

      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>Results</Text>
        <Text style={styles.resultCount}>{filteredProducts.length} items</Text>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons color={colors.faint} name="food-off" size={34} />
          <Text style={styles.emptyText}>Nothing matched “{query}”.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductTile
              key={product.id}
              onAdd={onAdd}
              onRemove={onRemove}
              product={product}
              quantity={cart[product.id] ?? 0}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 130
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 26
  },
  searchBox: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    marginBottom: 20
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: colors.ink,
    fontFamily: fonts.semibold,
    fontSize: 15
  },
  label: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 14,
    marginBottom: 12
  },
  popularRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20
  },
  chips: {
    gap: 8,
    paddingBottom: 20,
    paddingRight: 8
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  resultTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 18
  },
  resultCount: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 13
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 40
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 14
  }
});
