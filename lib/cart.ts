import type { Product } from './supabaseClient';

export type CartItem = Product & { quantity: number };

const CART_KEY = 'nayak_sambalpuri_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(product: Product) {
  const items = getCart();
  const existing = items.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else items.push({ ...product, quantity: 1 });
  saveCart(items);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
}
