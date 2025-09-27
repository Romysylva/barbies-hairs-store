import { useContext } from "react";

import { ProductContext } from "../contexts/ProductContext";

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within the ProductProvider");
  }
  return context;
}
// const { state, dispatch } = context;
// return {
//   products: state.products,
//   dispatch,
// };
