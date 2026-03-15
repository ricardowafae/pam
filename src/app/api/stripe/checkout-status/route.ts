import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id é obrigatório" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      orderNumber: session.metadata?.order_number || null,
      customerEmail: session.customer_email || null,
    });
  } catch (error) {
    console.error("Checkout status error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status do pagamento" },
      { status: 500 }
    );
  }
}
