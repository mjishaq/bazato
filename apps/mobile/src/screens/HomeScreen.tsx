import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { BottomNav } from "../components/BottomNav";
import { CartBar } from "../components/CartBar";
import { Screen, Stars, Tag } from "../components/ui";
import type { Store } from "../data/catalog";
import { categoryShots, foodShots, illustrations } from "../theme/assets";
import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";
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

const categories = [
  { label: "Fruits", image: categoryShots.fruits },
  { label: "Veggies", image: categoryShots.veggies },
  { label: "Dairy", image: categoryShots.dairy },
  { label: "Bakery", image: categoryShots.bakery },
  { label: "Snacks", image: categoryShots.snacks },
  { label: "Drinks", image: categoryShots.drinks }
];

const storeCovers = [foodShots.burger, foodShots.plate, foodShots.chicken];

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
    <Screen
      scroll
      contentStyle={styles.content}
      overlay={
        <>
          <CartBar onPress={onCart} summary={cartSummary} withNav />
          <BottomNav
            activeTab="home"
            onHome={() => undefined}
            onOrders={onOrders}
            onProfile={onProfile}
            onSearch={onSearch}
          />
        </>
      }
    >
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.locationChip}>
          <Text style={styles.deliverLabel}>DELIVER TO</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons color={colors.primaryDark} name="map-marker" size={16} />
            <Text numberOfLines={1} style={styles.locationName}>
              {selectedShop ? selectedShop.name : "Nearby area"}
            </Text>
            <MaterialCommunityIcons color={colors.ink} name="chevron-down" size={18} />
          </View>
        </Pressable>
        <Pressable onPress={onProfile} style={styles.avatar}>
          <MaterialCommunityIcons color={colors.onPrimary} name="account" size={22} />
        </Pressable>
      </View>

      <Pressable onPress={onSearch} style={styles.searchBox}>
        <MaterialCommunityIcons color={colors.muted} name="magnify" size={21} />
        <Text style={styles.searchText}>Search groceries, snacks, shops…</Text>
        <View style={styles.searchAction}>
          <MaterialCommunityIcons color={colors.onPrimary} name="tune-variant" size={18} />
        </View>
      </Pressable>

      <View style={styles.promo}>
        <View style={styles.promoCopy}>
          <Tag label="Today only" tone="primary" />
          <Text style={styles.promoTitle}>Fresh picks up to 30% off</Text>
          <Text style={styles.promoText}>Daily essentials from shops within 100m.</Text>
          <Pressable onPress={onSearch} style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Order now</Text>
            <MaterialCommunityIcons color={colors.onPrimary} name="arrow-right" size={16} />
          </Pressable>
        </View>
        <Image resizeMode="contain" source={foodShots.combo} style={styles.promoImage} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <Pressable onPress={onSearch}>
          <Text style={styles.sectionAction}>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {categories.map((cat) => (
          <Pressable key={cat.label} onPress={onSearch} style={styles.catItem}>
            <View style={styles.catCircle}>
              <Image resizeMode="contain" source={cat.image} style={styles.catImage} />
            </View>
            <Text style={styles.catLabel}>{cat.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shops near you</Text>
        <Text style={styles.sectionMeta}>{shops.length} open</Text>
      </View>

      <View style={styles.shopList}>
        {shops.map((shop, index) => (
          <Pressable
            key={shop.id}
            onPress={() => onOpenStore(shop)}
            style={styles.shopCard}
          >
            <View style={styles.shopCover}>
              <Image
                resizeMode="cover"
                source={storeCovers[index % storeCovers.length]}
                style={styles.shopCoverImage}
              />
              <View style={styles.shopBadge}>
                <Text style={styles.shopBadgeText}>{shop.isOpen ? "OPEN NOW" : "BUSY"}</Text>
              </View>
              <View style={styles.shopEta}>
                <MaterialCommunityIcons color={colors.primary} name="clock-fast" size={13} />
                <Text style={styles.shopEtaText}>{shop.eta}</Text>
              </View>
            </View>
            <View style={styles.shopBody}>
              <View style={styles.shopBodyTop}>
                <Text numberOfLines={1} style={styles.shopName}>
                  {shop.name}
                </Text>
                <View style={styles.ratingPill}>
                  <MaterialCommunityIcons color={colors.onPrimary} name="star" size={12} />
                  <Text style={styles.ratingPillText}>{shop.rating}</Text>
                </View>
              </View>
              <View style={styles.shopMetaRow}>
                <Stars rating={Number(shop.rating)} size={12} />
                <Text style={styles.shopMeta}>
                  {shop.category} · {shop.distance} away
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.banner}>
        <Image resizeMode="contain" source={illustrations.scooter} style={styles.bannerImage} />
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerTitle}>Cash on delivery</Text>
          <Text style={styles.bannerText}>Pay at your door · live tracking on every order.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 190
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  locationChip: {
    flex: 1
  },
  deliverLabel: {
    color: colors.muted,
    fontFamily: fonts.extrabold,
    fontSize: 10,
    letterSpacing: 1.4,
    marginBottom: 3
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  locationName: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 19,
    maxWidth: 200
  },
  avatar: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: colors.primary
  },
  searchBox: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 20,
    ...shadow.card
  },
  searchText: {
    flex: 1,
    color: colors.faint,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  searchAction: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.ink
  },
  promo: {
    flexDirection: "row",
    minHeight: 168,
    borderRadius: radius.xl,
    backgroundColor: colors.ink,
    padding: 20,
    marginBottom: 24,
    overflow: "hidden"
  },
  promoCopy: {
    flex: 1,
    justifyContent: "center",
    gap: 8
  },
  promoTitle: {
    color: colors.white,
    fontFamily: fonts.extrabold,
    fontSize: 23,
    lineHeight: 27,
    maxWidth: 190
  },
  promoText: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 17,
    maxWidth: 180
  },
  promoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  promoButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 13
  },
  promoImage: {
    position: "absolute",
    right: -18,
    bottom: -14,
    width: 168,
    height: 168
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
  sectionAction: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 13
  },
  sectionMeta: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 12.5
  },
  catRow: {
    gap: 16,
    paddingBottom: 24,
    paddingRight: 8
  },
  catItem: {
    alignItems: "center",
    gap: 8,
    width: 72
  },
  catCircle: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft
  },
  catImage: {
    width: "78%",
    height: "78%"
  },
  catLabel: {
    color: colors.inkSoft,
    fontFamily: fonts.bold,
    fontSize: 12
  },
  shopList: {
    gap: 16,
    marginBottom: 24
  },
  shopCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    ...shadow.card
  },
  shopCover: {
    height: 132,
    backgroundColor: colors.primarySoft
  },
  shopCoverImage: {
    width: "100%",
    height: "100%"
  },
  shopBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  shopBadgeText: {
    color: colors.primary,
    fontFamily: fonts.extrabold,
    fontSize: 9.5,
    letterSpacing: 0.6
  },
  shopEta: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  shopEtaText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 11
  },
  shopBody: {
    padding: 14
  },
  shopBodyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  shopName: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 17
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  ratingPillText: {
    color: colors.onPrimary,
    fontFamily: fonts.extrabold,
    fontSize: 12
  },
  shopMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8
  },
  shopMeta: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 12.5
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    padding: 16
  },
  bannerImage: {
    width: 64,
    height: 64
  },
  bannerCopy: {
    flex: 1
  },
  bannerTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 15
  },
  bannerText: {
    color: colors.inkSoft,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2
  }
});
