import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // ── Payment succeeded ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (!orderId) break;

        // Update order status
        await supabaseAdmin
          .from("orders")
          .update({
            status: "pago",
            payment_status: "pago",
            stripe_payment_id: session.payment_intent as string,
            paid_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        // Update associated dogbooks stage
        await supabaseAdmin
          .from("dogbooks")
          .update({ stage: "aguardando_fotos" })
          .eq("order_id", orderId)
          .eq("stage", "aguardando_pagamento");

        // Update associated photo sessions
        await supabaseAdmin
          .from("photo_sessions")
          .update({
            status: "agendada",
            payment_status: "pago",
          })
          .eq("order_id", orderId)
          .eq("payment_status", "pendente");

        // Update lead status if applicable
        const customerEmail = session.customer_email;
        if (customerEmail) {
          await supabaseAdmin
            .from("leads")
            .update({
              status: "convertido",
              recovered: false,
            })
            .eq("email", customerEmail)
            .neq("status", "convertido");
        }

        // Record coupon usage
        const couponCode = session.metadata?.coupon_code;
        if (couponCode) {
          const { data: coupon } = await supabaseAdmin
            .from("coupons")
            .select("id")
            .eq("code", couponCode)
            .single();

          const { data: order } = await supabaseAdmin
            .from("orders")
            .select("customer_id")
            .eq("id", orderId)
            .single();

          if (coupon && order) {
            await supabaseAdmin.from("coupon_usages").insert({
              coupon_id: coupon.id,
              order_id: orderId,
              customer_id: order.customer_id,
            });
          }
        }

        // Create commission if influencer involved
        const influencerId = session.metadata?.influencer_id;
        if (influencerId) {
          const { data: influencer } = await supabaseAdmin
            .from("influencers")
            .select("commission_per_sale")
            .eq("id", influencerId)
            .single();

          if (influencer) {
            const totalAmount = (session.amount_total || 0) / 100;
            const now = new Date();

            await supabaseAdmin.from("commissions").insert({
              influencer_id: influencerId,
              order_id: orderId,
              total_sale_value: totalAmount,
              commission_pct: 0, // fixed per sale
              commission_amount: influencer.commission_per_sale,
              period_month: now.getMonth() + 1,
              period_year: now.getFullYear(),
            });
          }
        }

        console.log(`Order ${orderId} paid successfully`);
        break;
      }

      // ── Payment failed ──
      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        let orderId: string | undefined;

        if (event.type === "checkout.session.expired") {
          const session = event.data.object as Stripe.Checkout.Session;
          orderId = session.metadata?.order_id;
        } else {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          orderId = paymentIntent.metadata?.order_id;
        }

        if (orderId) {
          await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "falhou",
            })
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
                .in("status", [
                  "carrinho",
                  "checkout_iniciado",
                  "visitante",
                ]);
            }
          }
        }
        break;
      }

      // ── Refund ──
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          await supabaseAdmin
            .from("orders")
            .update({
              status: "cancelado",
              payment_status: "reembolsado",
            })
            .eq("stripe_payment_id", paymentIntentId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
