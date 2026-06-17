import { Router } from "express";

import { services } from "../container.js";

export const catalogRouter = Router();

catalogRouter.get("/shops", async (req, res) => {
  const limit = Number(req.query.limit ?? 20);

  res.json({
    shops: await services.catalog.listShops(limit)
  });
});

catalogRouter.get("/shops/:shopId", async (req, res) => {
  const shop = await services.catalog.getShop(req.params.shopId);

  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }

  res.json({ shop });
});

catalogRouter.get("/shops/:shopId/products", async (req, res) => {
  const category = String(req.query.category ?? "All");
  const query = String(req.query.q ?? "").toLowerCase();

  res.json({
    products: await services.catalog.listProducts({
      category,
      query,
      shopId: req.params.shopId
    })
  });
});

catalogRouter.get("/products", async (req, res) => {
  const query = String(req.query.q ?? "").toLowerCase();
  const category = String(req.query.category ?? "All");

  res.json({
    products: await services.catalog.listProducts({ category, query })
  });
});
