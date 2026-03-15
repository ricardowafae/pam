"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { CartItem, Product } from "@/types";

/* ─────────── Cart Context Type ─────────── */

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  discountAmount: number;
  total: number;
  pixTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

/* ─────────── LocalStorage helpers ─────────── */

const STORAGE_KEY = "pam-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silently fail
  }
}

/* ─────────── Provider ─────────── */

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist to localStorage on change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const getDiscount = (totalQty: number) => {
    if (totalQty >= 4) return 0.1;
    if (totalQty >= 2) return 0.05;
    return 0;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.base_price * item.quantity,
    0
  );

  const dogbookQty = items
    .filter((item) => item.product.slug === "dogbook")
    .reduce((sum, item) => sum + item.quantity, 0);

  const discount = getDiscount(dogbookQty);
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;
  const pixTotal = total * 0.95;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        discountAmount,
        total,
        pixTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ─────────── Hook ─────────── */

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
