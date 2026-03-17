import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, isAuthError } from "@/lib/admin-auth";

/**
 * API route for reading / writing global payment settings.
 *
 * GET  /api/settings?key=payment_config   → returns { value: {...} } (public, read-only)
 * POST /api/settings  { key, value }       → updates all products (admin-only)
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
    } catch (err) {
      console.error("[settings GET product_prices]", err);
      return NextResponse.json({ error: err instanceof Error ? err.message : "Erro interno" }, { status: 500 });
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
  } catch (err) {
    console.error("[settings GET]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro interno" }, { status: 500 });
  }
}

// ─── POST (admin-only) ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Auth check ──
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

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

    // Validate values
    const installments = Number(maxInstallments);
    const pixDiscount = Number(pixDiscountPct);

    if (isNaN(installments) || installments < 1 || installments > 12) {
      return NextResponse.json(
        { error: "Parcelas devem ser entre 1 e 12" },
        { status: 400 }
      );
    }

    if (isNaN(pixDiscount) || pixDiscount < 0 || pixDiscount > 50) {
      return NextResponse.json(
        { error: "Desconto PIX deve ser entre 0 e 50%" },
        { status: 400 }
      );
    }

    // Update ALL products with the new global payment config
    const { error } = await supabaseAdmin
      .from("products")
      .update({
        max_installments: installments,
        pix_discount_pct: pixDiscount,
        updated_at: new Date().toISOString(),
      })
      .gte("sort_order", 0); // matches all products

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[settings POST]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro interno" }, { status: 500 });
  }
}
