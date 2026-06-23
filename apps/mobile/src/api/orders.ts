import type { CartLine, Order } from "../types/cart";
import { apiRequest } from "./client";
import { env } from "../config/env";
import type { ProductCategory } from "../data/catalog";

type ApiOrder = {
  id: string;
  shopId?: string;
  shopName?: string;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  total: number;
  status: Order["status"];
  createdAt: string;
  timeline?: Array<{
    status: Order["status"];
    at: string;
  }>;
};

function mapApiOrder(order: ApiOrder, fallbackLines: CartLine[] = []): Order {
  const lines =
    fallbackLines.length > 0
      ? fallbackLines
      : order.items.map((item) => ({
          product: {
            id: item.productId,
            name: item.name,
            category: "Snacks" as ProductCategory,
            unit: `${item.quantity} item${item.quantity > 1 ? "s" : ""}`,
            price: item.unitPrice,
            mrp: item.unitPrice,
            tag: "Ordered",
            storeId: ""
          },
          quantity: item.quantity
        }));

  return {
    id: order.id,
    lines,
    shopId: order.shopId,
    shopName: order.shopName,
    deliveryAddress: order.deliveryAddress,
    deliveryLatitude: order.deliveryLatitude,
    deliveryLongitude: order.deliveryLongitude,
    total: order.total,
    status: order.status,
    placedAt: new Date(order.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    timeline: order.timeline
  };
}

function toWebSocketUrl(path: string) {
  const baseUrl = env.apiUrl.replace(/^http/, "ws").replace(/\/$/, "");

  return `${baseUrl}${path}`;
}

export async function createCodOrder({
  lines,
  phone,
  shopId,
  deliveryAddress,
  deliveryLatitude,
  deliveryLongitude,
  token
}: {
  lines: CartLine[];
  phone: string;
  shopId: string;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  token: string | null;
}) {
  const data = await apiRequest<{ order: ApiOrder }>("/orders", {
    method: "POST",
    token,
    body: {
      phone,
      shopId,
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      items: lines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity
      }))
    }
  });

  return mapApiOrder(data.order, lines);
}

export async function getOrders(token: string | null) {
  const data = await apiRequest<{ orders: ApiOrder[] }>("/orders", {
    token
  });

  return data.orders.map((order) => mapApiOrder(order));
}

export async function getOrder(orderId: string, token: string | null) {
  const data = await apiRequest<{ order: ApiOrder }>(`/orders/${orderId}`, {
    token
  });

  return mapApiOrder(data.order);
}

export function subscribeToOrder({
  fallbackLines,
  onOrder,
  orderId,
  token
}: {
  fallbackLines?: CartLine[];
  onOrder: (order: Order) => void;
  orderId: string;
  token: string | null;
}) {
  if (!token) {
    return () => undefined;
  }

  const socket = new WebSocket(
    toWebSocketUrl(`/orders/${encodeURIComponent(orderId)}/live?token=${encodeURIComponent(token)}`)
  );

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as { order?: ApiOrder; type?: string };

      if (data.type === "order.updated" && data.order) {
        onOrder(mapApiOrder(data.order, fallbackLines));
      }
    } catch {
      // Ignore malformed socket messages and keep the polling fallback active.
    }
  };

  return () => {
    socket.close();
  };
}
