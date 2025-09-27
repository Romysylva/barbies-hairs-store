import { useContext } from "react";

import { OrderContext } from "../context/contexts/OrderContext";

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOder must be used inside the OrderProvider ");
  }
  const {
    state: { orders, error, isLoading },
    dispatch,
  } = context;

  return { orders, error, dispatch, isLoading };
}
