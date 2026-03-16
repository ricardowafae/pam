import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createAsaasCustomer,
  createAsaasPayment,
  getPixQrCode,
  AsaasError,
} from "@/lib/asaas";
import { handlePaymentSuccess } from "@/lib/payment-actions";

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
      cpfCnpj,
      paymentMethod,
      couponCode,
      influencerSlug,
      installmentCount,
      creditCard,
      // Address fields
      postalCode,
      addressNumber,
      addressComplement,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Carrinho vazio" },
        { status: 400 }
      );
    }

    if (!cpfCnpj) {
      return NextResponse.json(
        { error: "CPF/CNPJ obrigatorio" },
        { status: 400 }
      );
    }

    // ── Blacklist check ──
    const cleanCpf = cpfCnpj.replace(/\D/g, "");
    const { data: blocked } = await supabaseAdmin
      .from("customer_blacklist")
      .select("id")
      .eq("cpf_cnpj", cleanCpf)
      .maybeSingle();

    if (blocked) {
      return NextResponse.json(
        { error: "Nao foi possivel processar este pedido. Tente novamente mais tarde." },
        { status: 400 }
      );
    }

    // ── 1. Fetch products from Supabase ──
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

    // ── 2. Calculate subtotal ──
    let subtotal = 0;
    for (const item of items) {
      const product = products.find(
        (p: { slug: string }) => p.slug === item.slug
      );
      if (!product) continue;
      subtotal += product.base_price * (item.quantity || 1);
    }

    // ── 3. Apply volume discount ──
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

    // ── 4. Apply coupon ──
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

    // ── 5. Lookup influencer ──
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

    // ── 6. Find or create customer (Supabase + Asaas) ──
    let customerId: string | null = null;
    let asaasCustomerId: string | null = null;

    if (customerEmail) {
      const { data: existingCustomer } = await supabaseAdmin
        .from("customers")
        .select("id, asaas_customer_id")
        .eq("email", customerEmail)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        asaasCustomerId = existingCustomer.asaas_customer_id;
      } else {
        const { data: newCustomer } = await supabaseAdmin
          .from("customers")
          .insert({
            name: customerName || "",
            email: customerEmail,
            phone: customerPhone || null,
            cpf: cpfCnpj.length <= 11 ? cpfCnpj : null,
            cnpj: cpfCnpj.length > 11 ? cpfCnpj : null,
            person_type: cpfCnpj.length > 11 ? "PJ" : "PF",
          })
          .select("id")
          .single();
        if (newCustomer) customerId = newCustomer.id;
      }

      // Sync with Asaas if no asaas_customer_id yet
      if (!asaasCustomerId) {
        try {
          const asaasCustomer = await createAsaasCustomer({
            name: customerName || customerEmail,
            cpfCnpj: cpfCnpj.replace(/\D/g, ""),
            email: customerEmail,
            mobilePhone: customerPhone?.replace(/\D/g, "") || undefined,
            externalReference: customerId || undefined,
            notificationDisabled: true,
          });
          asaasCustomerId = asaasCustomer.id;

          // Save asaas_customer_id
          if (customerId) {
            await supabaseAdmin
              .from("customers")
              .update({ asaas_customer_id: asaasCustomerId })
              .eq("id", customerId);
          }
        } catch (err) {
          console.error("Error creating Asaas customer:", err);
          return NextResponse.json(
            { error: "Erro ao registrar cliente no gateway de pagamento" },
            { status: 500 }
          );
        }
      }
    }

    if (!asaasCustomerId) {
      return NextResponse.json(
        { error: "Erro ao identificar cliente" },
        { status: 400 }
      );
    }

    // ── 7. Create order in Supabase ──
    const totalBeforePaymentDiscount = Math.max(subtotal - discountAmount, 0);

    // Apply PIX/Boleto discount
    let paymentDiscount = 0;
    if (paymentMethod === "pix" || paymentMethod === "boleto") {
      const { data: paymentConfig } = await supabaseAdmin
        .from("settings")
        .select("value")
        .eq("key", "payment_config")
        .single();

      if (paymentConfig?.value) {
        const config =
          typeof paymentConfig.value === "string"
            ? JSON.parse(paymentConfig.value)
            : paymentConfig.value;
        const discountPct =
          paymentMethod === "pix"
            ? config.pixDiscountPct || 0
            : config.boletoDiscountPct || 0;
        paymentDiscount = totalBeforePaymentDiscount * (discountPct / 100);
      }
    }

    const finalTotal = Math.max(
      totalBeforePaymentDiscount - paymentDiscount,
      0
    );

    const mappedPaymentMethod =
      paymentMethod === "pix"
        ? "pix"
        : paymentMethod === "boleto"
          ? "boleto"
          : "cartao";

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: customerId,
        subtotal,
        discount_amount: discountAmount + paymentDiscount,
        total: finalTotal,
        payment_method: mappedPaymentMethod,
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

    // ── 8. Create order items ──
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

    // ── 9. Create Asaas payment ──
    const today = new Date().toISOString().split("T")[0];
    const billingType =
      paymentMethod === "pix"
        ? "PIX"
        : paymentMethod === "boleto"
          ? "BOLETO"
          : "CREDIT_CARD";

    // Due date: today for card/PIX, +3 days for boleto
    let dueDate = today;
    if (paymentMethod === "boleto") {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      dueDate = d.toISOString().split("T")[0];
    }

    const itemNames = items
      .map((i: { slug: string; quantity: number }) => {
        const p = products.find(
          (prod: { slug: string }) => prod.slug === i.slug
        );
        return `${p?.name || i.slug} x${i.quantity || 1}`;
      })
      .join(", ");

    // Build payment params
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentParams: any = {
      customer: asaasCustomerId,
      billingType,
      value: Math.round(finalTotal * 100) / 100, // 2 decimal places
      dueDate,
      description: `Pedido #${order.order_number} - ${itemNames}`,
      externalReference: order.id,
    };

    // Credit card specifics
    if (paymentMethod === "cartao" && creditCard) {
      // Extract remoteIp from request headers
      const remoteIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "127.0.0.1";

      paymentParams.creditCard = {
        holderName: creditCard.holderName,
        number: creditCard.number.replace(/\D/g, ""),
        expiryMonth: creditCard.expiryMonth,
        expiryYear: creditCard.expiryYear,
        ccv: creditCard.ccv,
      };

      paymentParams.creditCardHolderInfo = {
        name: customerName,
        email: customerEmail,
        cpfCnpj: cpfCnpj.replace(/\D/g, ""),
        postalCode: postalCode?.replace(/\D/g, "") || "",
        addressNumber: addressNumber || "S/N",
        addressComplement: addressComplement || undefined,
        phone: customerPhone?.replace(/\D/g, "") || undefined,
      };

      paymentParams.remoteIp = remoteIp;

      // Installments
      if (installmentCount && installmentCount > 1) {
        paymentParams.installmentCount = installmentCount;
        paymentParams.installmentValue =
          Math.round((finalTotal / installmentCount) * 100) / 100;
        delete paymentParams.value;
      }
    }

    let asaasPayment;
    try {
      asaasPayment = await createAsaasPayment(paymentParams);
    } catch (err) {
      console.error("Asaas payment error:", err);

      // Delete the order since payment failed
      await supabaseAdmin.from("order_items").delete().eq("order_id", order.id);
      await supabaseAdmin.from("orders").delete().eq("id", order.id);

      if (err instanceof AsaasError) {
        return NextResponse.json(
          {
            error:
              err.errors?.[0]?.description ||
              "Erro ao processar pagamento",
            code: err.errors?.[0]?.code,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Erro ao processar pagamento" },
        { status: 500 }
      );
    }

    // ── 10. Update order with asaas_payment_id ──
    await supabaseAdmin
      .from("orders")
      .update({ asaas_payment_id: asaasPayment.id })
      .eq("id", order.id);

    // ── 11. Build response based on payment method ──

    // Credit card: payment is confirmed synchronously
    if (paymentMethod === "cartao") {
      if (
        asaasPayment.status === "CONFIRMED" ||
        asaasPayment.status === "RECEIVED"
      ) {
        // Payment was approved — trigger post-payment actions
        await handlePaymentSuccess(
          order.id,
          finalTotal,
          couponCode,
          influencerId || undefined
        );

        return NextResponse.json({
          success: true,
          status: "approved",
          paymentId: asaasPayment.id,
          orderNumber: order.order_number,
        });
      } else {
        // Card was declined or pending risk analysis
        return NextResponse.json({
          success: false,
          status: "declined",
          error: "Pagamento nao autorizado. Verifique os dados do cartao.",
          orderNumber: order.order_number,
        });
      }
    }

    // PIX: fetch QR code
    if (paymentMethod === "pix") {
      try {
        const pixData = await getPixQrCode(asaasPayment.id);
        return NextResponse.json({
          success: true,
          status: "pending_pix",
          paymentId: asaasPayment.id,
          orderNumber: order.order_number,
          pix: {
            encodedImage: pixData.encodedImage,
            payload: pixData.payload,
            expirationDate: pixData.expirationDate,
          },
        });
      } catch (err) {
        console.error("PIX QR code error:", err);
        return NextResponse.json({
          success: true,
          status: "pending_pix",
          paymentId: asaasPayment.id,
          orderNumber: order.order_number,
          pix: null,
        });
      }
    }

    // Boleto: return bank slip URL
    return NextResponse.json({
      success: true,
      status: "pending_boleto",
      paymentId: asaasPayment.id,
      orderNumber: order.order_number,
      boleto: {
        bankSlipUrl: asaasPayment.bankSlipUrl,
        invoiceUrl: asaasPayment.invoiceUrl,
        dueDate,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
