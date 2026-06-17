import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BottomNav } from "../components/BottomNav";
import { colors } from "../theme/colors";
import type { Order } from "../types/cart";
import { formatMoney } from "../utils/cart";

type OrdersScreenProps = {
  isLoading?: boolean;
  orders: Order[];
  onHome: () => void;
  onOpenOrder: (order: Order) => void;
  onProfile: () => void;
  onRefresh: () => void;
  onSearch: () => void;
};

export function OrdersScreen({
  isLoading,
  orders,
  onHome,
  onOpenOrder,
  onProfile,
  onRefresh,
  onSearch
}: OrdersScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Orders</Text>
            <Text style={styles.title}>Your grocery runs</Text>
          </View>
          <Pressable onPress={onRefresh} style={styles.refreshButton}>
            <MaterialCommunityIcons color={colors.green} name="refresh" size={20} />
          </Pressable>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              color={colors.orange}
              name="clipboard-text-outline"
              size={34}
            />
            <Text style={styles.emptyTitle}>
              {isLoading ? "Loading orders" : "No orders yet"}
            </Text>
            <Text style={styles.emptyText}>
              Orders you place will appear here with status and tracking.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {orders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() => onOpenOrder(order)}
                style={styles.orderCard}
              >
                <View style={styles.orderIcon}>
                  <MaterialCommunityIcons color={colors.orange} name="shopping" size={22} />
                </View>
                <View style={styles.orderCopy}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.meta}>
                    {order.lines.reduce((sum, line) => sum + line.quantity, 0)} items -
                    {" "}{formatMoney(order.total)}
                  </Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNav
        activeTab="orders"
        onHome={onHome}
        onOrders={() => undefined}
        onProfile={onProfile}
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
    justifyContent: "space-between",
    paddingTop: 8,
    marginBottom: 18
  },
  eyebrow: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "900"
  },
  refreshButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white
  },
  emptyCard: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 22
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 6
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center"
  },
  list: {
    gap: 10
  },
  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 13
  },
  orderIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.orangeSoft
  },
  orderCopy: {
    flex: 1
  },
  orderId: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 3
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  statusPill: {
    borderRadius: 999,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  statusText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "capitalize"
  }
});
