"use client";

import React, { createContext, useReducer, useContext, ReactNode } from "react";
import {
  Product,
  ProductSearchFilters,
  ProductBulkOperation,
  ProductImportData,
  ProductExportData,
} from "@/types/product";

// ============================================================================
// ACTION TYPES
// ============================================================================
export type ProductAction =
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_FILTERS"; payload: ProductSearchFilters }
  | { type: "CLEAR_FILTERS" }
  | { type: "START_BULK_OPERATION"; payload: ProductBulkOperation }
  | { type: "UPDATE_BULK_OPERATION"; payload: ProductBulkOperation }
  | { type: "FINISH_BULK_OPERATION"; payload: ProductBulkOperation }
  | { type: "IMPORT_PRODUCTS"; payload: ProductImportData }
  | { type: "EXPORT_PRODUCTS"; payload: ProductExportData };

// ============================================================================
// STATE
// ============================================================================
export interface ProductState {
  products: Product[];
  filters: ProductSearchFilters | null;
  bulkOperations: ProductBulkOperation[];
  importing?: ProductImportData | null;
  exporting?: ProductExportData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  filters: null,
  bulkOperations: [],
  importing: null,
  exporting: null,
  loading: false,
  error: null,
};

// ============================================================================
// REDUCER
// ============================================================================
function productReducer(
  state: ProductState,
  action: ProductAction
): ProductState {
  switch (action.type) {
    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.payload] };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };

    case "SET_PRODUCTS":
      return { ...state, products: action.payload };

    case "SET_FILTERS":
      return { ...state, filters: action.payload };

    case "CLEAR_FILTERS":
      return { ...state, filters: null };

    case "START_BULK_OPERATION":
      return {
        ...state,
        bulkOperations: [...state.bulkOperations, action.payload],
        loading: true,
      };

    case "UPDATE_BULK_OPERATION":
      return {
        ...state,
        bulkOperations: state.bulkOperations.map((op) =>
          op.type === action.payload.type ? action.payload : op
        ),
      };

    case "FINISH_BULK_OPERATION":
      return {
        ...state,
        bulkOperations: state.bulkOperations.filter(
          (op) => op.type !== action.payload.type
        ),
        loading: false,
      };

    case "IMPORT_PRODUCTS":
      return {
        ...state,
        importing: action.payload,
        products: [
          ...state.products,
          ...(action.payload.products as Product[]),
        ],
      };

    case "EXPORT_PRODUCTS":
      return { ...state, exporting: action.payload };

    default:
      return state;
  }
}

// ==============================================================================
// CONTEXT
// ==============================================================================

const ProductStateContext = createContext<ProductState | undefined>(undefined);
const ProductDispatchContext = createContext<
  React.Dispatch<ProductAction> | undefined
>(undefined);

// ==============================================================================
// PROVIDER
// ==============================================================================

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  return (
    <ProductStateContext.Provider value={state}>
      <ProductDispatchContext.Provider value={dispatch}>
        {children}
      </ProductDispatchContext.Provider>
    </ProductStateContext.Provider>
  );
};

// ============================================================================
// HOOKS
// ============================================================================
export const useProductState = () => {
  const context = useContext(ProductStateContext);
  if (!context)
    throw new Error("useProductState must be used within a ProductProvider");
  return context;
};

export const useProductDispatch = () => {
  const context = useContext(ProductDispatchContext);
  if (!context)
    throw new Error("useProductDispatch must be used within a ProductProvider");
  return context;
};
