import { prisma } from "../src/db/prisma.js";
import { products, shops } from "../src/data/mockData.js";

async function main() {
  for (const shop of shops) {
    await prisma.shop.upsert({
      where: { id: shop.id },
      update: {
        name: shop.name,
        category: shop.category,
        radiusMeters: shop.distanceMeters,
        isOpen: shop.isOpen,
        rating: shop.rating
      },
      create: {
        id: shop.id,
        name: shop.name,
        category: shop.category,
        radiusMeters: shop.distanceMeters,
        isOpen: shop.isOpen,
        rating: shop.rating
      }
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        shopId: product.storeId,
        name: product.name,
        category: product.category,
        unit: product.unit,
        price: product.price,
        mrp: product.mrp,
        imageUrl: product.imageUrl,
        tag: product.tag,
        inStock: product.inStock
      },
      create: {
        id: product.id,
        shopId: product.storeId,
        name: product.name,
        category: product.category,
        unit: product.unit,
        price: product.price,
        mrp: product.mrp,
        imageUrl: product.imageUrl,
        tag: product.tag,
        inStock: product.inStock
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
