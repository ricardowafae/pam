import { createClient } from "@supabase/supabase-js";
import { PAYMENT_CONFIG, PRICING } from "@/lib/pricing-config";

/**
 * Server-side functions to fetch payment config AND product prices
 * directly from Supabase.
 *
 * Used by Server Components and pages that need the correct values
 * at render time (no client-side flash from defaults -> real values).
 */

export interface PaymentConfigData {
  maxInstallments: number;
  pixDiscountPct: number;
  boletoDiscountPct: number;
}

export interface ProductPrices {
  dogbook: number;
  pocket: number;
  estudio: number;
  completa: number;
}

export interface ServerSideData {
  paymentConfig: PaymentConfigData;
  prices: ProductPrices;
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Fetches ALL dynamic data from Supabase in a single call.
 * Returns payment config (installments, PIX discount) and product prices.
 * Falls back to hardcoded defaults on error.
 */
export async function getServerSideData(): Promise<ServerSideData> {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("slug, base_price, max_installments, pix_discount_pct")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No products found");

    // Extract prices by slug
    const priceMap: Record<string, number> = {};
    for (const row of data) {
      priceMap[row.slug] = row.base_price;
    }

    // Payment config comes from any product (all share the same values)
    const firstProduct = data[0];

    return {
      paymentConfig: {
        maxInstallments: firstProduct.max_installments ?? PAYMENT_CONFIG.maxInstallments,
        pixDiscountPct: firstProduct.pix_discount_pct ?? PAYMENT_CONFIG.pixDiscountPct,
        boletoDiscountPct: PAYMENT_CONFIG.boletoDiscountPct,
      },
      prices: {
        dogbook: priceMap["dogbook"] ?? PRICING.dogbook.price,
        pocket: priceMap["sessao-pocket"] ?? PRICING.pocket.price,
        estudio: priceMap["sessao-estudio"] ?? PRICING.estudio.price,
        completa: priceMap["sessao-completa"] ?? PRICING.completa.price,
      },
    };
  } catch (err) {
    console.error("[getServerSideData] Failed, using defaults:", err);
    return {
      paymentConfig: PAYMENT_CONFIG,
      prices: {
        dogbook: PRICING.dogbook.price,
        pocket: PRICING.pocket.price,
        estudio: PRICING.estudio.price,
        completa: PRICING.completa.price,
      },
    };
  }
}

/** Convenience: fetch only payment config */
export async function getPaymentConfig(): Promise<PaymentConfigData> {
  const data = await getServerSideData();
  return data.paymentConfig;
}
