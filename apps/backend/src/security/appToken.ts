import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";

export type AppRole = "vendor" | "admin";

export type AppTokenPayload = JWTPayload & {
  role?: AppRole;
  shopId?: string;
  phone?: string;
};

export type AppAuthenticatedRequest = Request & {
  appAuth?: AppTokenPayload;
};

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function createAppToken(payload: {
  phone: string;
  role: AppRole;
  shopId?: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export function requireAppRole(role: AppRole) {
  return async (req: AppAuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.header("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      res.status(401).json({ error: "Vendor session token is required" });
      return;
    }

    try {
      const verified = await jwtVerify(token, secret);
      const payload = verified.payload as AppTokenPayload;

      if (payload.role !== role && payload.role !== "admin") {
        res.status(403).json({ error: "Insufficient role" });
        return;
      }

      req.appAuth = payload;
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired vendor session" });
    }
  };
}

export function requireSameShop(req: AppAuthenticatedRequest, res: Response) {
  const requestedShopId = req.params.shopId;

  if (req.appAuth?.role === "admin") {
    return true;
  }

  if (!requestedShopId || req.appAuth?.shopId !== requestedShopId) {
    res.status(403).json({ error: "Vendor cannot access this shop" });
    return false;
  }

  return true;
}
