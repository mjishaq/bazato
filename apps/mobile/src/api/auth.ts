import { apiRequest } from "./client";

export type AuthUser = {
  id: string;
  phone: string;
  role: "customer";
};

export type AuthTokens = {
  accessToken: string;
  expiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  token: string;
};

export type CustomerRegistration = {
  address: string;
  email: string;
  name: string;
  otp: string;
  phone: string;
  preference: string;
};

export async function registerCustomer(profile: CustomerRegistration) {
  return apiRequest<{ customer: CustomerRegistration & { id: string } }>(
    "/auth/register",
    {
      method: "POST",
      body: profile
    }
  );
}

export async function requestRegistrationOtp(phone: string) {
  return apiRequest<{ phone: string; otp: string; message: string }>(
    "/auth/register/request-otp",
    {
      method: "POST",
      body: { phone }
    }
  );
}

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
  return apiRequest<AuthTokens & { user: AuthUser }>("/auth/verify-otp", {
    method: "POST",
    body: { phone, otp }
  });
}

export async function refreshAuthSession(refreshToken: string) {
  return apiRequest<AuthTokens>("/auth/refresh", {
    method: "POST",
    body: { refreshToken }
  });
}

export async function logoutAuthSession(refreshToken: string) {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    body: { refreshToken }
  });
}

export async function updateCustomerLocation({
  latitude,
  longitude,
  token
}: {
  latitude: number;
  longitude: number;
  token: string;
}) {
  return apiRequest<{ customer: CustomerRegistration & { id: string } }>(
    "/auth/location",
    {
      method: "PATCH",
      token,
      body: { latitude, longitude }
    }
  );
}
