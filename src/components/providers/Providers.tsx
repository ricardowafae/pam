"use client";

import { CartProvider } from "@/hooks/useCart";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </CartProvider>
  );
}
