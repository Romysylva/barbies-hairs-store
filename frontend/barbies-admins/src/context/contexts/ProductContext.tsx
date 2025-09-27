import { createContext, useEffect, useReducer } from "react";
import type { ReactNode } from "react";

import type { Products } from "../types/products";
import axios from "../lib/axios";
import type { AxiosError } from "axios";
type State = {
  products: Products[];
};

type Action =
  | { type: "SET_PRODUCTS"; payload: Products[] }
  | { type: "ADD_PRODUCT"; payload: Products }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "UPDATE_PRODUCT_RATING"; payload: { id: string; rating: number } };

const initialState: State = {
  products: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PRODUCTS":
      // return {
      //   ...state,
      //   products: action.payload.map((p) => ({ ...p, id: p._id })),
      // };
      if (!Array.isArray(action.payload)) {
        console.error("SET_PRODUCTS expects an array but got:", action.payload);
        return state;
      }

      return {
        ...state,
        // products: action.payload,
        products: action.payload.map((p) => ({ ...p, id: p._id })),
      };

    case "ADD_PRODUCT": {
      // const newProduct = { ...action.payload, id: uuidv4() };

      return { ...state, products: [...state.products, action.payload] };
    }
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };
    case "UPDATE_PRODUCT_RATING":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id
            ? { ...p, rating: action.payload.rating }
            : p
        ),
      };

    default:
      return state;
  }
}

const deleteProductById = async (id: string, token: string) => {
  try {
    await axios.delete(`/products/${id}`, {
      headers: {
        Authorization: `Bearer${token}`,
      },
    });
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error("Delete API error:", error.response?.data || error.message);
    throw error;
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const ProductContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  deleteProduct: (id: string, token: string) => Promise<void>;
} | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetcchProducts = async () => {
      try {
        const res = await axios.get("/products");
        console.log("Fetched products:", res.data);
        dispatch({
          type: "SET_PRODUCTS",
          payload: res.data.doc || res.data.data.data,
        });
      } catch (error) {
        console.error("Failed to load products", error);
      }
    };
    fetcchProducts();
  }, []);

  const deleteProduct = async (id: string, token: string) => {
    try {
      await deleteProductById(id, token);
      dispatch({ type: "DELETE_PRODUCT", payload: id });
    } catch (err) {
      console.error("Failed to delete Prodct:", err);
      throw err;
    }
  };
  return (
    <ProductContext.Provider value={{ state, dispatch, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}
