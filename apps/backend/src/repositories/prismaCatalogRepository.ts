import { prisma } from "../db/prisma.js";
import type { Product, Shop } from "../domain/models.js";
import type {
  CatalogRepository,
  ProductFilters,
  ProductInput,
  ShopFilters,
  ShopInput
} from "./catalogRepository.js";

type PrismaShop = NonNullable<Awaited<ReturnType<typeof prisma.shop.findFirst>>>;

function distanceMetersBetween(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) {
  const earthRadiusMeters = 6371000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const latitude1 = toRadians(from.latitude);
  const latitude2 = toRadians(to.latitude);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function coordinateWindow({
  latitude,
  longitude,
  radiusMeters
}: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}) {
  const metersPerLatitudeDegree = 111320;
  const latitudeDelta = radiusMeters / metersPerLatitudeDegree;
  const longitudeDelta =
    radiusMeters /
    (metersPerLatitudeDegree * Math.max(Math.cos((latitude * Math.PI) / 180), 0.01));

  return {
    latitudeMax: latitude + latitudeDelta,
    latitudeMin: latitude - latitudeDelta,
    longitudeMax: longitude + longitudeDelta,
    longitudeMin: longitude - longitudeDelta
  };
}

function mapShop(shop: PrismaShop | null, distanceMeters?: number): Shop | null {
  if (!shop) {
    return null;
  }

  return {
    id: shop.id,
    name: shop.name,
    category: shop.category,
    distanceMeters: Math.round(distanceMeters ?? shop.radiusMeters),
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
  async listShops(filters: ShopFilters) {
    const hasCustomerLocation =
      typeof filters.latitude === "number" && typeof filters.longitude === "number";
    const maxRadiusMeters = filters.radiusMeters ?? 100;
    const bounds = hasCustomerLocation
      ? coordinateWindow({
          latitude: filters.latitude as number,
          longitude: filters.longitude as number,
          radiusMeters: maxRadiusMeters
        })
      : null;
    const rows = await prisma.shop.findMany({
      where: {
        isOpen: true,
        latitude: bounds
          ? {
              gte: bounds.latitudeMin,
              lte: bounds.latitudeMax
            }
          : undefined,
        longitude: bounds
          ? {
              gte: bounds.longitudeMin,
              lte: bounds.longitudeMax
            }
          : undefined
      },
      orderBy: [{ isOpen: "desc" }, { rating: "desc" }],
      take: hasCustomerLocation ? undefined : filters.limit
    });

    const customerLocation = hasCustomerLocation
      ? { latitude: filters.latitude as number, longitude: filters.longitude as number }
      : null;

    const shopsWithDistance = rows
      .map((row) => {
        const shopLocation =
          row.latitude !== null && row.longitude !== null
            ? {
                latitude: Number(row.latitude),
                longitude: Number(row.longitude)
              }
            : null;
        const distanceMeters =
          customerLocation && shopLocation
            ? distanceMetersBetween(customerLocation, shopLocation)
            : undefined;

        return {
          distanceMeters,
          row
        };
      })
      .filter(({ distanceMeters, row }) => {
        if (!customerLocation) {
          return true;
        }

        return typeof distanceMeters === "number" && distanceMeters <= row.radiusMeters;
      })
      .sort((a, b) => {
        if (typeof a.distanceMeters === "number" && typeof b.distanceMeters === "number") {
          return a.distanceMeters - b.distanceMeters;
        }

        return Number(b.row.rating) - Number(a.row.rating);
      })
      .slice(0, filters.limit);

    return shopsWithDistance
      .map(({ row, distanceMeters }) => mapShop(row, distanceMeters))
      .filter((shop): shop is Shop => Boolean(shop));
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
        shop: {
          isOpen: true
        },
        category:
          filters.category && filters.category !== "All" ? filters.category : undefined,
        inStock: filters.includeOutOfStock ? undefined : true,
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
        },
        inStock: true,
        shop: {
          isOpen: true
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
        latitude: input.latitude,
        longitude: input.longitude,
        name: input.name,
        owner: {
          connectOrCreate: {
            where: { phone: input.ownerPhone },
            create: {
              authSubject: `vendor-${input.ownerPhone}`,
              phone: input.ownerPhone,
              role: "VENDOR"
            }
          }
        },
        radiusMeters: input.radiusMeters ?? 100
      },
      create: {
        id,
        category: input.category,
        latitude: input.latitude,
        longitude: input.longitude,
        name: input.name,
        owner: {
          connectOrCreate: {
            where: { phone: input.ownerPhone },
            create: {
              authSubject: `vendor-${input.ownerPhone}`,
              phone: input.ownerPhone,
              role: "VENDOR"
            }
          }
        },
        radiusMeters: input.radiusMeters ?? 100
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
