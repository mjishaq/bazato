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
      name: user.name ?? input.name,
      phone: user.phone,
      preference: user.preference ?? input.preference
    };
  }
}
