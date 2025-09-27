import { createContext, useReducer } from "react";
import type { ReactNode } from "react";
import type { Order } from "../types/order";

import { v4 as uuidv4 } from "uuid";

type State = {
  orders: Order[];
  error: string | null;
  isLoading: boolean;
};

type Action =
  | { type: "ADD_ORDER"; payload: Omit<Order, "id"> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: State = {
  orders: [],
  isLoading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "ADD_ORDER": {
      const newOrder = {
        ...action.payload,
        id: uuidv4(),
      };
      return { ...state, orders: [...state.orders, newOrder] };
    }
    default:
      return state;
  }
}

export const OrderContext = createContext<
  | {
      state: State;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
}
