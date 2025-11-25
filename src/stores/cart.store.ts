import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type { Cart as StorefrontCart } from "@/types/storefront";

 

interface CartState {
  // State
  cart: StorefrontCart | null;
  buyNowCart: StorefrontCart | null;
  isDrawerOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: (opts?: { mode?: "buy-now" | "normal" }) => Promise<void>;
  addItem: (
    productId: string,
    variantId?: string,
    quantity?: number
  ) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;

  // Computed
  itemCount: number;
  hasItems: boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      buyNowCart: null,
      isDrawerOpen: false,
      isLoading: false,
      error: null,

      // Actions
      fetchCart: async (opts) => {
        try {
          const prevCart = get().cart;
          set({ isLoading: true, error: null });
          const url = opts?.mode === "buy-now" ? "/api/storefront/cart?mode=buy-now" : "/api/storefront/cart";
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) throw new Error("Failed to fetch cart");
          const data = await response.json();
          const serverCart = data.data;
          if (opts?.mode === "buy-now") {
            // Do not override the main cart with Buy Now temporary cart
            set({ buyNowCart: serverCart, isLoading: false });
          } else {
            set({ cart: serverCart, isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Unknown error",
            isLoading: false,
          });
        }
      },

      addItem: async (productId, variantId, quantity = 1) => {
        try {
          const prevCount = get().itemCount;
          set({ isLoading: true, error: null });
          const response = await fetch("/api/storefront/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, variantId, quantity }),
          });
          if (!response.ok) throw new Error("Failed to add item");
          const data = await response.json();
          set({ cart: data.data, isLoading: false, isDrawerOpen: true });
          const newCount = get().itemCount;
          if (newCount > prevCount) {
            toast.success("Added to cart", {
              description: `${newCount} item${newCount === 1 ? "" : "s"} in cart`,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Unknown error",
            isLoading: false,
          });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/storefront/cart/items`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId, quantity }),
          });
          if (!response.ok) throw new Error("Failed to update quantity");
          const data = await response.json();
          set({ cart: data.data, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Unknown error",
            isLoading: false,
          });
        }
      },

      removeItem: async (itemId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/storefront/cart/items`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId }),
          });
          if (!response.ok) throw new Error("Failed to remove item");
          const data = await response.json();
          set({ cart: data.data, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Unknown error",
            isLoading: false,
          });
        }
      },

      applyDiscount: async (code) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch("/api/storefront/cart/discount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
          if (!response.ok) throw new Error("Invalid discount code");
          const data = await response.json();
          set({ cart: data.data, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Unknown error",
            isLoading: false,
          });
        }
      },

      clearCart: () => set({ cart: null }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      // Computed properties
      get itemCount() {
        const c = get().cart;
        return c?.itemCount ?? (c?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0);
      },

      get hasItems() {
        return (get().cart?.items.length ?? 0) > 0;
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
