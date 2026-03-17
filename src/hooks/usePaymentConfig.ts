"use client";

import { useState, useEffect } from "react";
import { PAYMENT_CONFIG } from "@/lib/pricing-config";
import { adminFetch } from "@/lib/admin-fetch";

/**
 * Supabase-backed persistence for payment configuration.
 *
 * Admin saves → POST /api/settings → Supabase `site_settings` table.
 * Public pages → GET /api/settings → reads from Supabase (same DB for everyone).
 *
 * This guarantees that ALL visitors see the admin-configured values,
 * regardless of browser, device, or deployment cache.
 */

export interface PaymentConfigData {
  maxInstallments: number;
  pixDiscountPct: number;
  boletoDiscountPct: number;
}

/** In-memory cache shared across all hook instances in the same page load */
let cachedConfig: PaymentConfigData | null = null;
let fetchPromise: Promise<PaymentConfigData> | null = null;

/** Fetch payment config from the API (Supabase-backed) */
async function fetchPaymentConfig(): Promise<PaymentConfigData> {
  try {
    const res = await fetch("/api/settings?key=payment_config", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.value) {
      const val = data.value as Partial<PaymentConfigData>;
      return {
        maxInstallments: val.maxInstallments ?? PAYMENT_CONFIG.maxInstallments,
        pixDiscountPct: val.pixDiscountPct ?? PAYMENT_CONFIG.pixDiscountPct,
        boletoDiscountPct: val.boletoDiscountPct ?? PAYMENT_CONFIG.boletoDiscountPct,
      };
    }
  } catch (err) {
    console.warn("[usePaymentConfig] Failed to fetch from API, using defaults:", err);
  }
  return PAYMENT_CONFIG;
}

/** Save payment config to the API (Supabase-backed) */
export async function persistPaymentConfig(cfg: PaymentConfigData): Promise<boolean> {
  try {
    const res = await adminFetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "payment_config", value: cfg }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Update the in-memory cache immediately
    cachedConfig = cfg;
    // Notify other components in the same tab
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("pam_payment_config_updated"));
    }
    return true;
  } catch (err) {
    console.error("[persistPaymentConfig] Failed to save:", err);
    return false;
  }
}

/**
 * React hook that returns the current payment config from Supabase.
 *
 * - Starts with hardcoded defaults (for SSR / initial render)
 * - On mount, fetches the real values from /api/settings (Supabase)
 * - Deduplicates concurrent fetches across multiple components
 * - Listens for in-tab updates (after admin save)
 */
export function usePaymentConfig(): PaymentConfigData {
  const [config, setConfig] = useState<PaymentConfigData>(
    cachedConfig ?? PAYMENT_CONFIG
  );

  useEffect(() => {
    // If already cached from a previous fetch in this page load, use it
    if (cachedConfig) {
      setConfig(cachedConfig);
    }

    // Deduplicate: if a fetch is already in flight, reuse it
    if (!fetchPromise) {
      fetchPromise = fetchPaymentConfig().then((cfg) => {
        cachedConfig = cfg;
        fetchPromise = null;
        return cfg;
      });
    }

    fetchPromise.then((cfg) => setConfig(cfg));

    // Listen for updates from admin save (same tab)
    const onUpdate = () => {
      if (cachedConfig) setConfig(cachedConfig);
    };
    window.addEventListener("pam_payment_config_updated", onUpdate);
    return () => {
      window.removeEventListener("pam_payment_config_updated", onUpdate);
    };
  }, []);

  return config;
}
