import { apiRequest } from "./client";

export type AuthUser = {
  id: string;
  phone: string;
  role: "customer";
};

export async function requestOtp(phone: string) {
  return apiRequest<{ phone: string; otp: string; message: string }>(
    "/auth/request-otp",
    {
      method: "POST",
      body: { phone }
    }
  );
}

export async function verifyOtp(phone: string, otp: string) {
  return apiRequest<{ token: string; user: AuthUser }>("/auth/verify-otp", {
    method: "POST",
    body: { phone, otp }
  });
}
