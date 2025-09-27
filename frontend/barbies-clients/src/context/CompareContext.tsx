/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { Product, ProductComparison, ProductAttribute } from "../types";

interface CompareState {
  items: Product[];
  maxItems: number;
  attributes: ProductAttribute[];
  comparisonMatrix: Record<string, Record<string, any>>;
  loading: boolean;
  error: string | null;
}

// interface ProductComparison {
//   products: Product[];
//   attributes: Attribute[];
//   comparison_matrix: ComparisonMatrix; // snake_case version
// }

interface CompareContextType extends CompareState {
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  canAddMore: () => boolean;
  getComparison: () => ProductComparison;
  reorderItems: (fromIndex: number, toIndex: number) => void;
}

type CompareAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_COMPARE" }
  | { type: "REORDER_ITEMS"; payload: { fromIndex: number; toIndex: number } }
  | {
      type: "SET_COMPARISON_DATA";
      payload: {
        attributes: ProductAttribute[];
        matrix: Record<string, Record<string, any>>;
      };
    };

const MAX_COMPARE_ITEMS = 4;

const initialState: CompareState = {
  items: [],
  maxItems: MAX_COMPARE_ITEMS,
  attributes: [],
  comparisonMatrix: {},
  loading: false,
  error: null,
};

const compareReducer = (
  state: CompareState,
  action: CompareAction
): CompareState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "ADD_ITEM": {
      const product = action.payload;

      // Check if already exists
      if (state.items.some((item) => item._id === product._id)) {
        return { ...state, error: "Product is already in comparison" };
      }

      // Check max limit
      if (state.items.length >= MAX_COMPARE_ITEMS) {
        return {
          ...state,
          error: `You can only compare up to ${MAX_COMPARE_ITEMS} products`,
        };
      }

      const newItems = [...state.items, product];

      return {
        ...state,
        items: newItems,
        error: null,
      };
    }

    case "REMOVE_ITEM": {
      const productId = action.payload;
      const newItems = state.items.filter((item) => item._id !== productId);

      return {
        ...state,
        items: newItems,
        error: null,
      };
    }

    case "CLEAR_COMPARE":
      return {
        ...state,
        items: [],
        attributes: [],
        comparisonMatrix: {},
        error: null,
      };

    case "REORDER_ITEMS": {
      const { fromIndex, toIndex } = action.payload;
      const newItems = [...state.items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);

      return {
        ...state,
        items: newItems,
      };
    }

    case "SET_COMPARISON_DATA":
      return {
        ...state,
        attributes: action.payload.attributes,
        comparisonMatrix: action.payload.matrix,
      };

    default:
      return state;
  }
};

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(compareReducer, initialState);

  // Load compare items from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCompare = localStorage.getItem("compareItems");
      if (savedCompare) {
        try {
          const items: Product[] = JSON.parse(savedCompare);
          items.forEach((item) => {
            dispatch({ type: "ADD_ITEM", payload: item });
          });
        } catch (error) {
          console.error(
            "Error loading compare items from localStorage:",
            error
          );
        }
      }
    }
  }, []);

  // Save compare items to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("compareItems", JSON.stringify(state.items));
    }
  }, [state.items]);

  // Generate comparison data when items change
  useEffect(() => {
    if (state.items.length > 1) {
      generateComparisonData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.items]);

  const generateComparisonData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Extract common attributes from all products
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const allAttributes = new Map<string, ProductAttribute>();
      const matrix: Record<string, Record<string, any>> = {};

      // Basic comparison attributes
      const basicAttributes = [
        { name: "Price", key: "price", type: "currency" },
        { name: "Rating", key: "ratingsAverage", type: "rating" },
        { name: "Reviews", key: "ratingsQuantity", type: "number" },
        { name: "Category", key: "category.name", type: "text" },
        { name: "Stock", key: "quantity", type: "number" },
        { name: "Sold", key: "sold", type: "number" },
      ];

      // Add basic attributes to matrix
      basicAttributes.forEach((attr) => {
        matrix[attr.key] = {};
        state.items.forEach((product) => {
          let value = product;
          const keys = attr.key.split(".");
          for (const key of keys) {
            value = (value as any)[key];
          }
          matrix[attr.key][product._id] = value;
        });
      });

      // You could also fetch product-specific attributes from API
      // const attributesResponse = await fetch('/api/products/attributes/compare', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ productIds: state.items.map(p => p._id) }),
      // });

      const attributes: ProductAttribute[] = basicAttributes.map((attr) => ({
        _id: attr.key,
        name: attr.name,
        slug: attr.key,
        type: attr.type as any,
        values: [],
        required: false,
        visible: true,
      }));

      dispatch({
        type: "SET_COMPARISON_DATA",
        payload: { attributes, matrix },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to generate comparison data",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addToCompare = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: product });

    // Clear any existing error after successful add
    if (state.error) {
      setTimeout(() => {
        dispatch({ type: "SET_ERROR", payload: null });
      }, 3000);
    }
  };

  const removeFromCompare = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId });
  };

  const clearCompare = () => {
    dispatch({ type: "CLEAR_COMPARE" });
    localStorage.removeItem("compareItems");
  };

  const isInCompare = (productId: string): boolean => {
    return state.items.some((item) => item._id === productId);
  };

  const canAddMore = (): boolean => {
    return state.items.length < MAX_COMPARE_ITEMS;
  };

  const getComparison = (): ProductComparison => {
    return {
      products: state.items,
      attributes: state.attributes,
      comparisonMatrix: state.comparisonMatrix,
    };
  };

  const reorderItems = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex >= 0 &&
      fromIndex < state.items.length &&
      toIndex >= 0 &&
      toIndex < state.items.length
    ) {
      dispatch({ type: "REORDER_ITEMS", payload: { fromIndex, toIndex } });
    }
  };

  const value: CompareContextType = {
    ...state,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddMore,
    getComparison,
    reorderItems,
  };

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
};

export const useCompare = (): CompareContextType => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
};

export default CompareContext;
