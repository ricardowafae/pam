import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, isAuthError } from "@/lib/admin-auth";

/**
 * POST /api/admin/save-products
 *
 * Updates product prices in the Supabase `products` table.
 * Requires admin authentication.
 *
 * Body: { products: [{ slug: string, base_price: number }] }
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SLUG_MAP: Record<string, string> = {
  Dogbook: "dogbook",
  "Sessão Pocket": "sessao-pocket",
  "Sessão Estúdio": "sessao-estudio",
  "Sessão Completa": "sessao-completa",
};

const VALID_SLUGS = new Set([
  "dogbook",
  "sessao-pocket",
  "sessao-estudio",
  "sessao-completa",
]);

export async function POST(req: NextRequest) {
  // ── Auth check ──
  const auth = await requireAdmin(req);
  if (isAuthError(auth)) return auth;

  try {
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Body must include { products: [{ name, price }] }" },
        { status: 400 }
      );
    }

    // Update each product by slug
    const errors: string[] = [];
    for (const p of products) {
      const slug = p.slug || SLUG_MAP[p.name];
      if (!slug || !VALID_SLUGS.has(slug)) {
        errors.push(`Unknown product: ${p.name || p.slug}`);
        continue;
      }

      // Validate price is a positive number
      const price = Number(p.price);
      if (isNaN(price) || price < 0 || price > 100000) {
        errors.push(`Invalid price for ${slug}: ${p.price}`);
        continue;
      }

      const { error } = await supabaseAdmin
        .from("products")
        .update({
          base_price: price,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", slug);

      if (error) {
        errors.push(`${slug}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { ok: false, errors },
        { status: 207 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[save-products]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
