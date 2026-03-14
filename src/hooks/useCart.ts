"use client";

import { useState, useCallback } from "react";
import type { CartItem, Product } from "@/types";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

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

  return {
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
  };
}
