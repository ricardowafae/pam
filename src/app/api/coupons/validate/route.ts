import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/coupons/validate
 * Validates a coupon code against the Supabase database.
 *
 * Body: { code: string }
 * Returns: { valid: true, code, discount_type, discount_value } or { valid: false, reason }
 */
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, reason: "Codigo do cupom e obrigatorio" },
        { status: 400 }
      );
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("id, code, coupon_type, discount_value, usage_limit, usage_count, valid_from, valid_until, active, min_purchase, applicable_products")
      .eq("code", code.toUpperCase().trim())
      .eq("active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({
        valid: false,
        reason: "Cupom nao encontrado ou inativo",
      });
    }

    // Check date validity
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({
        valid: false,
        reason: "Este cupom ainda nao esta disponivel",
      });
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({
        valid: false,
        reason: "Este cupom expirou",
      });
    }

    // Check usage limit
    if (
      coupon.usage_limit !== null &&
      coupon.usage_count >= coupon.usage_limit
    ) {
      return NextResponse.json({
        valid: false,
        reason: "Este cupom atingiu o limite de uso",
      });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.coupon_type,
      discount_value: coupon.discount_value,
      min_purchase: coupon.min_purchase,
      applicable_products: coupon.applicable_products,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, reason: "Erro ao validar cupom" },
      { status: 500 }
    );
  }
}
