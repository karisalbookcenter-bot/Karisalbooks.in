export interface CartItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  purchaseType?: "books" | "prebooking";
  coverImageUrl?: string | null;
}

export interface CartContextType {
  items: CartItem[];

  addItem: (item: CartItem) => void;

  removeItem: (id: string) => void;

  updateQuantity: (
    id: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  totalItems: number;

  totalPrice: number;
}