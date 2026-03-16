import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_COMMISSION_RATES,
  type CommissionRates,
} from "@/lib/commission-config";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/commissions/rates
 *
 * Returns the current commission rates for influencers and photographers.
 * Falls back to DEFAULT_COMMISSION_RATES if no DB override exists.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "commission_rates")
      .single();

    if (error || !data) {
      // Table may not exist yet or no row — return defaults
      return NextResponse.json(
        { rates: DEFAULT_COMMISSION_RATES },
        { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" } }
      );
    }

    // Merge with defaults so new keys are always present
    const stored = data.value as Partial<CommissionRates>;
    const merged: CommissionRates = {
      influencer: {
        ...DEFAULT_COMMISSION_RATES.influencer,
        ...(stored.influencer || {}),
      },
      photographer: {
        ...DEFAULT_COMMISSION_RATES.photographer,
        ...(stored.photographer || {}),
      },
      sessionPricing: {
        ...DEFAULT_COMMISSION_RATES.sessionPricing,
        ...(stored.sessionPricing || {}),
      },
    };

    return NextResponse.json(
      { rates: merged },
      { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" } }
    );
  } catch (err: unknown) {
    console.error("[commissions/rates GET]", err);
    // Always return defaults on error so the frontend never breaks
    return NextResponse.json({ rates: DEFAULT_COMMISSION_RATES });
  }
}

/**
 * POST /api/commissions/rates
 *
 * Saves commission rates. Body: { rates: CommissionRates }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rates } = body as { rates: CommissionRates };

    if (!rates || !rates.influencer || !rates.photographer || !rates.sessionPricing) {
      return NextResponse.json(
        { error: "Body must include { rates: { influencer: {...}, photographer: {...}, sessionPricing: {...} } }" },
        { status: 400 }
      );
    }

    // Upsert into site_settings
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert(
        {
          key: "commission_rates",
          value: rates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) {
      // If table doesn't exist, create it and retry
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        await supabaseAdmin.rpc("exec_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS site_settings (
              key TEXT PRIMARY KEY,
              value JSONB NOT NULL DEFAULT '{}',
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
          `,
        });

        // Retry the upsert
        const { error: retryError } = await supabaseAdmin
          .from("site_settings")
          .upsert(
            {
              key: "commission_rates",
              value: rates,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "key" }
          );

        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[commissions/rates POST]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
