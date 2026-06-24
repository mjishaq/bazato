import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { healthRouter } from "./routes/health.js";
import { ordersRouter } from "./routes/orders.js";
import { vendorRouter } from "./routes/vendor.js";
import { env } from "./config/env.js";
import { auditErrorResponses, auditUnhandledErrors } from "./middleware/audit.js";

const oneMinuteMs = 60 * 1000;

function getCorsOrigin() {
  if (!env.CORS_ORIGIN) {
    return true;
  }

  return env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
}

export function createApp() {
  const app = express();
  const globalLimiter = rateLimit({
    windowMs: oneMinuteMs,
    limit: env.GLOBAL_RATE_LIMIT_PER_MINUTE,
    standardHeaders: true,
    legacyHeaders: false
  });
  const authLimiter = rateLimit({
    windowMs: oneMinuteMs,
    limit: env.AUTH_RATE_LIMIT_PER_MINUTE,
    standardHeaders: true,
    legacyHeaders: false
  });
  const catalogLimiter = rateLimit({
    windowMs: oneMinuteMs,
    limit: env.CATALOG_RATE_LIMIT_PER_MINUTE,
    standardHeaders: true,
    legacyHeaders: false
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );
  app.use(globalLimiter);
  app.use(cors({ origin: getCorsOrigin() }));
  app.use(express.json({ limit: "1mb" }));
  app.use(auditErrorResponses);
  app.use(morgan("dev"));

  app.get("/", (_req, res) => {
    res.json({
      name: "Bazzato API",
      status: "ok",
      phase: "0"
    });
  });

  app.use("/health", healthRouter);
  app.use(
    [
      "/auth/register/request-otp",
      "/auth/request-otp",
      "/auth/verify-otp",
      "/vendor/onboarding/request-otp",
      "/vendor/request-otp",
      "/vendor/login",
      "/vendor/admin/request-otp",
      "/vendor/admin/login"
    ],
    authLimiter
  );
  app.use("/catalog", catalogLimiter);
  app.use("/auth", authRouter);
  app.use("/catalog", catalogRouter);
  app.use("/orders", ordersRouter);
  app.use("/vendor", vendorRouter);
  app.use(auditUnhandledErrors);

  return app;
}
