import { Router } from "express";
import { z } from "zod";

import { services } from "../container.js";

export const authRouter = Router();

const phoneSchema = z.object({
  phone: z.string().min(10)
});

const customerRegistrationSchema = phoneSchema.extend({
  address: z.string().min(8),
  email: z.string().email(),
  name: z.string().min(2),
  preference: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(32)
});

authRouter.post("/register", async (req, res) => {
  const parsed = customerRegistrationSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Valid customer profile is required" });
    return;
  }

  const customer = await services.auth.registerCustomer({
    address: parsed.data.address.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    name: parsed.data.name.trim(),
    phone: parsed.data.phone,
    preference: parsed.data.preference
  });

  res.status(201).json({ customer });
});

authRouter.post("/request-otp", async (req, res) => {
  const parsed = phoneSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Valid phone is required" });
    return;
  }

  try {
    res.json(await services.auth.requestOtp(parsed.data.phone));
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : "OTP service unavailable"
    });
  }
});

authRouter.post("/verify-otp", async (req, res) => {
  const parsed = phoneSchema
    .extend({
      otp: z.string().length(4)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Valid phone and OTP are required" });
    return;
  }

  const session = await services.auth.verifyOtp(parsed.data.phone, parsed.data.otp);

  if (!session) {
    res.status(401).json({ error: "Invalid OTP" });
    return;
  }

  res.json(session);
});

authRouter.post("/refresh", async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Refresh token is required" });
    return;
  }

  const tokens = await services.tokens.refreshTokenPair(parsed.data.refreshToken);

  if (!tokens) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }

  res.json(tokens);
});

authRouter.post("/logout", async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);

  if (parsed.success) {
    await services.tokens.revokeRefreshToken(parsed.data.refreshToken);
  }

  res.status(204).send();
});
