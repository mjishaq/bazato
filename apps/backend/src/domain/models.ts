export type UserRole = "customer" | "vendor" | "admin";

export type ProductCategory = "Fruits" | "Dairy" | "Bakery" | "Snacks";

export type Product = {
  id: string;
  storeId: string;
  name: string;
  category: ProductCategory;
  unit: string;
  price: number;
  mrp: number;
  imageUrl?: string;
  tag: string;
  inStock: boolean;
};

export type Shop = {
  id: string;
  name: string;
  category: string;
  distanceMeters: number;
  etaMinutes: string;
  rating: number;
  isOpen: boolean;
  latitude?: number;
  longitude?: number;
  ownerPhone?: string;
};

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "rejected"
  | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  phone: string;
  userId: string;
  shopId: string;
  shopName?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "cod";
  status: OrderStatus;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  note?: string;
  createdAt: string;
  timeline: Array<{
    status: OrderStatus;
    at: string;
  }>;
};

export type AuthUser = {
  id: string;
  phone: string;
  role: UserRole;
};
