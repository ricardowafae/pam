"use client";

import { useState, useEffect, useCallback } from "react";
import { PAYMENT_CONFIG } from "@/lib/pricing-config";

/**
 * localStorage-based persistence for payment configuration.
 *
 * Until Supabase persistence is wired up, admin saves to localStorage
 * and public pages read from it so changes reflect immediately
 * (within the same browser).
 */

const STORAGE_KEY = "pam_payment_config";

export interface PaymentConfigData {
  maxInstallments: number;
  pixDiscountPct: number;
  boletoDiscountPct: number;
}

/** Read persisted config (sync, for initial render) */
function readPersistedConfig(): PaymentConfigData {
  if (typeof window === "undefined") return PAYMENT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PaymentConfigData>;
      return {
        maxInstallments: parsed.maxInstallments ?? PAYMENT_CONFIG.maxInstallments,
        pixDiscountPct: parsed.pixDiscountPct ?? PAYMENT_CONFIG.pixDiscountPct,
        boletoDiscountPct: parsed.boletoDiscountPct ?? PAYMENT_CONFIG.boletoDiscountPct,
      };
    }
  } catch {
    // corrupted – fall back to defaults
  }
  return PAYMENT_CONFIG;
}

/** Write config to localStorage */
export function persistPaymentConfig(cfg: PaymentConfigData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  // Dispatch a custom event so other tabs/components re-read
  window.dispatchEvent(new Event("pam_payment_config_updated"));
}

/**
 * React hook that returns the current payment config.
 * - On first render, reads from localStorage (falls back to hardcoded).
 * - Listens for cross-tab `storage` events and custom in-tab events
 *   so the value is always fresh.
 */
export function usePaymentConfig(): PaymentConfigData {
  const [config, setConfig] = useState<PaymentConfigData>(PAYMENT_CONFIG);

  useEffect(() => {
    // Read from localStorage on mount (after hydration, window is available)
    const persisted = readPersistedConfig();
    setConfig(persisted);

    const refresh = () => setConfig(readPersistedConfig());
    // Listen for changes from other tabs
    window.addEventListener("storage", refresh);
    // Listen for changes within the same tab (admin save)
    window.addEventListener("pam_payment_config_updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("pam_payment_config_updated", refresh);
    };
  }, []);

  return config;
}
