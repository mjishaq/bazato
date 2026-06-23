import type { JWTPayload } from "jose";
import type { NextFunction, Request, Response } from "express";

import { verifyAppToken } from "./appToken.js";

export type AuthenticatedRequest = Request & {
  auth?: JWTPayload & {
    sub?: string;
    realm_access?: {
      roles?: string[];
    };
  };
};

export async function authenticateToken(token: string | null | undefined) {
  const payload = await verifyAppToken(token);

  if (!payload?.sub || !payload.role) {
    return null;
  }

  return {
    ...payload,
    sub: payload.sub,
    realm_access: {
      roles: [payload.role]
    }
  } satisfies AuthenticatedRequest["auth"];
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const auth = await authenticateToken(token);

  if (!auth) {
    res.status(401).json({ error: "Bearer token is required" });
    return;
  }

  req.auth = auth;
  next();
}

export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const roles = req.auth?.realm_access?.roles ?? [];

    if (!roles.includes(role)) {
      res.status(403).json({ error: "Insufficient role" });
      return;
    }

    next();
  };
}
