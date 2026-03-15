"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";
import { usePaymentConfig } from "@/hooks/usePaymentConfig";
import { getInfluencerTracking } from "@/lib/influencer-tracking";

/* ─────────── Types ─────────── */

export interface AppliedCoupon {
  code: string;
  type: "percentual" | "fixo";
  value: number;
  fromInfluencer?: boolean;
}

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
  appliedCoupon: AppliedCoupon | null;
  couponDiscount: number;
  applyCouponCode: (code: string, fromInfluencer?: boolean) => Promise<boolean>;
  removeCoupon: () => void;
  influencerSlug: string | null;
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

/* ─────────── Coupon validation helper ─────────── */

async function validateCoupon(
  code: string
): Promise<{
  valid: boolean;
  code?: string;
  discount_type?: string;
  discount_value?: number;
  reason?: string;
}> {
  try {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    return await res.json();
  } catch {
    return { valid: false, reason: "Erro de conexao" };
  }
}

/* ─────────── Provider ─────────── */

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null
  );
  const [influencerSlug, setInfluencerSlug] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);

    // Check for influencer tracking and auto-apply coupon
    const tracking = getInfluencerTracking();
    if (tracking) {
      setInfluencerSlug(tracking.slug);
      if (tracking.couponCode) {
        // Auto-apply influencer coupon (fire and forget)
        validateCoupon(tracking.couponCode).then((data) => {
          if (data.valid) {
            setAppliedCoupon({
              code: data.code!,
              type: data.discount_type === "fixo" ? "fixo" : "percentual",
              value: data.discount_value!,
              fromInfluencer: true,
            });
          }
        });
      }
    }
  }, []);

  // Persist to localStorage on change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const applyCouponCode = useCallback(
    async (code: string, fromInfluencer = false): Promise<boolean> => {
      const data = await validateCoupon(code);
      if (data.valid) {
        setAppliedCoupon({
          code: data.code!,
          type: data.discount_type === "fixo" ? "fixo" : "percentual",
          value: data.discount_value!,
          fromInfluencer,
        });
        return true;
      }
      return false;
    },
    []
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

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

  // Calculate coupon discount (applied after volume discount)
  let couponDiscount = 0;
  if (appliedCoupon) {
    const afterVolumeDiscount = subtotal - discountAmount;
    if (appliedCoupon.type === "fixo") {
      couponDiscount = Math.min(appliedCoupon.value, afterVolumeDiscount);
    } else {
      couponDiscount = afterVolumeDiscount * (appliedCoupon.value / 100);
    }
  }

  const total = Math.max(subtotal - discountAmount - couponDiscount, 0);
  const paymentCfg = usePaymentConfig();
  const pixTotal = total * (1 - paymentCfg.pixDiscountPct / 100);

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
        appliedCoupon,
        couponDiscount,
        applyCouponCode,
        removeCoupon,
        influencerSlug,
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
