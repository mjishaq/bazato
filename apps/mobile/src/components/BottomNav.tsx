import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";

export type BottomNavTab = "home" | "search" | "orders" | "profile";

type BottomNavProps = {
  activeTab: BottomNavTab;
  onHome: () => void;
  onOrders: () => void;
  onProfile: () => void;
  onSearch: () => void;
};

const tabs: Array<{
  key: BottomNavTab;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  { key: "home", label: "Home", icon: "home-variant" },
  { key: "search", label: "Search", icon: "magnify" },
  { key: "orders", label: "Orders", icon: "receipt" },
  { key: "profile", label: "Profile", icon: "account" }
];

export function BottomNav({
  activeTab,
  onHome,
  onOrders,
  onProfile,
  onSearch
}: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const handlers: Record<BottomNavTab, () => void> = {
    home: onHome,
    orders: onOrders,
    profile: onProfile,
    search: onSearch
  };

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 12 }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;

          return (
            <Pressable
              accessibilityRole="button"
              key={tab.key}
              onPress={handlers[tab.key]}
              style={[styles.item, active && styles.itemActive]}
            >
              <MaterialCommunityIcons
                color={active ? colors.onPrimary : "rgba(255,255,255,0.62)"}
                name={tab.icon}
                size={21}
              />
              {active ? <Text style={styles.label}>{tab.label}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 18,
    right: 18,
    alignItems: "center"
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 64,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    ...shadow.float
  },
  item: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: radius.pill,
    marginHorizontal: 2
  },
  itemActive: {
    flex: 1.5,
    backgroundColor: colors.primary
  },
  label: {
    color: colors.onPrimary,
    fontFamily: fonts.extrabold,
    fontSize: 13
  }
});
