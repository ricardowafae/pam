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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      customerEmail,
      customerName,
      customerPhone,
      paymentMethod,
      couponCode,
      influencerSlug,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Carrinho vazio" },
        { status: 400 }
      );
    }

    // Fetch products from Supabase to get real prices
    const productSlugs = items.map((i: { slug: string }) => i.slug);
    const { data: products, error: prodError } = await supabaseAdmin
      .from("products")
      .select("*")
      .in("slug", productSlugs)
      .eq("active", true);

    if (prodError || !products?.length) {
      return NextResponse.json(
        { error: "Produtos nao encontrados" },
        { status: 400 }
      );
    }

    // Calculate line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = products.find(
        (p: { slug: string }) => p.slug === item.slug
      );
      if (!product) continue;

      const qty = item.quantity || 1;
      subtotal += product.base_price * qty;

      lineItems.push({
        price_data: {
          currency: "brl",
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.image_url ? [product.image_url] : undefined,
          },
          unit_amount: Math.round(product.base_price * 100), // Stripe uses cents
        },
        quantity: qty,
      });
    }

    // Apply volume discount if applicable
    let discountAmount = 0;
    const totalDogbookQty = items
      .filter((i: { slug: string }) => i.slug === "dogbook")
      .reduce(
        (sum: number, i: { quantity: number }) => sum + (i.quantity || 1),
        0
      );

    if (totalDogbookQty >= 2) {
      const { data: volumeDiscounts } = await supabaseAdmin
        .from("volume_discounts")
        .select("*")
        .eq("active", true)
        .order("min_qty", { ascending: true });

      if (volumeDiscounts) {
        const applicable = volumeDiscounts.find(
          (vd: { min_qty: number; max_qty: number | null }) =>
            totalDogbookQty >= vd.min_qty &&
            (vd.max_qty === null || totalDogbookQty <= vd.max_qty)
        );
        if (applicable) {
          const dogbookProduct = products.find(
            (p: { slug: string }) => p.slug === "dogbook"
          );
          if (dogbookProduct) {
            discountAmount =
              dogbookProduct.base_price *
              totalDogbookQty *
              (applicable.discount_pct / 100);
          }
        }
      }
    }

    // Apply coupon
    let couponId: string | null = null;
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("active", true)
        .single();

      if (coupon) {
        couponId = coupon.id;
        if (coupon.coupon_type === "fixo") {
          discountAmount += coupon.discount_value;
        } else {
          discountAmount += subtotal * (coupon.discount_value / 100);
        }
      }
    }

    // Look up influencer
    let influencerId: string | null = null;
    if (influencerSlug) {
      const { data: influencer } = await supabaseAdmin
        .from("influencers")
        .select("id")
        .eq("slug", influencerSlug)
        .eq("status", "ativo")
        .single();
      if (influencer) influencerId = influencer.id;
    }

    // Find or create customer
    let customerId: string | null = null;
    if (customerEmail) {
      const { data: existingCustomer } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("email", customerEmail)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer } = await supabaseAdmin
          .from("customers")
          .insert({
            name: customerName || "",
            email: customerEmail,
            phone: customerPhone || null,
          })
          .select("id")
          .single();
        if (newCustomer) customerId = newCustomer.id;
      }
    }

    // Create order in Supabase
    const total = Math.max(subtotal - discountAmount, 0);
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: customerId,
        subtotal,
        discount_amount: discountAmount,
        total,
        payment_method: paymentMethod === "pix" ? "pix" : "cartao",
        coupon_id: couponId,
        influencer_id: influencerId,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Erro ao criar pedido" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map(
      (item: { slug: string; quantity: number }) => {
        const product = products.find(
          (p: { slug: string }) => p.slug === item.slug
        );
        return {
          order_id: order.id,
          product_id: product?.id,
          quantity: item.quantity || 1,
          unit_price: product?.base_price || 0,
          total_price: (product?.base_price || 0) * (item.quantity || 1),
        };
      }
    );

    await supabaseAdmin.from("order_items").insert(orderItems);

    // Apply discount as Stripe coupon if needed
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (discountAmount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: "brl",
        duration: "once",
        name: couponCode
          ? `Cupom ${couponCode}`
          : `Desconto progressivo (${totalDogbookQty} dogbooks)`,
      });
      discounts.push({ coupon: stripeCoupon.id });
    }

    // Create Stripe Checkout Session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      ui_mode: "embedded",
      mode: "payment",
      payment_method_types:
        paymentMethod === "pix" ? ["boleto", "card"] : ["card"],
      line_items: lineItems,
      customer_email: customerEmail || undefined,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        influencer_id: influencerId || "",
        coupon_code: couponCode || "",
      },
      return_url: `${siteUrl}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      locale: "pt-BR",
    };

    // Stripe doesn't allow both allow_promotion_codes and discounts
    if (discounts.length > 0) {
      sessionParams.discounts = discounts;
    }

    // Add installments for card payments
    if (paymentMethod !== "pix") {
      sessionParams.payment_method_options = {
        card: {
          installments: { enabled: true },
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Update order with Stripe session ID
    await supabaseAdmin
      .from("orders")
      .update({ stripe_checkout_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({
      clientSecret: session.client_secret,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
