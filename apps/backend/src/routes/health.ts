import { Router } from "express";

import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    dataSource: env.DATA_SOURCE,
    status: "healthy",
    service: "bazzato-backend"
  });
});
