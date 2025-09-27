import { useContext } from "react";
import { CartContext } from "../config/CartContext";

export function useCart() {
  const conetxt = useContext(CartContext);
  if (!conetxt) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return conetxt;
}
