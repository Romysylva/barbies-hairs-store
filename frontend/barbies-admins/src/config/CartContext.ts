import { createContext } from "react";
import type { CartItem } from "../types/CartItem";

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
};

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);
