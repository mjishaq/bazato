import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATA_SOURCE: z.enum(["memory", "postgres"]).default("memory"),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default("development-only-secret"),
  KEYCLOAK_ISSUER: z.string().url().optional(),
  KEYCLOAK_JWKS_URL: z.string().url().optional(),
  KEYCLOAK_AUDIENCE: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  OTP_PROVIDER: z.enum(["mock", "sms"]).default("mock"),
  SMS_PROVIDER: z.enum(["console", "http"]).default("console"),
  SMS_PROVIDER_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional()
  ),
  MOCK_OTP_CODE: z.string().regex(/^\d{4,8}$/).default("1234"),
  ORDER_ID_PREFIX: z.string().min(1).default("BZ"),
  DEFAULT_SHOP_ID: z.string().min(1).default("fresh-mart"),
  DEFAULT_DELIVERY_FEE: z.coerce.number().int().nonnegative().default(20),
  ADMIN_PHONE: z.string().optional(),
  SMS_PROVIDER_API_KEY: z.string().optional(),
  PUSH_PROVIDER_API_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);

if (env.NODE_ENV === "production" && env.JWT_SECRET === "development-only-secret") {
  throw new Error("JWT_SECRET must be set to a strong value in production.");
}

if (env.NODE_ENV === "production" && env.DATA_SOURCE !== "postgres") {
  throw new Error("DATA_SOURCE=postgres must be set in production.");
}

if (env.NODE_ENV === "production" && !env.CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN must be explicitly set in production.");
}
