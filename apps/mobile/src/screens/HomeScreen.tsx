import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BottomNav } from "../components/BottomNav";
import { CartBar } from "../components/CartBar";
import type { Store } from "../data/catalog";
import { colors } from "../theme/colors";
import type { getCartSummary } from "../utils/cart";

type HomeScreenProps = {
  cartSummary: ReturnType<typeof getCartSummary>;
  onBack: () => void;
  onCart: () => void;
  onOpenStore: (shop: Store) => void;
  onOrders: () => void;
  onProfile: () => void;
  onSearch: () => void;
  selectedShop: Store | null;
  shops: Store[];
};

export function HomeScreen({
  cartSummary,
  onBack,
  onCart,
  onOpenStore,
  onOrders,
  onProfile,
  onSearch,
  selectedShop,
  shops
}: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>Bazzato Instashop</Text>
            <Text style={styles.locationTitle}>
              {selectedShop ? selectedShop.name : "Nearby shops"}
            </Text>
          </View>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <MaterialCommunityIcons color={colors.orange} name="map-marker-radius" size={22} />
          </Pressable>
        </View>

        <Pressable onPress={onSearch} style={styles.searchBox}>
          <MaterialCommunityIcons color={colors.orange} name="magnify" size={20} />
          <Text style={styles.searchText}>Search shops or products</Text>
        </Pressable>

        <View style={styles.filterRow}>
          <CategoryPill active icon="flash" label="Nearby" />
          <CategoryPill icon="shopping" label="Grocery" />
          <CategoryPill icon="bottle-soda-classic-outline" label="Dairy" />
          <CategoryPill icon="cookie-outline" label="Snacks" />
        </View>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroKicker}>Fresh morning picks</Text>
            <Text style={styles.heroTitle}>Daily essentials in minutes</Text>
            <Text style={styles.heroText}>Fruits, dairy, bread and snacks from shops nearby.</Text>
          </View>
          <View style={styles.heroIconCluster}>
            <MaterialCommunityIcons color={colors.orange} name="food-apple" size={34} />
            <MaterialCommunityIcons color={colors.green} name="bottle-soda-classic-outline" size={34} />
            <MaterialCommunityIcons color={colors.magenta} name="bread-slice" size={34} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby shops</Text>
          <Text style={styles.sectionAction}>View all</Text>
        </View>

        <View style={styles.shopList}>
          {shops.map((shop) => (
            <Pressable
              key={shop.id}
              onPress={() => onOpenStore(shop)}
              style={[
                styles.shopRow,
                selectedShop?.id === shop.id && styles.selectedShopRow
              ]}
            >
              <View style={styles.shopIcon}>
                <MaterialCommunityIcons
                  color={colors.orange}
                  name={shop.category.toLowerCase().includes("dairy") ? "bottle-soda-classic-outline" : shop.category.toLowerCase().includes("snack") ? "cookie-outline" : "storefront-outline"}
                  size={24}
                />
              </View>
              <View style={styles.shopCopy}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopMeta}>
                  {shop.category} - {shop.eta}
                </Text>
              </View>
              <View style={styles.shopRight}>
                <Text style={styles.distance}>{shop.distance}</Text>
                <Text
                  style={[
                    styles.status,
                    !shop.isOpen && styles.busyStatus
                  ]}
                >
                  {shop.isOpen ? "Open" : "Busy"}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <BottomNav
        activeTab="home"
        onHome={() => undefined}
        onOrders={onOrders}
        onProfile={onProfile}
        onSearch={onSearch}
      />
      <CartBar onPress={onCart} summary={cartSummary} />
    </View>
  );
}

function CategoryPill({
  active,
  icon,
  label
}: {
  active?: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  return (
    <View style={[styles.filterPill, active && styles.activeFilter]}>
      <MaterialCommunityIcons
        color={active ? colors.white : colors.orange}
        name={icon}
        size={15}
      />
      <Text style={[styles.filterPillText, active && styles.activeFilterText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 98
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    marginBottom: 18
  },
  locationLabel: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2
  },
  locationTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900"
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white
  },
  searchBox: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    marginBottom: 12
  },
  searchText: {
    color: colors.placeholder,
    fontSize: 14,
    fontWeight: "700"
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  filterPillText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  activeFilter: {
    borderColor: colors.orange,
    backgroundColor: colors.orange
  },
  activeFilterText: {
    color: colors.white
  },
  heroCard: {
    minHeight: 172,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 24,
    backgroundColor: colors.magentaSoft,
    padding: 18,
    marginBottom: 22,
    overflow: "hidden"
  },
  heroKicker: {
    color: colors.magenta,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8
  },
  heroTitle: {
    maxWidth: 210,
    color: colors.ink,
    fontSize: 25,
    lineHeight: 29,
    fontWeight: "900",
    marginBottom: 8
  },
  heroText: {
    maxWidth: 220,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  heroIconCluster: {
    width: 88,
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  sectionAction: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900"
  },
  shopList: {
    gap: 10
  },
  shopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 12
  },
  selectedShopRow: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeSoft
  },
  shopIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.orangeSoft
  },
  shopCopy: {
    flex: 1
  },
  shopName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 3
  },
  shopMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  shopRight: {
    alignItems: "flex-end",
    gap: 4
  },
  distance: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900"
  },
  status: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.greenSoft,
    color: colors.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "900"
  },
  busyStatus: {
    backgroundColor: colors.orangeSoft,
    color: colors.orange
  },
});
