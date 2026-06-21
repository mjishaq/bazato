const keycloakIssuer =
  process.env.EXPO_PUBLIC_KEYCLOAK_ISSUER ??
  "http://localhost:8080/realms/bazzato";

const normalizedAuthProvider =
  process.env.EXPO_PUBLIC_AUTH_PROVIDER?.trim().toLowerCase() ?? "mock-otp";

export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? "Bazzato",
  authProvider: normalizedAuthProvider,
  defaultShopId: process.env.EXPO_PUBLIC_DEFAULT_SHOP_ID ?? "fresh-mart",
  keycloakClientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID ?? "bazzato-mobile",
  keycloakIssuer,
  keycloakIssuerUsesLocalhost:
    /(^|\/\/)(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(keycloakIssuer),
  allowLocalKeycloak:
    process.env.EXPO_PUBLIC_ALLOW_LOCAL_KEYCLOAK?.trim().toLowerCase() === "true"
};
