import { prisma } from "../db/prisma.js";
import type { Product, Shop } from "../domain/models.js";
import type {
  CatalogRepository,
  ProductFilters,
  ProductInput,
  ShopInput
} from "./catalogRepository.js";

function mapShop(shop: Awaited<ReturnType<typeof prisma.shop.findFirst>>): Shop | null {
  if (!shop) {
    return null;
  }

  return {
    id: shop.id,
    name: shop.name,
    category: shop.category,
    distanceMeters: shop.radiusMeters,
    etaMinutes: "15-20",
    rating: Number(shop.rating),
    isOpen: shop.isOpen
  };
}

function mapProduct(
  product: Awaited<ReturnType<typeof prisma.product.findFirst>>
): Product | null {
  if (!product) {
    return null;
  }

  return {
    id: product.id,
    storeId: product.shopId,
    name: product.name,
    category: product.category as Product["category"],
    unit: product.unit,
    price: product.price,
    mrp: product.mrp,
    imageUrl: product.imageUrl ?? undefined,
    tag: product.tag ?? "",
    inStock: product.inStock
  };
}

export class PrismaCatalogRepository implements CatalogRepository {
  async listShops(limit: number) {
    const rows = await prisma.shop.findMany({
      orderBy: [{ isOpen: "desc" }, { rating: "desc" }],
      take: limit
    });

    return rows.map((row) => mapShop(row)).filter((shop): shop is Shop => Boolean(shop));
  }

  async getShop(shopId: string) {
    return mapShop(
      await prisma.shop.findUnique({
        where: { id: shopId }
      })
    );
  }

  async getShopByOwnerPhone(phone: string) {
    return mapShop(
      await prisma.shop.findFirst({
        where: {
          owner: {
            phone
          }
        }
      })
    );
  }

  async listProducts(filters: ProductFilters = {}) {
    const rows = await prisma.product.findMany({
      where: {
        shopId: filters.shopId,
        category:
          filters.category && filters.category !== "All" ? filters.category : undefined,
        name: filters.query
          ? {
              contains: filters.query,
              mode: "insensitive"
            }
          : undefined
      },
      orderBy: { name: "asc" }
    });

    return rows
      .map((row) => mapProduct(row))
      .filter((product): product is Product => Boolean(product));
  }

  async getProductsByIds(productIds: string[]) {
    const rows = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    return rows
      .map((row) => mapProduct(row))
      .filter((product): product is Product => Boolean(product));
  }

  async upsertShop(input: ShopInput) {
    const id =
      input.id ??
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const shop = await prisma.shop.upsert({
      where: { id },
      update: {
        category: input.category,
        name: input.name,
        owner: {
          connectOrCreate: {
            where: { phone: input.ownerPhone },
            create: {
              keycloakSubject: `vendor-${input.ownerPhone}`,
              phone: input.ownerPhone,
              role: "VENDOR"
            }
          }
        }
      },
      create: {
        id,
        category: input.category,
        name: input.name,
        owner: {
          connectOrCreate: {
            where: { phone: input.ownerPhone },
            create: {
              keycloakSubject: `vendor-${input.ownerPhone}`,
              phone: input.ownerPhone,
              role: "VENDOR"
            }
          }
        }
      }
    });

    return mapShop(shop) as Shop;
  }

  async upsertProduct(input: ProductInput) {
    const id =
      input.id ??
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const product = await prisma.product.upsert({
      where: { id },
      update: {
        shopId: input.storeId,
        name: input.name,
        category: input.category,
        unit: input.unit,
        price: input.price,
        mrp: input.mrp,
        imageUrl: input.imageUrl,
        tag: input.tag,
        inStock: input.inStock
      },
      create: {
        id,
        shopId: input.storeId,
        name: input.name,
        category: input.category,
        unit: input.unit,
        price: input.price,
        mrp: input.mrp,
        imageUrl: input.imageUrl,
        tag: input.tag,
        inStock: input.inStock
      }
    });

    return mapProduct(product) as Product;
  }
}
