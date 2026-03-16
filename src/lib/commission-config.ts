/**
 * Default commission rates for influencers and photographers.
 *
 * These are the FALLBACK values used when the database has no overrides.
 * The admin panel (/admin/comissoes) reads/writes these values via the
 * /api/commissions/rates endpoint.
 */

export interface CommissionRates {
  influencer: {
    dogbook: number;
    pocket: number;
    estudio: number;
    completa: number;
  };
  photographer: {
    pocket: number;
    estudio: number;
    completa: number;
  };
}

export const DEFAULT_COMMISSION_RATES: CommissionRates = {
  influencer: {
    dogbook: 10,
    pocket: 20,
    estudio: 50,
    completa: 100,
  },
  photographer: {
    pocket: 150,
    estudio: 300,
    completa: 500,
  },
};
