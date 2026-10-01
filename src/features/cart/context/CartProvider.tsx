"use client";

import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  CartContextType,
  CartItem,
} from "../types/cart.types";

import {
  getCart,
  saveCart,
  clearStoredCart,
  getWishlist,
  saveWishlist,
} from "../services/cart.storage";


export const CartContext =
  createContext<CartContextType | null>(null);



export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);


  // Load cart when website opens
  useEffect(() => {

    setItems(getCart());
    setWishlistItems(getWishlist());
    setIsHydrated(true);

  }, []);



  // Save whenever cart changes
  useEffect(() => {
    if (isHydrated) saveCart(items);
  }, [items, isHydrated]);

  useEffect(() => {
    if (isHydrated) saveWishlist(wishlistItems);
  }, [wishlistItems, isHydrated]);



  function addItem(item: CartItem) {

    setItems((current) => {

      const existing =
        current.find(
          (x) => x.id === item.id
        );


      if (existing) {

        return current.map((x) =>
          x.id === item.id
            ? {
                ...x,
                quantity:
                  x.quantity + item.quantity,
              }
            : x
        );

      }


      return [
        ...current,
        item,
      ];

    });

  }

  function toggleWishlist(item: CartItem) {
    setWishlistItems((current) => current.some((saved) => saved.id === item.id)
      ? current.filter((saved) => saved.id !== item.id)
      : [...current, { ...item, quantity: 1 }]);
  }

  function removeWishlistItem(id: string) {
    setWishlistItems((current) => current.filter((item) => item.id !== id));
  }

  function isWishlisted(id: string) {
    return wishlistItems.some((item) => item.id === id);
  }



  function removeItem(id:string){

    setItems((current)=>
      current.filter(
        (x)=>x.id !== id
      )
    );

  }



  function updateQuantity(
    id:string,
    quantity:number
  ){

    if(quantity <= 0){

      removeItem(id);
      return;

    }


    setItems((current)=>
      current.map((x)=>
        x.id === id
        ? {...x, quantity}
        : x
      )
    );

  }



  function clearCart(){

    setItems([]);

    clearStoredCart();

  }



  const totalItems =
    items.reduce(
      (sum,item)=>
        sum + item.quantity,
      0
    );


  const totalPrice =
    items.reduce(
      (sum,item)=>
        sum + item.price * item.quantity,
      0
    );



  return (

    <CartContext.Provider
      value={{
        items,
        wishlistItems,
        addItem,
        toggleWishlist,
        removeWishlistItem,
        isWishlisted,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >

      {children}

    </CartContext.Provider>

  );

}