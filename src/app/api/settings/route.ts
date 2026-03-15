import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API route for reading / writing global payment settings.
 *
 * Uses the existing `products` table in Supabase.
 * All products share the same max_installments and pix_discount_pct,
 * so we read from any product and write to all of them.
 *
 * GET  /api/settings?key=payment_config   → returns { value: {...} }
 * POST /api/settings  { key, value }       → updates all products
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── GET ────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");

  if (key === "product_prices") {
    try {
      const { data, error } = await supabaseAdmin
        .from("products")
        .select("slug, base_price")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return NextResponse.json(
        { products: data },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    } catch (err: any) {
      console.error("[settings GET product_prices]", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  if (key !== "payment_config") {
    return NextResponse.json({ value: null });
  }

  try {
    // Read from any product (all share the same payment config)
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("max_installments, pix_discount_pct")
      .limit(1)
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        value: {
          maxInstallments: data.max_installments,
          pixDiscountPct: data.pix_discount_pct,
          boletoDiscountPct: 3, // TODO: add column to DB when needed
        },
      },
      {
        headers: {
          // Short cache so admin changes reflect quickly
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (err: any) {
    console.error("[settings GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (key !== "payment_config" || !value) {
      return NextResponse.json(
        { error: "Body must include { key: 'payment_config', value: {...} }" },
        { status: 400 }
      );
    }

    const { maxInstallments, pixDiscountPct } = value;

    // Update ALL products with the new global payment config
    const { error } = await supabaseAdmin
      .from("products")
      .update({
        max_installments: maxInstallments,
        pix_discount_pct: pixDiscountPct,
        updated_at: new Date().toISOString(),
      })
      .gte("sort_order", 0); // matches all products

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[settings POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
