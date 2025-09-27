import { useState } from "react";
import type { CartItem } from "../types/CartItem";
import { CartContext } from "../config/CartContext";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const addToCart = (newItem: CartItem) => {
    setCartItems((items) => {
      const existingItems = items.find((item) => item.id === newItem.id);
      if (existingItems) {
        return items.map((item) =>
          item.id === newItem.id
            ? { ...item, quatity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        return [...items, newItem];
      }
    });
  };
  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };
  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };
  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeItem, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};
