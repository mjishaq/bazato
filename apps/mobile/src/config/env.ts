export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? "Bazzato",
  authProvider: "mock-otp",
  defaultShopId: process.env.EXPO_PUBLIC_DEFAULT_SHOP_ID ?? "fresh-mart"
};
