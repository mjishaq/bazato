import type { Product } from "../data/catalog";

export type CartQuantities = Record<string, number>;

export type CartLine = {
  product: Product;
  quantity: number;
};

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "rejected"
  | "cancelled";

export type Order = {
  id: string;
  lines: CartLine[];
  shopId?: string;
  shopName?: string;
  total: number;
  status: OrderStatus;
  deliveryAddress?: string;
  placedAt: string;
  timeline?: Array<{
    status: OrderStatus;
    at: string;
  }>;
};
