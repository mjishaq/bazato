import { prisma } from "../db/prisma.js";
import type { Order, OrderStatus } from "../domain/models.js";
import type { Prisma } from "../generated/prisma/index.js";
import type { OrderRepository } from "./orderRepository.js";

const statusToPrisma = {
  accepted: "ACCEPTED",
  cancelled: "CANCELLED",
  completed: "COMPLETED",
  placed: "PLACED",
  preparing: "PREPARING",
  ready: "READY",
  rejected: "REJECTED"
} as const;

const statusFromPrisma = Object.fromEntries(
  Object.entries(statusToPrisma).map(([api, db]) => [db, api])
) as Record<string, OrderStatus>;

const orderInclude = {
  items: true,
  shop: true,
  timeline: true,
  user: true
} as const satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function mapOrder(order: OrderRow | null): Order | null {
  if (!order) {
    return null;
  }

  return {
    id: order.orderNumber,
    phone: order.user.phone,
    userId: order.user.keycloakSubject,
    shopId: order.shopId,
    shopName: order.shop.name,
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: "cod",
    status: statusFromPrisma[order.status],
    deliveryAddress: order.deliveryAddress ?? undefined,
    deliveryLatitude:
      order.deliveryLatitude !== null ? Number(order.deliveryLatitude) : undefined,
    deliveryLongitude:
      order.deliveryLongitude !== null ? Number(order.deliveryLongitude) : undefined,
    note: order.note ?? undefined,
    createdAt: order.createdAt.toISOString(),
    timeline: order.timeline.map((item) => ({
      status: statusFromPrisma[item.status],
      at: item.createdAt.toISOString()
    }))
  };
}

export class PrismaOrderRepository implements OrderRepository {
  async createOrder(order: Order) {
    const userByPhone = await prisma.user.findUnique({
      where: { phone: order.phone }
    });
    const userBySubject = userByPhone
      ? null
      : await prisma.user.findUnique({
          where: { keycloakSubject: order.userId }
        });
    const orderUser = userByPhone
      ? userByPhone
      : userBySubject
        ? await prisma.user.update({
            where: { id: userBySubject.id },
            data: {
              phone: order.phone,
              role: "CUSTOMER"
            }
          })
        : await prisma.user.create({
            data: {
              keycloakSubject: order.userId,
              phone: order.phone,
              role: "CUSTOMER"
            }
          });
    const created = await prisma.order.create({
      data: {
        orderNumber: order.id,
        user: {
          connect: {
            id: orderUser.id
          }
        },
        shop: {
          connect: {
            id: order.shopId
          }
        },
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        paymentMethod: "COD",
        status: "PLACED",
        deliveryAddress: order.deliveryAddress,
        deliveryLatitude: order.deliveryLatitude,
        deliveryLongitude: order.deliveryLongitude,
        note: order.note,
        items: {
          create: order.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        },
        timeline: {
          create: [{ status: "PLACED" }]
        }
      },
      include: orderInclude
    });

    return mapOrder(created) ?? order;
  }

  async getOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: orderInclude
    });

    return mapOrder(order);
  }

  async listOrdersByUser(userId: string) {
    const orders = await prisma.order.findMany({
      where: {
        user: {
          keycloakSubject: userId
        }
      },
      orderBy: { createdAt: "desc" },
      include: orderInclude
    });

    return orders
      .map((order) => mapOrder(order))
      .filter((order): order is Order => Boolean(order));
  }

  async listOrdersByShop(shopId: string) {
    const orders = await prisma.order.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
      include: orderInclude
    });

    return orders
      .map((order) => mapOrder(order))
      .filter((order): order is Order => Boolean(order));
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await prisma.order.update({
      where: { orderNumber: orderId },
      data: {
        status: statusToPrisma[status],
        timeline: {
          create: [{ status: statusToPrisma[status] }]
        }
      },
      include: orderInclude
    });

    return mapOrder(order);
  }
}
