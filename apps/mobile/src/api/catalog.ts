import type { Product, Store } from "../data/catalog";
import { env } from "../config/env";
import { apiRequest } from "./client";

type ApiShop = {
  id: string;
  name: string;
  category: string;
  distanceMeters: number;
  etaMinutes: string;
  rating: number;
  isOpen: boolean;
};

type ApiProduct = Product & {
  inStock: boolean;
};

export async function getNearbyShops() {
  const data = await apiRequest<{ shops: ApiShop[] }>("/catalog/shops");

  return data.shops.map<Store>((shop) => ({
    id: shop.id,
    name: shop.name,
    category: shop.category,
    distance: `${shop.distanceMeters}m`,
    eta: `${shop.etaMinutes} min`,
    rating: shop.rating.toFixed(1),
    isOpen: shop.isOpen
  }));
}

export async function getShopProducts(shopId = env.defaultShopId) {
  const data = await apiRequest<{ products: ApiProduct[] }>(
    `/catalog/shops/${shopId}/products`
  );

  return data.products;
}
