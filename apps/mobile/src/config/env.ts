export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? "Bazzato",
  authProvider: process.env.EXPO_PUBLIC_AUTH_PROVIDER ?? "mock-otp",
  defaultShopId: process.env.EXPO_PUBLIC_DEFAULT_SHOP_ID ?? "fresh-mart",
  keycloakClientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID ?? "bazzato-mobile",
  keycloakIssuer:
    process.env.EXPO_PUBLIC_KEYCLOAK_ISSUER ??
    "http://localhost:8080/realms/bazzato"
};
