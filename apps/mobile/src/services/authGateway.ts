import type { AuthUser } from "../api/auth";
import { requestOtp, verifyOtp } from "../api/auth";
import { env } from "../config/env";

export type AuthSession = {
  phone: string;
  token: string;
  user: AuthUser;
};

export interface PhoneAuthGateway {
  readonly provider: "keycloak" | "mock-otp";
  requestOtp(phone: string): Promise<{ otp?: string; message: string }>;
  verifyOtp(phone: string, otp: string): Promise<AuthSession>;
}

export class ApiPhoneAuthGateway implements PhoneAuthGateway {
  readonly provider = "mock-otp" as const;

  async requestOtp(phone: string) {
    return requestOtp(phone);
  }

  async verifyOtp(phone: string, otp: string) {
    const session = await verifyOtp(phone, otp);

    return {
      phone,
      ...session
    };
  }
}

export const phoneAuthGateway = new ApiPhoneAuthGateway();

export function isKeycloakAuthEnabled() {
  return (
    env.authProvider === "keycloak" &&
    (!env.keycloakIssuerUsesLocalhost || env.allowLocalKeycloak)
  );
}

export function getKeycloakConfigurationWarning() {
  if (env.authProvider !== "keycloak") {
    return "";
  }

  if (env.keycloakIssuerUsesLocalhost && !env.allowLocalKeycloak) {
    return "Keycloak is configured with localhost. For Expo Go on a phone, use your laptop LAN IP or switch to mock OTP.";
  }

  return "";
}
