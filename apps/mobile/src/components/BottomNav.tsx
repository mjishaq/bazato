import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

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
  { key: "orders", label: "Orders", icon: "clipboard-text-outline" },
  { key: "profile", label: "Profile", icon: "account-circle-outline" }
];

export function BottomNav({
  activeTab,
  onHome,
  onOrders,
  onProfile,
  onSearch
}: BottomNavProps) {
  const handlers: Record<BottomNavTab, () => void> = {
    home: onHome,
    orders: onOrders,
    profile: onProfile,
    search: onSearch
  };

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <Pressable
            accessibilityRole="button"
            key={tab.key}
            onPress={handlers[tab.key]}
            style={styles.navItem}
          >
            <MaterialCommunityIcons
              color={active ? colors.orange : colors.muted}
              name={tab.icon}
              size={20}
            />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  navLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800"
  },
  navLabelActive: {
    color: colors.green,
    fontWeight: "900"
  }
});
