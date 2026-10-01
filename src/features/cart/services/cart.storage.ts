import type { CartItem } from "../types/cart.types";

const CART_KEY = "karisal_cart";
const WISHLIST_KEY = "karisal_wishlist";


export function getCart(): CartItem[] {

  if (typeof window === "undefined") {
    return [];
  }

  const data = localStorage.getItem(CART_KEY);

  if (!data) return [];

  return JSON.parse(data);
}


export function saveCart(items: CartItem[]) {

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(items)
  );

}


export function clearStoredCart(){

  localStorage.removeItem(CART_KEY);

}

export function getWishlist(): CartItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(WISHLIST_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as CartItem[];
  } catch {
    return [];
  }
}

export function saveWishlist(items: CartItem[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}