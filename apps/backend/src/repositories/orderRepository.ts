import { orders, shops } from "../data/mockData.js";
import type { Order, OrderStatus } from "../domain/models.js";

export interface OrderRepository {
  createOrder(order: Order): Promise<Order>;
  getOrder(orderId: string): Promise<Order | null>;
  listOrdersByUser(userId: string): Promise<Order[]>;
  listOrdersByShop(shopId: string): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus, at: string): Promise<Order | null>;
}

export class MemoryOrderRepository implements OrderRepository {
  async createOrder(order: Order) {
    order.shopName = order.shopName ?? shops.find((shop) => shop.id === order.shopId)?.name;
    orders.set(order.id, order);
    return order;
  }

  async getOrder(orderId: string) {
    return orders.get(orderId) ?? null;
  }

  async listOrdersByUser(userId: string) {
    return Array.from(orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listOrdersByShop(shopId: string) {
    return Array.from(orders.values())
      .filter((order) => order.shopId === shopId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateStatus(orderId: string, status: OrderStatus, at: string) {
    const order = orders.get(orderId);

    if (!order) {
      return null;
    }

    order.status = status;
    order.timeline.push({ status, at });

    return order;
  }
}
