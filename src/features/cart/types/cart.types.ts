export interface CartItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discountAmount?: number;
  quantity: number;
  purchaseType?: "books" | "prebooking";
  coverImageUrl?: string | null;
  authorName?: string;
  publisherName?: string;
  categoryName?: string;
}

export interface CartContextType {
  items: CartItem[];
  wishlistItems: CartItem[];

  addItem: (item: CartItem) => void;
  toggleWishlist: (item: CartItem) => void;
  removeWishlistItem: (id: string) => void;
  isWishlisted: (id: string) => boolean;

  removeItem: (id: string) => void;

  updateQuantity: (
    id: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  totalItems: number;

  totalPrice: number;
}