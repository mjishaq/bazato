import { products, shops } from "../data/mockData.js";
import type { Product, Shop } from "../domain/models.js";

export type ProductFilters = {
  category?: string;
  query?: string;
  shopId?: string;
};

export type ProductInput = {
  id?: string;
  storeId: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  mrp: number;
  imageUrl?: string;
  tag?: string;
  inStock: boolean;
};

export type ShopFilters = {
  latitude?: number;
  longitude?: number;
  limit: number;
  radiusMeters?: number;
};

export type ShopInput = {
  id?: string;
  name: string;
  category: string;
  latitude?: number;
  longitude?: number;
  ownerPhone: string;
  radiusMeters?: number;
};

export interface CatalogRepository {
  listShops(filters: ShopFilters): Promise<Shop[]>;
  getShop(shopId: string): Promise<Shop | null>;
  getShopByOwnerPhone(phone: string): Promise<Shop | null>;
  listProducts(filters?: ProductFilters): Promise<Product[]>;
  getProductsByIds(productIds: string[]): Promise<Product[]>;
  upsertShop(input: ShopInput): Promise<Shop>;
  upsertProduct(input: ProductInput): Promise<Product>;
}

export class MemoryCatalogRepository implements CatalogRepository {
  private readonly shopOwnerPhones = new Map<string, string>();

  async listShops({ limit }: ShopFilters) {
    return shops
      .slice()
      .filter((shop) => shop.isOpen)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, limit);
  }

  async getShop(shopId: string) {
    return shops.find((shop) => shop.id === shopId) ?? null;
  }

  async getShopByOwnerPhone(phone: string) {
    const shopId = Array.from(this.shopOwnerPhones.entries()).find(
      ([, ownerPhone]) => ownerPhone === phone
    )?.[0];

    if (!shopId) {
      return null;
    }

    return this.getShop(shopId);
  }

  async listProducts(filters: ProductFilters = {}) {
    const query = filters.query?.toLowerCase() ?? "";
    const category = filters.category ?? "All";

    return products.filter((product) => {
      const shop = shops.find((item) => item.id === product.storeId);
      const matchesShop = !filters.shopId || product.storeId === filters.shopId;
      const matchesOpenShop = shop?.isOpen ?? false;
      const matchesCategory = category === "All" || product.category === category;
      const matchesQuery = product.name.toLowerCase().includes(query);

      return matchesShop && matchesOpenShop && matchesCategory && matchesQuery;
    });
  }

  async getProductsByIds(productIds: string[]) {
    const productIdSet = new Set(productIds);
    return products.filter((product) => {
      const shop = shops.find((item) => item.id === product.storeId);

      return productIdSet.has(product.id) && Boolean(shop?.isOpen);
    });
  }

  async upsertShop(input: ShopInput) {
    const id =
      input.id ??
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const shop = {
      id,
      name: input.name,
      category: input.category,
      distanceMeters: 100,
      etaMinutes: "15-20",
      rating: 4.5,
      isOpen: true
    };
    const existingIndex = shops.findIndex((item) => item.id === id);

    if (existingIndex >= 0) {
      shops[existingIndex] = shop;
    } else {
      shops.push(shop);
    }

    this.shopOwnerPhones.set(id, input.ownerPhone);

    return shop;
  }

  async upsertProduct(input: ProductInput) {
    const id =
      input.id ??
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const product = {
      id,
      storeId: input.storeId,
      name: input.name,
      category: input.category as Product["category"],
      unit: input.unit,
      price: input.price,
      mrp: input.mrp,
      imageUrl: input.imageUrl,
      tag: input.tag ?? "",
      inStock: input.inStock
    };
    const existingIndex = products.findIndex((item) => item.id === id);

    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }

    return product;
  }
}
