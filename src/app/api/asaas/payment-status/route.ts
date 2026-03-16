import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPaymentStatus } from "@/lib/asaas";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const paymentId = req.nextUrl.searchParams.get("payment_id");

    if (!paymentId) {
      return NextResponse.json(
        { error: "payment_id obrigatorio" },
        { status: 400 }
      );
    }

    // Fetch payment status from Asaas
    const payment = await getPaymentStatus(paymentId);

    // Map Asaas status to our display status
    let status: "success" | "processing" | "error";
    let paymentStatus: string;

    switch (payment.status) {
      case "CONFIRMED":
      case "RECEIVED":
      case "RECEIVED_IN_CASH":
        status = "success";
        paymentStatus = "paid";
        break;
      case "PENDING":
      case "AWAITING_RISK_ANALYSIS":
        status = "processing";
        paymentStatus = "pending";
        break;
      case "OVERDUE":
        status = "processing";
        paymentStatus = "overdue";
        break;
      case "REFUNDED":
      case "REFUND_REQUESTED":
      case "REFUND_IN_PROGRESS":
        status = "error";
        paymentStatus = "refunded";
        break;
      default:
        status = "error";
        paymentStatus = payment.status?.toLowerCase() || "unknown";
    }

    // Get order details from Supabase
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("order_number, customers(email)")
      .eq("asaas_payment_id", paymentId)
      .single();

    const customerEmail =
      order?.customers &&
      typeof order.customers === "object" &&
      "email" in order.customers
        ? (order.customers as { email: string }).email
        : null;

    return NextResponse.json({
      status,
      paymentStatus,
      orderNumber: order?.order_number || null,
      customerEmail,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status" },
      { status: 500 }
    );
  }
}
