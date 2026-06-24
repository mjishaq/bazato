import { products as defaultProducts, type Product } from "../data/catalog";
import type { CartLine, CartQuantities } from "../types/cart";

export function getCartLines(
  cart: CartQuantities,
  products: Product[] = defaultProducts
): CartLine[] {
  return products
    .map((product) => ({
      product,
      quantity: cart[product.id] ?? 0
    }))
    .filter((line) => line.quantity > 0);
}

export function getCartSummary(
  cart: CartQuantities,
  products: Product[] = defaultProducts
) {
  const lines = getCartLines(cart, products);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  );
  const mrpTotal = lines.reduce(
    (sum, line) => sum + line.product.mrp * line.quantity,
    0
  );
  const deliveryFee = 0;

  return {
    lines,
    itemCount,
    subtotal,
    savings: Math.max(mrpTotal - subtotal, 0),
    deliveryFee,
    total: subtotal + deliveryFee
  };
}

export function formatMoney(value: number) {
  return `Rs ${value}`;
}
