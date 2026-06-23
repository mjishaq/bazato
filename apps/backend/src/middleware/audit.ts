import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";

function getAuthContext(req: Request) {
  const auth = (req as Request & {
    appAuth?: { phone?: string; sub?: string };
    auth?: { phone?: string; sub?: string };
  }).appAuth ?? (req as Request & { auth?: { phone?: string; sub?: string } }).auth;

  return {
    phone:
      auth?.phone ??
      (typeof req.body?.phone === "string" ? req.body.phone : undefined) ??
      (typeof req.body?.ownerPhone === "string" ? req.body.ownerPhone : undefined),
    userId: auth?.sub
  };
}

async function writeAuditLog({
  errorMessage,
  req,
  statusCode
}: {
  errorMessage: string;
  req: Request;
  statusCode: number;
}) {
  if (env.DATA_SOURCE !== "postgres") {
    return;
  }

  try {
    const { prisma } = await import("../db/prisma.js");
    const context = getAuthContext(req);

    await prisma.auditLog.create({
      data: {
        errorMessage,
        method: req.method,
        path: req.originalUrl,
        phone: context.phone,
        requestJson: req.body ?? undefined,
        statusCode,
        userId: context.userId
      }
    });
  } catch (auditError) {
    console.error("[audit] failed to store API error", auditError);
  }
}

export function auditErrorResponses(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);

  res.json = ((body: unknown) => {
    if (res.statusCode >= 400 && !res.locals.auditLogged) {
      const message =
        body && typeof body === "object" && "error" in body
          ? String((body as { error?: unknown }).error ?? "API error")
          : "API error";

      void writeAuditLog({
        errorMessage: message,
        req,
        statusCode: res.statusCode
      });
    }

    return originalJson(body);
  }) as Response["json"];

  next();
}

export function auditUnhandledErrors(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const message = error instanceof Error ? error.message : "Unhandled API error";

  void writeAuditLog({
    errorMessage: message,
    req,
    statusCode: 500
  });
  res.locals.auditLogged = true;

  res.status(500).json({ error: "Internal server error" });
}
