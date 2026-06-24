import type { NextFunction, Request, Response } from "express";

import { verifyAppToken, type AppTokenPayload } from "./appToken.js";

export type CustomerAuthenticatedRequest = Request & {
  auth?: AppTokenPayload & {
    sub: string;
  };
};

export async function authenticateToken(token: string | null | undefined) {
  const payload = await verifyAppToken(token);

  if (!payload?.sub || payload.role !== "customer") {
    return null;
  }

  return {
    ...payload,
    sub: payload.sub
  } satisfies CustomerAuthenticatedRequest["auth"];
}

export async function requireCustomerAuth(
  req: CustomerAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const auth = await authenticateToken(token);

  if (!auth) {
    res.status(401).json({ error: "Customer session token is required" });
    return;
  }

  req.auth = auth;
  next();
}
