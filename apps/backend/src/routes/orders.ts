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
  note: z.string().optional()
});

const statusSchema = z.object({
  status: z.enum([
    "placed",
    "accepted",
    "preparing",
    "ready",
    "completed",
    "rejected",
    "cancelled"
  ])
});

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

ordersRouter.get("/:orderId", async (req, res) => {
  const order = await services.orders.getOrder(req.params.orderId);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({ order });
});

ordersRouter.patch("/:orderId/status", async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const order = await services.orders.updateStatus(
    req.params.orderId,
    parsed.data.status as OrderStatus
  );

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({ order });
});
