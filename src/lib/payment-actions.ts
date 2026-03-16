/* ═══════════════════════════════════════════════════════════════════════════
   Shared Post-Payment Actions
   Used by both webhook handler and synchronous credit card confirmations.
   All functions are idempotent (safe to call multiple times).
   ═══════════════════════════════════════════════════════════════════════════ */

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Handle successful payment: update order, dogbooks, photo sessions,
 * leads, coupon usage, and influencer commissions.
 */
export async function handlePaymentSuccess(
  orderId: string,
  paymentAmount: number,
  couponCode?: string,
  influencerId?: string
): Promise<void> {
  // Check idempotency — skip if already paid
  const { data: existingOrder } = await supabaseAdmin
    .from("orders")
    .select("payment_status, customer_id, coupon_id, influencer_id")
    .eq("id", orderId)
    .single();

  if (!existingOrder || existingOrder.payment_status === "pago") {
    return; // Already processed
  }

  // Use influencer_id from order if not provided
  const effectiveInfluencerId =
    influencerId || existingOrder.influencer_id;

  // 1. Update order status
  await supabaseAdmin
    .from("orders")
    .update({
      status: "pago",
      payment_status: "pago",
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  // 2. Update dogbooks stage
  await supabaseAdmin
    .from("dogbooks")
    .update({ stage: "aguardando_fotos" })
    .eq("order_id", orderId)
    .eq("stage", "aguardando_pagamento");

  // 3. Update photo sessions
  await supabaseAdmin
    .from("photo_sessions")
    .update({
      status: "agendada",
      payment_status: "pago",
    })
    .eq("order_id", orderId)
    .eq("payment_status", "pendente");

  // 4. Update lead status
  if (existingOrder.customer_id) {
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("email")
      .eq("id", existingOrder.customer_id)
      .single();

    if (customer?.email) {
      await supabaseAdmin
        .from("leads")
        .update({ status: "convertido", recovered: false })
        .eq("email", customer.email)
        .neq("status", "convertido");
    }
  }

  // 5. Record coupon usage
  const effectiveCouponCode = couponCode;
  if (effectiveCouponCode) {
    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("id")
      .eq("code", effectiveCouponCode)
      .single();

    if (coupon && existingOrder.customer_id) {
      await supabaseAdmin.from("coupon_usages").insert({
        coupon_id: coupon.id,
        order_id: orderId,
        customer_id: existingOrder.customer_id,
      });
    }
  }

  // 6. Create influencer commission
  if (effectiveInfluencerId) {
    const { data: influencer } = await supabaseAdmin
      .from("influencers")
      .select("commission_per_sale")
      .eq("id", effectiveInfluencerId)
      .single();

    if (influencer) {
      const now = new Date();
      await supabaseAdmin.from("commissions").insert({
        influencer_id: effectiveInfluencerId,
        order_id: orderId,
        total_sale_value: paymentAmount,
        commission_pct: 0,
        commission_amount: influencer.commission_per_sale,
        period_month: now.getMonth() + 1,
        period_year: now.getFullYear(),
      });
    }
  }

  console.log(`[payment-actions] Order ${orderId} paid successfully`);
}

/**
 * Handle payment failure: update order status and lead.
 */
export async function handlePaymentFailure(orderId: string): Promise<void> {
  await supabaseAdmin
    .from("orders")
    .update({ payment_status: "falhou" })
    .eq("id", orderId);

  // Update lead
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("customer_id")
    .eq("id", orderId)
    .single();

  if (order?.customer_id) {
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("email")
      .eq("id", order.customer_id)
      .single();

    if (customer?.email) {
      await supabaseAdmin
        .from("leads")
        .update({ status: "pagamento_falhou" })
        .eq("email", customer.email)
        .in("status", ["carrinho", "checkout_iniciado", "visitante"]);
    }
  }

  console.log(`[payment-actions] Order ${orderId} payment failed`);
}

/**
 * Handle refund: update order to cancelled/refunded.
 */
export async function handlePaymentRefund(orderId: string): Promise<void> {
  await supabaseAdmin
    .from("orders")
    .update({
      status: "cancelado",
      payment_status: "reembolsado",
    })
    .eq("id", orderId);

  console.log(`[payment-actions] Order ${orderId} refunded`);
}

/**
 * Handle overdue/expired payment.
 */
export async function handlePaymentExpired(orderId: string): Promise<void> {
  await supabaseAdmin
    .from("orders")
    .update({ payment_status: "expirado" })
    .eq("id", orderId);

  console.log(`[payment-actions] Order ${orderId} expired`);
}
