export type ProductCategory = "Fruits" | "Dairy" | "Bakery" | "Snacks";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  price: number;
  mrp: number;
  imageUrl?: string;
  tag: string;
  storeId: string;
};

export type Store = {
  id: string;
  name: string;
  category: string;
  distance: string;
  eta: string;
  rating: string;
  isOpen: boolean;
};

export const stores: Store[] = [
  {
    id: "fresh-mart",
    name: "Fresh Mart",
    category: "Groceries",
    distance: "82m",
    eta: "15-20 min",
    rating: "4.7",
    isOpen: true
  }
];

export const products: Product[] = [
  {
    id: "apple",
    name: "Apple",
    category: "Fruits",
    unit: "1 piece",
    price: 50,
    mrp: 62,
    tag: "Fresh pick",
    storeId: "fresh-mart"
  },
  {
    id: "banana",
    name: "Banana",
    category: "Fruits",
    unit: "6 pieces",
    price: 40,
    mrp: 52,
    tag: "Best seller",
    storeId: "fresh-mart"
  },
  {
    id: "milk",
    name: "Milk",
    category: "Dairy",
    unit: "500 ml pouch",
    price: 32,
    mrp: 36,
    tag: "Morning need",
    storeId: "fresh-mart"
  },
  {
    id: "bread",
    name: "Bread",
    category: "Bakery",
    unit: "400 g loaf",
    price: 45,
    mrp: 50,
    tag: "Soft loaf",
    storeId: "fresh-mart"
  },
  {
    id: "eggs",
    name: "Eggs",
    category: "Dairy",
    unit: "6 pieces",
    price: 72,
    mrp: 84,
    tag: "Protein",
    storeId: "fresh-mart"
  },
  {
    id: "biscuits",
    name: "Biscuits",
    category: "Snacks",
    unit: "Family pack",
    price: 35,
    mrp: 45,
    tag: "Tea time",
    storeId: "fresh-mart"
  },
  {
    id: "chips",
    name: "Potato Chips",
    category: "Snacks",
    unit: "90 g",
    price: 30,
    mrp: 35,
    tag: "Crunchy",
    storeId: "fresh-mart"
  },
  {
    id: "curd",
    name: "Curd",
    category: "Dairy",
    unit: "400 g cup",
    price: 48,
    mrp: 55,
    tag: "Fresh dairy",
    storeId: "fresh-mart"
  }
];

export const categories: Array<ProductCategory | "All"> = [
  "All",
  "Fruits",
  "Dairy",
  "Bakery",
  "Snacks"
];
