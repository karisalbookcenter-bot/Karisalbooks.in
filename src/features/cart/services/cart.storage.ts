import type { CartItem } from "../types/cart.types";

const CART_KEY = "karisal_cart";


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