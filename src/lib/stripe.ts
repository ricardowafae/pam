import { loadStripe, type Stripe as StripeClient } from "@stripe/stripe-js";

let stripePromise: Promise<StripeClient | null>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
}

/**
 * Initiates Stripe Checkout by calling the API route.
 */
export async function createCheckoutSession(params: {
  items: Array<{ slug: string; quantity: number }>;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  paymentMethod: "cartao" | "pix";
  couponCode?: string;
  influencerSlug?: string;
}) {
  const response = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao criar checkout");
  }

  const data = await response.json();

  // Redirect to Stripe Checkout
  if (data.url) {
    window.location.href = data.url;
  }

  return data;
}
