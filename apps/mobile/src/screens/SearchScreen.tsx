import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CartBar } from "../components/CartBar";
import { ProductTile } from "../components/ProductTile";
import { categories, type Product, type ProductCategory } from "../data/catalog";
import { colors } from "../theme/colors";
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
  }, [category, query]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Search</Text>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            autoFocus
            onChangeText={setQuery}
            placeholder="Search milk, fruits, snacks"
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
            value={query}
          />
        </View>

        <View style={styles.popularBox}>
          <Text style={styles.boxTitle}>Popular searches</Text>
          <View style={styles.popularGrid}>
            {["Milk", "Banana", "Bread", "Biscuits"].map((item) => (
              <Pressable key={item} onPress={() => setQuery(item)} style={styles.popularTile}>
                <Text style={styles.popularInitial}>{item[0]}</Text>
                <Text style={styles.popularText}>{item}</Text>
              </Pressable>
            ))}
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

        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Results</Text>
          <Text style={styles.resultCount}>{filteredProducts.length} items</Text>
        </View>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
    marginBottom: 14
  },
  backButton: {
    minHeight: 36,
    justifyContent: "center"
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
  searchBox: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    marginBottom: 14
  },
  searchInput: {
    height: "100%",
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  popularBox: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 14
  },
  boxTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12
  },
  popularGrid: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  popularTile: {
    width: "23%",
    alignItems: "center",
    gap: 7
  },
  popularInitial: {
    width: 52,
    height: 52,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.greenSoft,
    color: colors.green,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 20,
    fontWeight: "900"
  },
  popularText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center"
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
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  resultTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  resultCount: {
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
