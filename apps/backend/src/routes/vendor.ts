import { Router } from "express";
import { z } from "zod";

import { env } from "../config/env.js";
import { services } from "../container.js";
import type { OrderStatus } from "../domain/models.js";
import {
  createAppToken,
  requireAppRole,
  requireSameShop,
  type AppAuthenticatedRequest
} from "../security/appToken.js";

export const vendorRouter = Router();

const productSchema = z.object({
  id: z.string().min(1).optional().or(z.literal("")),
  category: z.string().min(1),
  inStock: z.boolean(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  mrp: z.number().int().nonnegative(),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  tag: z.string().optional(),
  unit: z.string().min(1)
});

const statusSchema = z.object({
  status: z.enum([
    "accepted",
    "preparing",
    "ready",
    "completed",
    "rejected",
    "cancelled"
  ])
});

const onboardingSchema = z.object({
  category: z.string().min(1),
  ownerPhone: z.string().min(10),
  shopId: z.string().min(1).optional(),
  shopName: z.string().min(1)
});

const loginSchema = z.object({
  ownerPhone: z.string().min(10)
});

const adminLoginSchema = z.object({
  phone: z.string().min(10)
});

function routeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

vendorRouter.post("/onboarding", async (req, res) => {
  const parsed = onboardingSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid vendor onboarding payload" });
    return;
  }

  const shop = await services.catalog.upsertShop({
    category: parsed.data.category,
    id: parsed.data.shopId,
    name: parsed.data.shopName,
    ownerPhone: parsed.data.ownerPhone
  });
  const token = await createAppToken({
    phone: parsed.data.ownerPhone,
    role: "vendor",
    shopId: shop.id
  });

  res.status(201).json({ shop, token });
});

vendorRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Valid phone is required" });
    return;
  }

  const shop = await services.catalog.getShopByOwnerPhone(parsed.data.ownerPhone);

  if (!shop) {
    res.status(404).json({ error: "No vendor shop found for this phone" });
    return;
  }

  const token = await createAppToken({
    phone: parsed.data.ownerPhone,
    role: "vendor",
    shopId: shop.id
  });

  res.json({ shop, token });
});

vendorRouter.post("/admin/login", async (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Valid admin phone is required" });
    return;
  }

  if (!env.ADMIN_PHONE || parsed.data.phone !== env.ADMIN_PHONE) {
    res.status(403).json({ error: "Admin access is not configured for this phone" });
    return;
  }

  const token = await createAppToken({
    phone: parsed.data.phone,
    role: "admin"
  });

  res.json({ token });
});

vendorRouter.get(
  "/admin/summary",
  requireAppRole("admin"),
  async (_req: AppAuthenticatedRequest, res) => {
    const shops = await services.catalog.listShops(100);
    const shopSummaries = await Promise.all(
      shops.map(async (shop) => {
        const [products, orders] = await Promise.all([
          services.catalog.listProducts({ shopId: shop.id }),
          services.orders.listOrdersByShop(shop.id)
        ]);
        const completedOrders = orders.filter((order) => order.status === "completed");
        const activeOrders = orders.filter((order) =>
          ["placed", "accepted", "preparing", "ready"].includes(order.status)
        );

        return {
          ...shop,
          activeOrders: activeOrders.length,
          completedOrders: completedOrders.length,
          productCount: products.length,
          totalOrders: orders.length,
          totalRevenue: completedOrders.reduce((sum, order) => sum + order.total, 0)
        };
      })
    );
    const totals = shopSummaries.reduce(
      (metrics, shop) => ({
        activeOrders: metrics.activeOrders + shop.activeOrders,
        completedOrders: metrics.completedOrders + shop.completedOrders,
        products: metrics.products + shop.productCount,
        revenue: metrics.revenue + shop.totalRevenue,
        shops: metrics.shops + 1,
        totalOrders: metrics.totalOrders + shop.totalOrders
      }),
      {
        activeOrders: 0,
        completedOrders: 0,
        products: 0,
        revenue: 0,
        shops: 0,
        totalOrders: 0
      }
    );

    res.json({ shops: shopSummaries, totals });
  }
);

vendorRouter.use(requireAppRole("vendor"));

vendorRouter.get("/shops/:shopId/summary", async (req: AppAuthenticatedRequest, res) => {
  if (!requireSameShop(req, res)) {
    return;
  }

  const shopId = routeParam(req.params.shopId) || env.DEFAULT_SHOP_ID;
  const [shop, products, orders] = await Promise.all([
    services.catalog.getShop(shopId),
    services.catalog.listProducts({ shopId }),
    services.orders.listOrdersByShop(shopId)
  ]);

  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }

  const completedOrders = orders.filter((order) => order.status === "completed");
  const activeOrders = orders.filter((order) =>
    ["placed", "accepted", "preparing", "ready"].includes(order.status)
  );

  res.json({
    metrics: {
      activeOrders: activeOrders.length,
      completedOrders: completedOrders.length,
      inStockProducts: products.filter((product) => product.inStock).length,
      totalOrders: orders.length,
      totalRevenue: completedOrders.reduce((sum, order) => sum + order.total, 0)
    },
    orders,
    products,
    shop
  });
});

vendorRouter.put("/shops/:shopId/products", async (req: AppAuthenticatedRequest, res) => {
  if (!requireSameShop(req, res)) {
    return;
  }

  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product payload" });
    return;
  }

  const product = await services.catalog.upsertProduct({
    ...parsed.data,
    id: parsed.data.id || undefined,
    imageUrl: parsed.data.imageUrl || undefined,
    storeId: routeParam(req.params.shopId) ?? env.DEFAULT_SHOP_ID
  });

  res.json({ product });
});

vendorRouter.patch("/orders/:orderId/status", async (req: AppAuthenticatedRequest, res) => {
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

  if (req.appAuth?.role !== "admin" && currentOrder.shopId !== req.appAuth?.shopId) {
    res.status(403).json({ error: "Vendor cannot update this order" });
    return;
  }

  const order = await services.orders.updateStatus(
    orderId,
    parsed.data.status as OrderStatus
  );

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({ order });
});
