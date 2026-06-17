import type {
  CatalogRepository,
  ProductFilters,
  ProductInput,
  ShopInput
} from "../repositories/catalogRepository.js";

export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  listShops(limit: number) {
    return this.catalogRepository.listShops(limit);
  }

  getShop(shopId: string) {
    return this.catalogRepository.getShop(shopId);
  }

  getShopByOwnerPhone(phone: string) {
    return this.catalogRepository.getShopByOwnerPhone(phone);
  }

  listProducts(filters: ProductFilters = {}) {
    return this.catalogRepository.listProducts(filters);
  }

  upsertProduct(input: ProductInput) {
    return this.catalogRepository.upsertProduct(input);
  }

  upsertShop(input: ShopInput) {
    return this.catalogRepository.upsertShop(input);
  }
}
