/**
 * Centralized pricing configuration for all products and services.
 *
 * This is the SINGLE SOURCE OF TRUTH for prices across the entire app.
 * Admin panel reads/writes these values. Public pages consume them.
 *
 * When Supabase persistence is implemented, this file will be replaced
 * by a fetch from the `products` table.
 */

/* ─── Global Payment Configuration ─── */

export const PAYMENT_CONFIG = {
  maxInstallments: 10,
  pixDiscountPct: 5,
};

/* ─── Product Prices ─── */

export const PRICING = {
  dogbook: {
    price: 490,
    influencerDiscountPct: 10,
    discountTiers: [
      { minQty: 2, discountPct: 5 },
      { minQty: 3, discountPct: 8 },
      { minQty: 4, discountPct: 10 },
    ],
  },
  pocket: {
    price: 900,
    influencerDiscountPct: 10,
    discountTiers: [
      { minQty: 2, discountPct: 5 },
      { minQty: 3, discountPct: 8 },
      { minQty: 4, discountPct: 10 },
    ],
  },
  estudio: {
    price: 3700,
    influencerDiscountPct: 10,
    discountTiers: [
      { minQty: 2, discountPct: 5 },
      { minQty: 3, discountPct: 8 },
      { minQty: 4, discountPct: 10 },
    ],
  },
  completa: {
    price: 4900,
    influencerDiscountPct: 10,
    discountTiers: [
      { minQty: 2, discountPct: 5 },
      { minQty: 3, discountPct: 8 },
      { minQty: 4, discountPct: 10 },
    ],
  },
} as const;

/* ─── Gift Card Definitions ─── */

export interface GiftCardOption {
  label: string;
  value: number;
}

export interface GiftCardVolumeDiscount {
  minQty: number;
  discountPct: number;
}

export interface GiftCardConfig {
  name: string;
  slug: string;
  productSlug: string;
  fullPrice: number;
  couponOptions: GiftCardOption[];
  volumeDiscounts: GiftCardVolumeDiscount[];
}

export const GIFT_CARDS: GiftCardConfig[] = [
  {
    name: "Vale Presente Dogbook",
    slug: "vale-dogbook",
    productSlug: "dogbook",
    fullPrice: PRICING.dogbook.price,
    couponOptions: [
      { label: "R$ 50", value: 50 },
      { label: "R$ 100", value: 100 },
      { label: "R$ 200", value: 200 },
    ],
    volumeDiscounts: [
      { minQty: 5, discountPct: 10 },
      { minQty: 10, discountPct: 15 },
      { minQty: 25, discountPct: 17.5 },
      { minQty: 50, discountPct: 20 },
    ],
  },
  {
    name: "Vale Presente Sessao Pocket",
    slug: "vale-pocket",
    productSlug: "pocket",
    fullPrice: PRICING.pocket.price,
    couponOptions: [
      { label: "R$ 100", value: 100 },
      { label: "R$ 200", value: 200 },
      { label: "R$ 300", value: 300 },
    ],
    volumeDiscounts: [
      { minQty: 5, discountPct: 10 },
      { minQty: 10, discountPct: 15 },
      { minQty: 25, discountPct: 17.5 },
      { minQty: 50, discountPct: 20 },
    ],
  },
  {
    name: "Vale Presente Sessao Estudio",
    slug: "vale-estudio",
    productSlug: "estudio",
    fullPrice: PRICING.estudio.price,
    couponOptions: [
      { label: "R$ 200", value: 200 },
      { label: "R$ 500", value: 500 },
      { label: "R$ 900", value: 900 },
    ],
    volumeDiscounts: [
      { minQty: 5, discountPct: 10 },
      { minQty: 10, discountPct: 15 },
      { minQty: 25, discountPct: 20 },
      { minQty: 50, discountPct: 25 },
    ],
  },
  {
    name: "Vale Presente Sessao Completa",
    slug: "vale-completa",
    productSlug: "completa",
    fullPrice: PRICING.completa.price,
    couponOptions: [
      { label: "R$ 400", value: 400 },
      { label: "R$ 800", value: 800 },
      { label: "R$ 1.200", value: 1200 },
    ],
    volumeDiscounts: [
      { minQty: 5, discountPct: 10 },
      { minQty: 10, discountPct: 15 },
      { minQty: 25, discountPct: 20 },
      { minQty: 50, discountPct: 25 },
    ],
  },
];

/* ─── Redemption Coupons (Cupons de Resgate) ─── */

export interface FixedCouponConfig {
  code: string;
  discountValue: number;
  type: "fixed" | "percentage";
  active: boolean;
  usageCount: number;
}

export const FIXED_COUPONS: FixedCouponConfig[] = [
  { code: "PAM10OFF", discountValue: 10, type: "fixed", active: true, usageCount: 23 },
  { code: "PAM20OFF", discountValue: 20, type: "fixed", active: true, usageCount: 15 },
  { code: "PAM50OFF", discountValue: 50, type: "fixed", active: true, usageCount: 8 },
];

export interface RedemptionSettings {
  uniquePerLead: boolean;
  validityDays: number;
  cumulativeWithOtherDiscounts: boolean;
}

export const REDEMPTION_SETTINGS: RedemptionSettings = {
  uniquePerLead: true,
  validityDays: 7,
  cumulativeWithOtherDiscounts: false,
};

/* ─── Helpers ─── */

export function getPixPrice(price: number, pixDiscountPct: number): number {
  return Math.round(price * (1 - pixDiscountPct / 100) * 100) / 100;
}

export function getInstallmentValue(price: number, installments: number): number {
  return Math.round((price / installments) * 100) / 100;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export type ProductSlug = keyof typeof PRICING;
