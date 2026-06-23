import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BottomNav } from "../components/BottomNav";
import { Screen, Tag } from "../components/ui";
import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";
import type { Order } from "../types/cart";
import { formatMoney } from "../utils/cart";

type ProfileScreenProps = {
  order: Order | null;
  orderCount: number;
  addressCount: number;
  customerName?: string;
  customerEmail?: string;
  phone?: string;
  deliveryAddress: string;
  onAddresses: () => void;
  onHome: () => void;
  onLogout: () => void;
  onOrders: () => void;
  onSearch: () => void;
};

export function ProfileScreen({
  order,
  orderCount,
  addressCount,
  customerName,
  customerEmail,
  phone,
  deliveryAddress,
  onAddresses,
  onHome,
  onLogout,
  onOrders,
  onSearch
}: ProfileScreenProps) {
  const initial = (customerName ?? "B").trim().charAt(0).toUpperCase();

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      overlay={
        <BottomNav
          activeTab="profile"
          onHome={onHome}
          onOrders={onOrders}
          onProfile={() => undefined}
          onSearch={onSearch}
        />
      }
    >
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{customerName ?? "Bazzato customer"}</Text>
        <Text style={styles.phone}>{phone ? `+91 ${phone}` : "Phone not linked"}</Text>
        <View style={styles.verifiedRow}>
          <MaterialCommunityIcons color={colors.success} name="shield-check" size={15} />
          <Text style={styles.verifiedText}>Phone verified</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat icon="receipt" value={String(orderCount)} label="Orders" />
        <Stat icon="cash" value="COD" label="Payment" />
        <Stat icon="map-marker" value={String(addressCount)} label="Addresses" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Latest order</Text>
        {order ? (
          <View style={styles.latestRow}>
            <View style={styles.latestIcon}>
              <MaterialCommunityIcons color={colors.primaryDark} name="receipt" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.meta}>
                {order.lines.length} items · {formatMoney(order.total)}
              </Text>
            </View>
            <Tag label={order.status} tone="primary" />
          </View>
        ) : (
          <Text style={styles.meta}>No order placed yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery address</Text>
        <View style={styles.row}>
          <MaterialCommunityIcons color={colors.primaryDark} name="map-marker" size={20} />
          <Text style={styles.rowText}>{deliveryAddress || "No saved delivery address yet"}</Text>
        </View>
        <Pressable onPress={onAddresses} style={styles.manageAddresses}>
          <MaterialCommunityIcons color={colors.primaryDark} name="book-marker" size={18} />
          <Text style={styles.manageAddressesText}>Manage addresses</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <AccountRow icon="email" text={customerEmail ?? "Email not registered"} />
        <AccountRow icon="cash-multiple" text="Cash on delivery enabled" />
        <AccountRow icon="history" text={`${orderCount} saved orders`} />
        <AccountRow icon="logout" text="Use logout below to return to login" />
      </View>

      <Pressable onPress={onLogout} style={styles.logout}>
        <MaterialCommunityIcons color={colors.danger} name="logout" size={18} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </Screen>
  );
}

function Stat({
  icon,
  value,
  label
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <MaterialCommunityIcons color={colors.primaryDark} name={icon} size={20} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AccountRow({
  icon,
  text
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons color={colors.inkSoft} name={icon} size={19} />
      <Text style={styles.rowText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120
  },
  profileCard: {
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    padding: 24,
    marginBottom: 14
  },
  avatar: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 39,
    backgroundColor: colors.primary,
    marginBottom: 12
  },
  avatarText: {
    color: colors.onPrimary,
    fontFamily: fonts.extrabold,
    fontSize: 32
  },
  name: {
    color: colors.white,
    fontFamily: fonts.extrabold,
    fontSize: 21
  },
  phone: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginTop: 3
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12
  },
  verifiedText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 12
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 16
  },
  statValue: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 17,
    marginTop: 2
  },
  statLabel: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 11.5
  },
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 12,
    ...shadow.card
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 15,
    marginBottom: 12
  },
  latestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  latestIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft
  },
  orderId: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 15
  },
  meta: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginTop: 2
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7
  },
  rowText: {
    flex: 1,
    color: colors.inkSoft,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  manageAddresses: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    marginTop: 10
  },
  manageAddressesText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 13
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.dangerSoft
  },
  logoutText: {
    color: colors.danger,
    fontFamily: fonts.bold,
    fontSize: 14.5
  }
});
