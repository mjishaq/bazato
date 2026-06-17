import { env } from "../config/env.js";
import type { AuthUser } from "../domain/models.js";
import type { OtpService } from "./otpService.js";

export class AuthService {
  constructor(private readonly otpService: OtpService) {}

  async requestOtp(phone: string) {
    const result = await this.otpService.requestOtp(phone);

    return {
      phone,
      ...result
    };
  }

  async verifyOtp(phone: string, otp: string) {
    const isValid = await this.otpService.verifyOtp(phone, otp);

    if (!isValid) {
      return null;
    }

    const user: AuthUser = {
      id: `customer-${phone}`,
      phone,
      role: "customer"
    };

    return {
      token: env.NODE_ENV === "production" ? "" : `mock-customer-${phone}`,
      user
    };
  }
}
