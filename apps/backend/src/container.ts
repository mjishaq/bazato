import { env } from "./config/env.js";
import type {
  CatalogRepository,
  ProductFilters
} from "./repositories/catalogRepository.js";
import { MemoryCatalogRepository } from "./repositories/catalogRepository.js";
import type { CustomerRepository } from "./repositories/customerRepository.js";
import { MemoryCustomerRepository } from "./repositories/customerRepository.js";
import type { OrderRepository } from "./repositories/orderRepository.js";
import { MemoryOrderRepository } from "./repositories/orderRepository.js";
import { AuthService } from "./services/authService.js";
import { CatalogService } from "./services/catalogService.js";
import { MockOtpService, SmsOtpService } from "./services/otpService.js";
import { OrderService } from "./services/orderService.js";

class LazyPrismaCatalogRepository implements CatalogRepository {
  private repository: Promise<CatalogRepository> | null = null;

  private async getRepository() {
    this.repository ??= import("./repositories/prismaCatalogRepository.js").then(
      ({ PrismaCatalogRepository }) => new PrismaCatalogRepository()
    );

    return this.repository;
  }

  async listShops(limit: number) {
    return (await this.getRepository()).listShops(limit);
  }

  async getShop(shopId: string) {
    return (await this.getRepository()).getShop(shopId);
  }

  async getShopByOwnerPhone(
    ...args: Parameters<CatalogRepository["getShopByOwnerPhone"]>
  ) {
    return (await this.getRepository()).getShopByOwnerPhone(...args);
  }

  async listProducts(filters?: ProductFilters) {
    return (await this.getRepository()).listProducts(filters);
  }

  async getProductsByIds(productIds: string[]) {
    return (await this.getRepository()).getProductsByIds(productIds);
  }

  async upsertProduct(...args: Parameters<CatalogRepository["upsertProduct"]>) {
    return (await this.getRepository()).upsertProduct(...args);
  }

  async upsertShop(...args: Parameters<CatalogRepository["upsertShop"]>) {
    return (await this.getRepository()).upsertShop(...args);
  }
}

class LazyPrismaOrderRepository implements OrderRepository {
  private repository: Promise<OrderRepository> | null = null;

  private async getRepository() {
    this.repository ??= import("./repositories/prismaOrderRepository.js").then(
      ({ PrismaOrderRepository }) => new PrismaOrderRepository()
    );

    return this.repository;
  }

  async createOrder(...args: Parameters<OrderRepository["createOrder"]>) {
    return (await this.getRepository()).createOrder(...args);
  }

  async getOrder(...args: Parameters<OrderRepository["getOrder"]>) {
    return (await this.getRepository()).getOrder(...args);
  }

  async listOrdersByUser(...args: Parameters<OrderRepository["listOrdersByUser"]>) {
    return (await this.getRepository()).listOrdersByUser(...args);
  }

  async listOrdersByShop(...args: Parameters<OrderRepository["listOrdersByShop"]>) {
    return (await this.getRepository()).listOrdersByShop(...args);
  }

  async updateStatus(...args: Parameters<OrderRepository["updateStatus"]>) {
    return (await this.getRepository()).updateStatus(...args);
  }
}

class LazyPrismaCustomerRepository implements CustomerRepository {
  private repository: Promise<CustomerRepository> | null = null;

  private async getRepository() {
    this.repository ??= import("./repositories/prismaCustomerRepository.js").then(
      ({ PrismaCustomerRepository }) => new PrismaCustomerRepository()
    );

    return this.repository;
  }

  async getCustomerByPhone(
    ...args: Parameters<CustomerRepository["getCustomerByPhone"]>
  ) {
    return (await this.getRepository()).getCustomerByPhone(...args);
  }

  async upsertCustomer(...args: Parameters<CustomerRepository["upsertCustomer"]>) {
    return (await this.getRepository()).upsertCustomer(...args);
  }
}

const catalogRepository =
  env.DATA_SOURCE === "postgres"
    ? new LazyPrismaCatalogRepository()
    : new MemoryCatalogRepository();

const orderRepository =
  env.DATA_SOURCE === "postgres"
    ? new LazyPrismaOrderRepository()
    : new MemoryOrderRepository();

const customerRepository =
  env.DATA_SOURCE === "postgres"
    ? new LazyPrismaCustomerRepository()
    : new MemoryCustomerRepository();

const otpService = env.OTP_PROVIDER === "sms" ? new SmsOtpService() : new MockOtpService();

export const services = {
  auth: new AuthService(otpService, customerRepository),
  catalog: new CatalogService(catalogRepository),
  orders: new OrderService(catalogRepository, orderRepository)
};
