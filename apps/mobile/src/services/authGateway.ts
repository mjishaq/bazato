import type { AuthUser } from "../api/auth";
import { requestOtp, verifyOtp } from "../api/auth";

export type AuthSession = {
  phone: string;
  token: string;
  user: AuthUser;
};

export interface PhoneAuthGateway {
  readonly provider: "mock-otp";
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
