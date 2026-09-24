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
} from "../services/cart.storage";


export const CartContext =
  createContext<CartContextType | null>(null);



export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [items, setItems] = useState<CartItem[]>([]);


  // Load cart when website opens
  useEffect(() => {

    setItems(getCart());

  }, []);



  // Save whenever cart changes
  useEffect(() => {

    if (items.length >= 0) {
      saveCart(items);
    }

  }, [items]);



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
        addItem,
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