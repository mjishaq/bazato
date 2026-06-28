import { prisma } from "../db/prisma.js";
import type {
  CustomerProfileInput,
  CustomerRepository
} from "./customerRepository.js";

export class PrismaCustomerRepository implements CustomerRepository {
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

    return {
      id: user.authSubject,
      address: user.address ?? input.address,
      email: user.email ?? input.email,
      latitude: user.latitude !== null ? Number(user.latitude) : undefined,
      longitude: user.longitude !== null ? Number(user.longitude) : undefined,
      name: user.name ?? input.name,
      phone: user.phone,
      preference: user.preference ?? input.preference
    };
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
}
