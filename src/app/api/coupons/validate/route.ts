import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Simple in-memory rate limiter to prevent coupon brute-force ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 attempts per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 300_000);

/**
 * POST /api/coupons/validate
 * Validates a coupon code against the Supabase database.
 * Rate limited to 10 attempts per minute per IP.
 *
 * Body: { code: string }
 * Returns: { valid: true, code, discount_type, discount_value } or { valid: false, reason }
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { valid: false, reason: "Muitas tentativas. Tente novamente em 1 minuto." },
        { status: 429 }
      );
    }

    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, reason: "Codigo do cupom e obrigatorio" },
        { status: 400 }
      );
    }

    // Limit code length to prevent abuse
    if (code.length > 50) {
      return NextResponse.json(
        { valid: false, reason: "Codigo do cupom invalido" },
        { status: 400 }
      );
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("id, code, coupon_type, discount_value, max_uses, used_count, valid_from, valid_until, active, min_order_value")
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
      coupon.max_uses !== null &&
      coupon.used_count >= coupon.max_uses
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
      min_purchase: coupon.min_order_value,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, reason: "Erro ao validar cupom" },
      { status: 500 }
    );
  }
}
