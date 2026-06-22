import { env } from "../config/env.js";
import type { AuthUser } from "../domain/models.js";
import type {
  CustomerProfileInput,
  CustomerRepository
} from "../repositories/customerRepository.js";
import type { OtpService } from "./otpService.js";

export class AuthService {
  constructor(
    private readonly otpService: OtpService,
    private readonly customerRepository: CustomerRepository
  ) {}

  async registerCustomer(input: CustomerProfileInput) {
    return this.customerRepository.upsertCustomer(input);
  }

  async requestOtp(phone: string) {
    const customer = await this.customerRepository.getCustomerByPhone(phone);

    if (!customer) {
      throw new Error("Please create your profile before login.");
    }

    const result = await this.otpService.requestOtp(phone);

    return {
      phone,
      ...result
    };
  }

  async verifyOtp(phone: string, otp: string) {
    const customer = await this.customerRepository.getCustomerByPhone(phone);

    if (!customer) {
      return null;
    }

    const isValid = await this.otpService.verifyOtp(phone, otp);

    if (!isValid) {
      return null;
    }

    const user: AuthUser = {
      id: customer.id,
      phone,
      role: "customer"
    };

    return {
      token: env.NODE_ENV === "production" ? "" : `mock-customer-${phone}`,
      user
    };
  }
}
