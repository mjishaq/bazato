import { Router } from "express";
import { z } from "zod";

import { services } from "../container.js";

export const authRouter = Router();

const phoneSchema = z.object({
  phone: z.string().min(10)
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
    res.status(503).json({
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
