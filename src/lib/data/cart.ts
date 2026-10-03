import { CartItem } from "@/types/commerce";

// Simple in-memory fallback / cookie-friendly helper
export async function getCart(): Promise<{ items: CartItem[]; subtotal: number; discount: number; total: number }> {
  // Return empty initial cart
  return {
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
  };
}
