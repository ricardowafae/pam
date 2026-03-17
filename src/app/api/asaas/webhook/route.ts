import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";
import {
  handlePaymentSuccess,
  handlePaymentFailure,
  handlePaymentRefund,
  handlePaymentExpired,
} from "@/lib/payment-actions";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Timing-safe string comparison to prevent timing attacks on webhook tokens.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── Validate webhook token (ALWAYS required) ──
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (!webhookToken) {
      console.error("[asaas-webhook] ASAAS_WEBHOOK_TOKEN not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const receivedToken = req.headers.get("asaas-access-token") || "";
    if (!receivedToken || !safeCompare(receivedToken, webhookToken)) {
      return NextResponse.json(
        { error: "Invalid webhook token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { event, payment } = body;

    if (!event || !payment) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const asaasPaymentId = payment.id;
    const externalReference = payment.externalReference; // our order ID

    // Validate payment ID format (Asaas uses pay_ prefix)
    if (typeof asaasPaymentId !== "string" || !asaasPaymentId.startsWith("pay_")) {
      return NextResponse.json(
        { error: "Invalid payment ID format" },
        { status: 400 }
      );
    }

    // Find order by externalReference (order.id) or asaas_payment_id
    let orderId = externalReference;

    // Validate externalReference is a UUID if provided
    if (orderId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      orderId = null;
    }

    if (!orderId) {
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("asaas_payment_id", asaasPaymentId)
        .single();
      orderId = order?.id;
    }

    if (!orderId) {
      console.log(
        `[asaas-webhook] No order found for payment ${asaasPaymentId}`
      );
      return NextResponse.json({ received: true });
    }

    // Get order details for coupon/influencer info
    const { data: orderData } = await supabaseAdmin
      .from("orders")
      .select("coupon_id, influencer_id, total")
      .eq("id", orderId)
      .single();

    // Get coupon code if exists
    let couponCode: string | undefined;
    if (orderData?.coupon_id) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("code")
        .eq("id", orderData.coupon_id)
        .single();
      couponCode = coupon?.code;
    }

    switch (event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        const paymentAmount = payment.value || orderData?.total || 0;
        await handlePaymentSuccess(
          orderId,
          paymentAmount,
          couponCode,
          orderData?.influencer_id || undefined
        );
        break;
      }

      case "PAYMENT_OVERDUE": {
        await handlePaymentExpired(orderId);
        break;
      }

      case "PAYMENT_REFUNDED":
      case "PAYMENT_PARTIALLY_REFUNDED": {
        await handlePaymentRefund(orderId);
        break;
      }

      case "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED":
      case "PAYMENT_REPROVED_BY_RISK_ANALYSIS": {
        await handlePaymentFailure(orderId);
        break;
      }

      default:
        console.log(`[asaas-webhook] Unhandled event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[asaas-webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
