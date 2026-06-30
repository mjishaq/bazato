import { prisma } from "../db/prisma.js";
import type {
  CustomerProfileInput,
  CustomerRepository
} from "./customerRepository.js";

export class PrismaCustomerRepository implements CustomerRepository {
  private mapCustomer(user: {
    address: string | null;
    authSubject: string;
    email: string | null;
    latitude: unknown;
    longitude: unknown;
    name: string | null;
    phone: string;
    preference: string | null;
  }) {
    return {
      id: user.authSubject,
      address: user.address ?? "",
      email: user.email ?? "",
      latitude: user.latitude !== null ? Number(user.latitude) : undefined,
      longitude: user.longitude !== null ? Number(user.longitude) : undefined,
      name: user.name ?? "",
      phone: user.phone,
      preference: user.preference ?? ""
    };
  }

  async getCustomerByPhone(phone: string) {
    const user = await prisma.user.findFirst({
      where: {
        phone,
        role: "CUSTOMER"
      }
    });

    if (!user) {
      return null;
    }

    return this.mapCustomer(user);
  }

  async listCustomers() {
    const users = await prisma.user.findMany({
      orderBy: [{ name: "asc" }, { phone: "asc" }],
      where: {
        role: "CUSTOMER"
      }
    });

    return users.map((user) => this.mapCustomer(user));
  }

  async upsertCustomer(input: CustomerProfileInput) {
    const user = await prisma.user.upsert({
      where: { phone: input.phone },
      update: {
        address: input.address,
        email: input.email,
        name: input.name,
        preference: input.preference,
        role: "CUSTOMER"
      },
      create: {
        address: input.address,
        email: input.email,
        authSubject: `customer-${input.phone}`,
        name: input.name,
        phone: input.phone,
        preference: input.preference,
        role: "CUSTOMER"
      }
    });

    return this.mapCustomer(user);
  }

  async updateCustomerLocation(
    userId: string,
    location: { latitude: number; longitude: number }
  ) {
    const existingUser = await prisma.user.findFirst({
      where: {
        authSubject: userId,
        role: "CUSTOMER"
      }
    });

    if (!existingUser) {
      return null;
    }

    const user = await prisma.user.update({
      data: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      where: {
        id: existingUser.id
      }
    });

    return this.mapCustomer(user);
  }
}
