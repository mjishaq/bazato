import { env } from "../config/env.js";
import { otpCodes } from "../data/mockData.js";

export interface OtpService {
  requestOtp(phone: string): Promise<{ otp?: string; message: string }>;
  verifyOtp(phone: string, otp: string): Promise<boolean>;
}

export class MockOtpService implements OtpService {
  async requestOtp(phone: string) {
    otpCodes.set(phone, env.MOCK_OTP_CODE);

    return {
      otp: env.MOCK_OTP_CODE,
      message: "OTP generated in mock mode"
    };
  }

  async verifyOtp(phone: string, otp: string) {
    const expected = otpCodes.get(phone) ?? env.MOCK_OTP_CODE;
    return otp === expected;
  }
}

export class SmsOtpService implements OtpService {
  async requestOtp(phone: string): Promise<{ message: string }> {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpCodes.set(phone, otp);

    if (env.SMS_PROVIDER === "console") {
      console.log(`[sms:console] OTP for ${phone}: ${otp}`);
      return {
        message: "OTP sent using console SMS provider"
      };
    }

    if (!env.SMS_PROVIDER_URL || !env.SMS_PROVIDER_API_KEY) {
      throw new Error("HTTP SMS provider URL/API key is not configured");
    }

    const response = await fetch(env.SMS_PROVIDER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SMS_PROVIDER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Your Bazzato OTP is ${otp}`,
        phone
      })
    });

    if (!response.ok) {
      throw new Error("SMS provider rejected the OTP request");
    }

    return {
      message: "OTP sent using HTTP SMS provider"
    };
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    return otpCodes.get(phone) === otp;
  }
}
