"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Product, WishlistItem, Wishlist } from "../types";
import { useAuth } from "./AuthContext";
import apiClient from "../lib/apiClient";

interface WishlistState {
  items: WishlistItem[];
  wishlists: Wishlist[];
  currentWishlist?: Wishlist;
  totalItems: number;
  loading: boolean;
  error: string | null;
}

interface WishlistContextType extends WishlistState {
  addToWishlist: (
    product: Product,
    wishlistId?: string,
    notes?: string
  ) => Promise<void>;
  removeFromWishlist: (productId: string, wishlistId?: string) => Promise<void>;
  moveToCart: (productId: string, quantity?: number) => Promise<void>;
  clearWishlist: (wishlistId?: string) => Promise<void>;
  isInWishlist: (productId: string, wishlistId?: string) => boolean;
  createWishlist: (
    name: string,
    privacy?: "private" | "public" | "shared"
  ) => Promise<void>;
  deleteWishlist: (wishlistId: string) => Promise<void>;
  updateWishlist: (
    wishlistId: string,
    updates: Partial<Wishlist>
  ) => Promise<void>;
  setCurrentWishlist: (wishlistId: string) => void;
  shareWishlist: (wishlistId: string) => Promise<string>;
  setPriceAlert: (productId: string, targetPrice: number) => Promise<void>;
  setStockAlert: (productId: string, enabled: boolean) => Promise<void>;
}

type WishlistAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ITEMS"; payload: WishlistItem[] }
  | { type: "SET_WISHLISTS"; payload: Wishlist[] }
  | { type: "SET_CURRENT_WISHLIST"; payload: Wishlist }
  | { type: "ADD_ITEM"; payload: WishlistItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string; wishlistId?: string } }
  | {
      type: "UPDATE_ITEM";
      payload: { productId: string; updates: Partial<WishlistItem> };
    }
  | { type: "CLEAR_WISHLIST"; payload: { wishlistId?: string } }
  | { type: "ADD_WISHLIST"; payload: Wishlist }
  | {
      type: "UPDATE_WISHLIST";
      payload: { wishlistId: string; updates: Partial<Wishlist> };
    }
  | { type: "DELETE_WISHLIST"; payload: string };

const initialState: WishlistState = {
  items: [],
  wishlists: [],
  totalItems: 0,
  loading: false,
  error: null,
};

const wishlistReducer = (
  state: WishlistState,
  action: WishlistAction
): WishlistState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_ITEMS": {
      const items = action.payload;
      return {
        ...state,
        items,
        totalItems: items.length,
        loading: false,
        error: null,
      };
    }

    case "SET_WISHLISTS":
      return {
        ...state,
        wishlists: action.payload,
        currentWishlist: action.payload[0] || state.currentWishlist,
      };

    case "SET_CURRENT_WISHLIST":
      return {
        ...state,
        currentWishlist: action.payload,
        items: action.payload.items,
        totalItems: action.payload.items.length,
      };

    case "ADD_ITEM": {
      const newItem = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product._id === newItem.product._id
      );

      let newItems;
      if (existingIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) =>
          index === existingIndex ? { ...item, ...newItem } : item
        );
      } else {
        // Add new item
        newItems = [...state.items, newItem];
      }

      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        error: null,
      };
    }

    case "REMOVE_ITEM": {
      const { productId } = action.payload;
      const newItems = state.items.filter(
        (item) => item.product._id !== productId
      );

      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
      };
    }

    case "UPDATE_ITEM": {
      const { productId, updates } = action.payload;
      const newItems = state.items.map((item) =>
        item.product._id === productId ? { ...item, ...updates } : item
      );

      return {
        ...state,
        items: newItems,
      };
    }

    case "CLEAR_WISHLIST":
      return {
        ...state,
        items: [],
        totalItems: 0,
      };

    case "ADD_WISHLIST": {
      const newWishlist = action.payload;
      return {
        ...state,
        wishlists: [...state.wishlists, newWishlist],
        currentWishlist: state.currentWishlist || newWishlist,
      };
    }

    case "UPDATE_WISHLIST": {
      const { wishlistId, updates } = action.payload;
      const newWishlists = state.wishlists.map((wishlist) =>
        wishlist._id === wishlistId ? { ...wishlist, ...updates } : wishlist
      );

      return {
        ...state,
        wishlists: newWishlists,
        currentWishlist:
          state.currentWishlist?._id === wishlistId
            ? { ...state.currentWishlist, ...updates }
            : state.currentWishlist,
      };
    }

    case "DELETE_WISHLIST": {
      const wishlistId = action.payload;
      const newWishlists = state.wishlists.filter((w) => w._id !== wishlistId);

      return {
        ...state,
        wishlists: newWishlists,
        currentWishlist:
          state.currentWishlist?._id === wishlistId
            ? newWishlists[0]
            : state.currentWishlist,
        items: state.currentWishlist?._id === wishlistId ? [] : state.items,
        totalItems:
          state.currentWishlist?._id === wishlistId ? 0 : state.totalItems,
      };
    }

    default:
      return state;
  }
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load wishlist data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWishlists();
    } else {
      // Load guest wishlist from localStorage
      loadGuestWishlist();
    }
  }, [isAuthenticated, user]);

  const loadWishlists = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Note: Wishlist API endpoints don't exist yet in backend
      // For now, just set empty state to prevent errors
      dispatch({ type: "SET_WISHLISTS", payload: [] });
      dispatch({ type: "SET_ITEMS", payload: [] });

      // TODO: Implement when wishlist backend endpoints are available
      // const response = await apiClient.getRaw("/wishlists");
      // dispatch({ type: "SET_WISHLISTS", payload: response.data.wishlists || [] });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to load wishlists",
      });
    }
  };

  const loadGuestWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem("guestWishlist");
      if (savedWishlist) {
        const items: WishlistItem[] = JSON.parse(savedWishlist);
        dispatch({ type: "SET_ITEMS", payload: items });
      }
    } catch (error) {
      console.error("Error loading guest wishlist:", error);
    }
  };

  const saveGuestWishlist = (items: WishlistItem[]) => {
    try {
      localStorage.setItem("guestWishlist", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving guest wishlist:", error);
    }
  };

  const addToWishlist = async (
    product: Product,
    wishlistId?: string,
    notes?: string
  ) => {
    try {
      // For now, handle as guest wishlist since backend endpoints don't exist
      const newItem: WishlistItem = {
        _id: `guest_${Date.now()}_${product._id}`,
        product,
        addedAt: new Date().toISOString(),
        notes,
      };

      dispatch({ type: "ADD_ITEM", payload: newItem });

      // Save to localStorage
      const newItems = [
        ...state.items.filter((item) => item.product._id !== product._id),
        newItem,
      ];
      saveGuestWishlist(newItems);

      // TODO: Implement server wishlist when backend endpoints are available
      // if (isAuthenticated && targetWishlistId) {
      //   await apiClient.postRaw(`/wishlists/${targetWishlistId}/items`, {
      //     productId: product._id,
      //     notes,
      //   });
      // }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to add to wishlist",
      });

      // Clear error after 3 seconds
      setTimeout(() => {
        dispatch({ type: "SET_ERROR", payload: null });
      }, 3000);
    }
  };

  const removeFromWishlist = async (productId: string, wishlistId?: string) => {
    try {
      // Handle as guest wishlist only for now since backend endpoints don't exist
      dispatch({ type: "REMOVE_ITEM", payload: { productId, wishlistId } });

      // Update localStorage for guest
      const newItems = state.items.filter(
        (item) => item.product._id !== productId
      );
      saveGuestWishlist(newItems);

      // TODO: Implement server wishlist when backend endpoints are available
      // if (isAuthenticated && targetWishlistId) {
      //   await apiClient.deleteRaw(`/wishlists/${targetWishlistId}/items/${productId}`);
      // }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to remove from wishlist",
      });
    }
  };

  const moveToCart = async (productId: string, quantity: number = 1) => {
    // This would integrate with cart context
    // Implementation depends on cart context
    try {
      const item = state.items.find((item) => item.product._id === productId);
      if (item) {
        // Add to cart logic here
        // Then remove from wishlist
        await removeFromWishlist(productId);
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to move to cart",
      });
    }
  };

  const clearWishlist = async (wishlistId?: string) => {
    try {
      const targetWishlistId = wishlistId || state.currentWishlist?._id;

      if (isAuthenticated && targetWishlistId) {
        const response = await fetch(
          `/api/wishlists/${targetWishlistId}/clear`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to clear wishlist");
        }
      }

      dispatch({ type: "CLEAR_WISHLIST", payload: { wishlistId } });

      if (!isAuthenticated) {
        localStorage.removeItem("guestWishlist");
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to clear wishlist",
      });
    }
  };

  const isInWishlist = (productId: string, wishlistId?: string): boolean => {
    if (wishlistId) {
      const wishlist = state.wishlists.find((w) => w._id === wishlistId);
      return (
        wishlist?.items.some((item) => item.product._id === productId) || false
      );
    }

    return state.items.some((item) => item.product._id === productId);
  };

  const createWishlist = async (
    name: string,
    privacy: "private" | "public" | "shared" = "private"
  ) => {
    try {
      if (!isAuthenticated) {
        throw new Error("Please log in to create wishlists");
      }

      const response = await fetch("/api/wishlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, privacy }),
      });

      if (!response.ok) {
        throw new Error("Failed to create wishlist");
      }

      const data = await response.json();
      dispatch({ type: "ADD_WISHLIST", payload: data.wishlist });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to create wishlist",
      });
    }
  };

  const deleteWishlist = async (wishlistId: string) => {
    try {
      const response = await fetch(`/api/wishlists/${wishlistId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete wishlist");
      }

      dispatch({ type: "DELETE_WISHLIST", payload: wishlistId });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to delete wishlist",
      });
    }
  };

  const updateWishlist = async (
    wishlistId: string,
    updates: Partial<Wishlist>
  ) => {
    try {
      const response = await fetch(`/api/wishlists/${wishlistId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update wishlist");
      }

      dispatch({ type: "UPDATE_WISHLIST", payload: { wishlistId, updates } });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to update wishlist",
      });
    }
  };

  const setCurrentWishlist = (wishlistId: string) => {
    const wishlist = state.wishlists.find((w) => w._id === wishlistId);
    if (wishlist) {
      dispatch({ type: "SET_CURRENT_WISHLIST", payload: wishlist });
    }
  };

  const shareWishlist = async (wishlistId: string): Promise<string> => {
    try {
      const response = await fetch(`/api/wishlists/${wishlistId}/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate share link");
      }

      const data = await response.json();
      return data.shareUrl;
    } catch (error) {
      throw error;
    }
  };

  const setPriceAlert = async (productId: string, targetPrice: number) => {
    try {
      const updates = {
        priceAlert: {
          enabled: true,
          targetPrice,
        },
      };

      dispatch({ type: "UPDATE_ITEM", payload: { productId, updates } });

      if (isAuthenticated) {
        // Update on server
        await fetch(`/api/wishlists/items/${productId}/price-alert`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ targetPrice }),
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to set price alert",
      });
    }
  };

  const setStockAlert = async (productId: string, enabled: boolean) => {
    try {
      const updates = { stockAlert: enabled };

      dispatch({ type: "UPDATE_ITEM", payload: { productId, updates } });

      if (isAuthenticated) {
        // Update on server
        await fetch(`/api/wishlists/items/${productId}/stock-alert`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ enabled }),
        });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to set stock alert",
      });
    }
  };

  const value: WishlistContextType = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    isInWishlist,
    createWishlist,
    deleteWishlist,
    updateWishlist,
    setCurrentWishlist,
    shareWishlist,
    setPriceAlert,
    setStockAlert,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export default WishlistContext;
