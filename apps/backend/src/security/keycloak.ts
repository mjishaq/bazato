import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";

export type AuthenticatedRequest = Request & {
  auth?: JWTPayload & {
    sub?: string;
    realm_access?: {
      roles?: string[];
    };
  };
};

const jwks =
  env.KEYCLOAK_JWKS_URL && env.KEYCLOAK_ISSUER
    ? createRemoteJWKSet(new URL(env.KEYCLOAK_JWKS_URL))
    : null;

export async function authenticateToken(token: string | null | undefined) {
  if (!jwks || !env.KEYCLOAK_ISSUER) {
    if (env.NODE_ENV === "production") {
      return null;
    }

    return {
      sub: "development-user",
      realm_access: {
        roles: ["customer"]
      }
    } satisfies AuthenticatedRequest["auth"];
  }

  if (!token) {
    return null;
  }

  if (env.NODE_ENV !== "production" && token.startsWith("mock-customer-")) {
    const phone = token.replace("mock-customer-", "");

    return {
      sub: `customer-${phone}`,
      realm_access: {
        roles: ["customer"]
      }
    } satisfies AuthenticatedRequest["auth"];
  }

  try {
    const verified = await jwtVerify(token, jwks, {
      audience: env.KEYCLOAK_AUDIENCE,
      issuer: env.KEYCLOAK_ISSUER
    });

    return verified.payload as AuthenticatedRequest["auth"];
  } catch {
    return null;
  }
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
