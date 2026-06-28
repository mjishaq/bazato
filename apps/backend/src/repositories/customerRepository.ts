export type CustomerProfileInput = {
  address: string;
  email: string;
  name: string;
  phone: string;
  preference: string;
};

export type CustomerProfile = CustomerProfileInput & {
  id: string;
  latitude?: number;
  longitude?: number;
};

export interface CustomerRepository {
  getCustomerByPhone(phone: string): Promise<CustomerProfile | null>;
  updateCustomerLocation(
    userId: string,
    location: { latitude: number; longitude: number }
  ): Promise<CustomerProfile | null>;
  upsertCustomer(input: CustomerProfileInput): Promise<CustomerProfile>;
}

const memoryCustomers = new Map<string, CustomerProfile>();

export class MemoryCustomerRepository implements CustomerRepository {
  async getCustomerByPhone(phone: string) {
    return memoryCustomers.get(phone) ?? null;
  }

  async upsertCustomer(input: CustomerProfileInput) {
    const customer = {
      ...input,
      id: `customer-${input.phone}`
    };

    memoryCustomers.set(input.phone, customer);

    return customer;
  }

  async updateCustomerLocation(
    userId: string,
    location: { latitude: number; longitude: number }
  ) {
    const customer = Array.from(memoryCustomers.values()).find(
      (item) => item.id === userId
    );

    if (!customer) {
      return null;
    }

    const nextCustomer = {
      ...customer,
      latitude: location.latitude,
      longitude: location.longitude
    };
    memoryCustomers.set(nextCustomer.phone, nextCustomer);

    return nextCustomer;
  }
}
