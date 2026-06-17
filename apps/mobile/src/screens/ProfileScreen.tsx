import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BottomNav } from "../components/BottomNav";
import { colors } from "../theme/colors";
import type { Order } from "../types/cart";
import { formatMoney } from "../utils/cart";

type ProfileScreenProps = {
  order: Order | null;
  orderCount: number;
  customerName?: string;
  phone?: string;
  deliveryAddress: string;
  onHome: () => void;
  onLogout: () => void;
  onOrders: () => void;
  onSearch: () => void;
};

export function ProfileScreen({
  order,
  orderCount,
  customerName,
  phone,
  deliveryAddress,
  onHome,
  onLogout,
  onOrders,
  onSearch
}: ProfileScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons color={colors.orange} name="account" size={34} />
          </View>
          <View>
            <Text style={styles.eyebrow}>Profile</Text>
            <Text style={styles.title}>{customerName ?? "Bazzato customer"}</Text>
            <Text style={styles.phoneText}>{phone ? `+91 ${phone}` : "Phone not linked"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latest order</Text>
          {order ? (
            <>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.meta}>
                {order.lines.length} items - {formatMoney(order.total)} - {order.status}
              </Text>
            </>
          ) : (
            <Text style={styles.meta}>No order placed yet.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery address</Text>
          <View style={styles.row}>
            <MaterialCommunityIcons color={colors.orange} name="map-marker-radius" size={20} />
            <Text style={styles.rowText}>
              {deliveryAddress || "No saved delivery address yet"}
            </Text>
          </View>
          <Text style={styles.meta}>
            Address book will store home, work, and saved delivery locations.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.row}>
            <MaterialCommunityIcons color={colors.green} name="shield-check-outline" size={20} />
            <Text style={styles.rowText}>Phone verified</Text>
          </View>
          <View style={styles.row}>
            <MaterialCommunityIcons color={colors.green} name="cash" size={20} />
            <Text style={styles.rowText}>Cash on delivery enabled</Text>
          </View>
          <View style={styles.row}>
            <MaterialCommunityIcons color={colors.green} name="history" size={20} />
            <Text style={styles.rowText}>{orderCount} saved orders</Text>
          </View>
          <Pressable onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNav
        activeTab="profile"
        onHome={onHome}
        onOrders={onOrders}
        onProfile={() => undefined}
        onSearch={onSearch}
      />
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
    paddingBottom: 96
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 8,
    marginBottom: 18
  },
  avatar: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.orangeSoft
  },
  eyebrow: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  phoneText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3
  },
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 12
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10
  },
  orderId: {
    color: colors.green,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8
  },
  rowText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  logoutButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.orangeSoft,
    marginTop: 12
  },
  logoutText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "900"
  }
});
