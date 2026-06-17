import { env } from "../config/env.js";
import type { Order, OrderStatus } from "../domain/models.js";
import type { CatalogRepository } from "../repositories/catalogRepository.js";
import type { OrderRepository } from "../repositories/orderRepository.js";
import { orderEvents } from "../realtime/orderEvents.js";

export type CreateOrderInput = {
  phone: string;
  userId: string;
  shopId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress?: string;
  note?: string;
};

export class OrderService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly orderRepository: OrderRepository
  ) {}

  async createCodOrder(input: CreateOrderInput) {
    const products = await this.catalogRepository.getProductsByIds(
      input.items.map((item) => item.productId)
    );
    const shop = await this.catalogRepository.getShop(input.shopId);
    const productById = new Map(products.map((product) => [product.id, product]));
    const missingProduct = input.items.find((item) => !productById.has(item.productId));

    if (missingProduct) {
      throw new Error(`Product ${missingProduct.productId} not found`);
    }

    const items = input.items.map((item) => {
      const product = productById.get(item.productId);

      return {
        productId: item.productId,
        name: product?.name ?? item.productId,
        quantity: item.quantity,
        unitPrice: product?.price ?? 0
      };
    });
    const subtotal = items.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );
    const now = new Date().toISOString();
    const order: Order = {
      id: `${env.ORDER_ID_PREFIX}${Date.now().toString().slice(-6)}`,
      phone: input.phone,
      userId: input.userId,
      shopId: input.shopId,
      shopName: shop?.name,
      items,
      subtotal,
      deliveryFee: env.DEFAULT_DELIVERY_FEE,
      total: subtotal + env.DEFAULT_DELIVERY_FEE,
      paymentMethod: "cod",
      status: "placed",
      deliveryAddress: input.deliveryAddress,
      note: input.note,
      createdAt: now,
      timeline: [{ status: "placed", at: now }]
    };

    return this.orderRepository.createOrder(order);
  }

  getOrder(orderId: string) {
    return this.orderRepository.getOrder(orderId);
  }

  listOrdersByUser(userId: string) {
    return this.orderRepository.listOrdersByUser(userId);
  }

  listOrdersByShop(shopId: string) {
    return this.orderRepository.listOrdersByShop(shopId);
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderRepository.updateStatus(
      orderId,
      status,
      new Date().toISOString()
    );

    if (order) {
      orderEvents.publishOrderUpdated(order);
    }

    return order;
  }
}
