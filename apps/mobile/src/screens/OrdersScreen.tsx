import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { BottomNav } from "../components/BottomNav";
import { IconButton, Screen, Tag } from "../components/ui";
import { illustrations } from "../theme/assets";
import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";
import type { Order, OrderStatus } from "../types/cart";
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

function statusTone(status: OrderStatus): "primary" | "dark" | "success" | "danger" {
  if (status === "completed") return "success";
  if (status === "rejected" || status === "cancelled") return "danger";
  if (status === "ready") return "primary";
  return "dark";
}

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
    <Screen
      scroll
      contentStyle={styles.content}
      overlay={
        <BottomNav
          activeTab="orders"
          onHome={onHome}
          onOrders={() => undefined}
          onProfile={onProfile}
          onSearch={onSearch}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ORDERS</Text>
          <Text style={styles.title}>Your grocery runs</Text>
        </View>
        <IconButton icon="refresh" onPress={onRefresh} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyCard}>
          <Image resizeMode="contain" source={illustrations.receipt} style={styles.emptyArt} />
          <Text style={styles.emptyTitle}>
            {isLoading ? "Loading orders…" : "No orders yet"}
          </Text>
          <Text style={styles.emptyText}>
            Orders you place will appear here with live status and tracking.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {orders.map((order) => {
            const items = order.lines.reduce((sum, line) => sum + line.quantity, 0);
            return (
              <Pressable key={order.id} onPress={() => onOpenOrder(order)} style={styles.card}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons color={colors.primaryDark} name="receipt" size={22} />
                </View>
                <View style={styles.cardCopy}>
                  <Text numberOfLines={1} style={styles.orderId}>
                    {order.id}
                  </Text>
                  <Text style={styles.meta}>
                    {items} items · {formatMoney(order.total)}
                  </Text>
                  <View style={styles.tagRow}>
                    <Tag label={order.status} tone={statusTone(order.status)} />
                  </View>
                </View>
                <MaterialCommunityIcons color={colors.faint} name="chevron-right" size={22} />
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  },
  eyebrow: {
    color: colors.primaryDark,
    fontFamily: fonts.extrabold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 3
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 26
  },
  emptyCard: {
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 28
  },
  emptyArt: {
    width: 150,
    height: 150,
    marginBottom: 8
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 19,
    marginBottom: 6
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: "center"
  },
  list: {
    gap: 12
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    ...shadow.card
  },
  iconBox: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft
  },
  cardCopy: {
    flex: 1
  },
  orderId: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 15.5
  },
  meta: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    marginTop: 3
  },
  tagRow: {
    flexDirection: "row",
    marginTop: 8
  }
});
