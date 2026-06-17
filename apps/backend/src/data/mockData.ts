import type { Order, Product, ProductCategory, Shop } from "../domain/models.js";

export const shops: Shop[] = [
  {
    id: "fresh-mart",
    name: "Fresh Mart",
    category: "Groceries",
    distanceMeters: 82,
    etaMinutes: "15-20",
    rating: 4.7,
    isOpen: true
  },
  {
    id: "daily-dairy",
    name: "Daily Dairy",
    category: "Milk and bread",
    distanceMeters: 96,
    etaMinutes: "10-15",
    rating: 4.5,
    isOpen: true
  },
  {
    id: "snack-point",
    name: "Snack Point",
    category: "Snacks",
    distanceMeters: 110,
    etaMinutes: "20-25",
    rating: 4.3,
    isOpen: false
  }
];

export const products: Product[] = [
  {
    id: "apple",
    storeId: "fresh-mart",
    name: "Apple",
    category: "Fruits",
    unit: "1 piece",
    price: 50,
    mrp: 62,
    tag: "Fresh pick",
    inStock: true
  },
  {
    id: "banana",
    storeId: "fresh-mart",
    name: "Banana",
    category: "Fruits",
    unit: "6 pieces",
    price: 40,
    mrp: 52,
    tag: "Best seller",
    inStock: true
  },
  {
    id: "milk",
    storeId: "fresh-mart",
    name: "Milk",
    category: "Dairy",
    unit: "500 ml pouch",
    price: 32,
    mrp: 36,
    tag: "Morning need",
    inStock: true
  },
  {
    id: "bread",
    storeId: "fresh-mart",
    name: "Bread",
    category: "Bakery",
    unit: "400 g loaf",
    price: 45,
    mrp: 50,
    tag: "Soft loaf",
    inStock: true
  },
  {
    id: "eggs",
    storeId: "fresh-mart",
    name: "Eggs",
    category: "Dairy",
    unit: "6 pieces",
    price: 72,
    mrp: 84,
    tag: "Protein",
    inStock: true
  },
  {
    id: "biscuits",
    storeId: "fresh-mart",
    name: "Biscuits",
    category: "Snacks",
    unit: "Family pack",
    price: 35,
    mrp: 45,
    tag: "Tea time",
    inStock: true
  },
  {
    id: "chips",
    storeId: "fresh-mart",
    name: "Potato Chips",
    category: "Snacks",
    unit: "90 g",
    price: 30,
    mrp: 35,
    tag: "Crunchy",
    inStock: true
  },
  {
    id: "curd",
    storeId: "fresh-mart",
    name: "Curd",
    category: "Dairy",
    unit: "400 g cup",
    price: 48,
    mrp: 55,
    tag: "Fresh dairy",
    inStock: true
  }
];

export const otpCodes = new Map<string, string>();
export const orders = new Map<string, Order>();
