import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BottomNav } from "../components/BottomNav";
import { subscribeToOrder } from "../api/orders";
import { colors } from "../theme/colors";
import type { Order } from "../types/cart";
import { formatMoney } from "../utils/cart";

type OrderTrackingScreenProps = {
  order: Order | null;
  onHome: () => void;
  onProfile: () => void;
  onRefresh: () => void | Promise<void>;
  onReorder: () => void;
  onSearch: () => void;
  onOrderUpdate: (order: Order) => void;
  token: string | null;
};

const steps = [
  "Placed",
  "Accepted",
  "Preparing",
  "Ready",
  "Completed"
];

export function OrderTrackingScreen({
  order,
  onHome,
  onProfile,
  onRefresh,
  onOrderUpdate,
  onReorder,
  onSearch,
  token
}: OrderTrackingScreenProps) {
  const itemCount = order?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;
  const shopName = order?.shopName ?? "Selected shop";
  const statusText = order?.status ?? "placed";
  const activeStatusIndex = order
    ? Math.max(
        steps.findIndex((step) => step.toLowerCase() === order.status),
        order.status === "completed" ? steps.length - 1 : 0
      )
    : -1;

  useEffect(() => {
    if (!order) {
      return;
    }

    const unsubscribe = subscribeToOrder({
      fallbackLines: order.lines,
      onOrder: onOrderUpdate,
      orderId: order.id,
      token
    });
    const timer = setInterval(() => {
      void onRefresh();
    }, 15000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [onOrderUpdate, onRefresh, order?.id, token]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Order tracking</Text>
            <Text style={styles.title}>{order ? `Order ${order.id}` : "No active order"}</Text>
          </View>
          <Pressable onPress={onRefresh} style={styles.homeButton}>
            <MaterialCommunityIcons color={colors.green} name="refresh" size={18} />
          </Pressable>
        </View>

        <View style={styles.timerCard}>
          <View style={styles.timerCircle}>
            <MaterialCommunityIcons color={colors.orange} name="bike-fast" size={34} />
          </View>
          <Text style={styles.timerValue}>{statusText}</Text>
          <Text style={styles.timerTitle}>{shopName} is handling your order</Text>
          <Text style={styles.timerText}>
            {itemCount} items - COD {order ? formatMoney(order.total) : formatMoney(0)}
          </Text>
        </View>

        <View style={styles.timelineCard}>
          {steps.map((step, index) => {
            const done = index <= activeStatusIndex;
            return (
              <View key={step} style={styles.timelineRow}>
                <View style={[styles.tick, done && styles.tickDone]}>
                  {done ? (
                    <MaterialCommunityIcons color={colors.white} name="check" size={13} />
                  ) : (
                    <Text style={styles.tickText}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.timelineCopy}>
                  <Text style={styles.timelineTitle}>{step}</Text>
                  <Text style={styles.timelineText}>
                    {index === 0
                      ? "Order received by shop."
                      : index === 1
                        ? "Shop confirmed item availability."
                        : index === 2
                          ? "Items are being packed."
                          : "Pending update."}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>Profile and order history</Text>
          <Text style={styles.profileText}>
            Reorder from previous purchases and track COD orders from one place.
          </Text>
          <Pressable onPress={onReorder} style={styles.reorderButton}>
            <Text style={styles.reorderButtonText}>Reorder essentials</Text>
          </Pressable>
        </View>
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
    marginBottom: 16
  },
  eyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 3
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900"
  },
  homeButton: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.orangeSoft,
    paddingHorizontal: 13,
    paddingVertical: 10
  },
  homeButtonText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900"
  },
  timerCard: {
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
    marginBottom: 12
  },
  timerCircle: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    backgroundColor: colors.white,
    borderRadius: 46,
    marginBottom: 14
  },
  timerValue: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900"
  },
  timerTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  },
  timerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5
  },
  timelineCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 12
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10
  },
  tick: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.lineDark,
    borderRadius: 13,
    backgroundColor: colors.white
  },
  tickDone: {
    borderColor: colors.green,
    backgroundColor: colors.green
  },
  tickText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900"
  },
  timelineCopy: {
    flex: 1
  },
  timelineTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 2
  },
  timelineText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  profileCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 16
  },
  profileTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 5
  },
  profileText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginBottom: 14
  },
  reorderButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.ink
  },
  reorderButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900"
  },
});
