import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { BottomNav } from "../components/BottomNav";
import { Button, IconButton, Screen } from "../components/ui";
import { subscribeToOrder } from "../api/orders";
import { illustrations } from "../theme/assets";
import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";
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
  { label: "Placed", note: "Order received by the shop." },
  { label: "Accepted", note: "Shop confirmed item availability." },
  { label: "Preparing", note: "Items are being packed." },
  { label: "Ready", note: "Packed and ready to head out." },
  { label: "Completed", note: "Delivered — enjoy!" }
];

const terminalSteps = {
  cancelled: { label: "Cancelled", note: "This order was cancelled." },
  rejected: { label: "Rejected", note: "The shop could not fulfil this order." }
};

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
  const terminalStep =
    order?.status === "rejected"
      ? terminalSteps.rejected
      : order?.status === "cancelled"
        ? terminalSteps.cancelled
        : null;
  const isTerminalFailure = Boolean(terminalStep);
  const visibleSteps = terminalStep ? [steps[0], terminalStep] : steps;
  const activeStatusIndex = order
    ? isTerminalFailure
      ? visibleSteps.length - 1
      : Math.max(
          visibleSteps.findIndex((step) => step.label.toLowerCase() === order.status),
          order.status === "completed" ? visibleSteps.length - 1 : 0
        )
    : -1;
  const statusTitle = isTerminalFailure
    ? statusText === "rejected"
      ? `${shopName} rejected this order`
      : "This order was cancelled"
    : order?.status === "completed"
      ? "Order completed"
      : `${shopName} is on it`;

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
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>ORDER TRACKING</Text>
          <Text numberOfLines={1} style={styles.title}>
            {order ? `Order ${order.id}` : "No active order"}
          </Text>
        </View>
        <IconButton icon="refresh" onPress={() => void onRefresh()} />
      </View>

      <View style={[styles.statusCard, isTerminalFailure && styles.statusCardDanger]}>
        <Image resizeMode="contain" source={illustrations.rider} style={styles.statusArt} />
        <Text style={styles.statusBadge}>{String(statusText).toUpperCase()}</Text>
        <Text style={styles.statusTitle}>{statusTitle}</Text>
        <Text style={styles.statusMeta}>
          {itemCount} items · COD {order ? formatMoney(order.total) : formatMoney(0)}
        </Text>
      </View>

      <View style={styles.timeline}>
        {visibleSteps.map((step, index) => {
          const done = index <= activeStatusIndex;
          const isLast = index === visibleSteps.length - 1;
          return (
            <View key={step.label} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={[styles.tick, done && styles.tickDone, isTerminalFailure && done && styles.tickDanger]}>
                  {done ? (
                    <MaterialCommunityIcons color={colors.onPrimary} name="check" size={14} />
                  ) : (
                    <Text style={styles.tickText}>{index + 1}</Text>
                  )}
                </View>
                {!isLast ? (
                  <View
                    style={[
                      styles.connector,
                      done && styles.connectorDone,
                      isTerminalFailure && done && styles.connectorDanger
                    ]}
                  />
                ) : null}
              </View>
              <View style={styles.timelineCopy}>
                <Text style={[styles.timelineTitle, !done && { color: colors.muted }]}>
                  {step.label}
                </Text>
                <Text style={styles.timelineNote}>{step.note}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.reorderCard}>
        <Text style={styles.reorderTitle}>Need it again?</Text>
        <Text style={styles.reorderText}>
          Reorder essentials and track every COD order from one place.
        </Text>
        <Button icon="reload" label="Reorder essentials" onPress={onReorder} variant="dark" />
      </View>
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
    gap: 12,
    marginBottom: 18
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
    fontSize: 24
  },
  statusCard: {
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    padding: 22,
    marginBottom: 16,
    ...shadow.yellow
  },
  statusCardDanger: {
    backgroundColor: colors.dangerSoft
  },
  statusArt: {
    width: 132,
    height: 132,
    marginBottom: 6
  },
  statusBadge: {
    color: colors.onPrimary,
    fontFamily: fonts.extrabold,
    fontSize: 24,
    letterSpacing: 1
  },
  statusTitle: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginTop: 4
  },
  statusMeta: {
    color: "rgba(22,19,13,0.66)",
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    marginTop: 4
  },
  timeline: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    marginBottom: 16
  },
  timelineRow: {
    flexDirection: "row",
    gap: 14
  },
  timelineRail: {
    alignItems: "center",
    width: 28
  },
  tick: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface
  },
  tickDone: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  tickDanger: {
    borderColor: colors.danger,
    backgroundColor: colors.danger
  },
  tickText: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 11
  },
  connector: {
    flex: 1,
    width: 2.5,
    minHeight: 22,
    backgroundColor: colors.line,
    marginVertical: 2
  },
  connectorDone: {
    backgroundColor: colors.primary
  },
  connectorDanger: {
    backgroundColor: colors.danger
  },
  timelineCopy: {
    flex: 1,
    paddingBottom: 18
  },
  timelineTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 15
  },
  timelineNote: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    marginTop: 2
  },
  reorderCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 6
  },
  reorderTitle: {
    color: colors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 17
  },
  reorderText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8
  }
});
