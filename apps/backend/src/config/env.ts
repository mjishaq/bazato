import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const isRailwayDeployment = Boolean(
  process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_ENVIRONMENT_NAME ||
    process.env.RAILWAY_PROJECT_ID ||
    process.env.RAILWAY_SERVICE_ID
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATA_SOURCE: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["memory", "postgres"]).default(process.env.DATABASE_URL ? "postgres" : "memory")
  ),
  DATABASE_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().optional()
  ),
  JWT_SECRET: z.string().default("development-only-secret"),
  CORS_ORIGIN: z.string().optional(),
  OTP_PROVIDER: z.enum(["mock", "sms"]).default("mock"),
  SMS_PROVIDER: z.enum(["console", "http"]).default("console"),
  SMS_PROVIDER_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional()
  ),
  MOCK_OTP_CODE: z.string().regex(/^\d{4,8}$/).default("1234"),
  GLOBAL_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(3000),
  AUTH_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(60),
  CATALOG_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(5000),
  ORDER_ID_PREFIX: z.string().min(1).default("BZ"),
  DEFAULT_SHOP_ID: z.string().min(1).default("fresh-mart"),
  DEFAULT_DELIVERY_FEE: z.coerce.number().int().nonnegative().default(0),
  ADMIN_PHONE: z.string().optional(),
  SMS_PROVIDER_API_KEY: z.string().optional(),
  PUSH_PROVIDER_API_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);

const isHardenedEnvironment = env.NODE_ENV === "production" || isRailwayDeployment;

if (isHardenedEnvironment && env.JWT_SECRET === "development-only-secret") {
  throw new Error("JWT_SECRET must be set to a strong value in production.");
}

if (isHardenedEnvironment && env.DATA_SOURCE !== "postgres") {
  throw new Error("DATA_SOURCE=postgres must be set for deployed environments.");
}

if (isHardenedEnvironment && !env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set for deployed environments.");
}

if (isHardenedEnvironment && !env.CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN must be explicitly set in production.");
}
