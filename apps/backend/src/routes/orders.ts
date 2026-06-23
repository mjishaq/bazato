import { Router } from "express";
import { z } from "zod";

import { services } from "../container.js";
import type { OrderStatus } from "../domain/models.js";
import { requireAuth, type AuthenticatedRequest } from "../security/keycloak.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

const createOrderSchema = z.object({
  phone: z.string().min(10),
  shopId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive()
      })
    )
    .min(1),
  deliveryAddress: z.string().optional(),
  deliveryLatitude: z.number().min(-90).max(90).optional(),
  deliveryLongitude: z.number().min(-180).max(180).optional(),
  note: z.string().optional()
});

const statusSchema = z.object({
  status: z.enum([
    "cancelled"
  ])
});

function routeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

ordersRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const parsed = createOrderSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order payload" });
    return;
  }

  try {
    const order = await services.orders.createCodOrder({
      ...parsed.data,
      userId: req.auth?.sub ?? "development-user"
    });

    res.status(201).json({ order });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to create order"
    });
  }
});

ordersRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const orders = await services.orders.listOrdersByUser(
    req.auth?.sub ?? "development-user"
  );

  res.json({ orders });
});

ordersRouter.get("/:orderId", async (req: AuthenticatedRequest, res) => {
  const orderId = routeParam(req.params.orderId);

  if (!orderId) {
    res.status(400).json({ error: "Order id is required" });
    return;
  }

  const order = await services.orders.getOrder(orderId);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.userId !== req.auth?.sub) {
    res.status(403).json({ error: "Cannot access another customer order" });
    return;
  }

  res.json({ order });
});

ordersRouter.patch("/:orderId/status", async (req: AuthenticatedRequest, res) => {
  const parsed = statusSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const orderId = routeParam(req.params.orderId);

  if (!orderId) {
    res.status(400).json({ error: "Order id is required" });
    return;
  }

  const currentOrder = await services.orders.getOrder(orderId);

  if (!currentOrder) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (currentOrder.userId !== req.auth?.sub) {
    res.status(403).json({ error: "Cannot update another customer order" });
    return;
  }

  if (!["placed", "accepted"].includes(currentOrder.status)) {
    res.status(409).json({ error: "Order can no longer be cancelled" });
    return;
  }

  const order = await services.orders.updateStatus(
    orderId,
    parsed.data.status as OrderStatus
  );

  res.json({ order });
});
