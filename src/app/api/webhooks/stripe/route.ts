import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { requireEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Stripe webhook.
 *
 * Configure with:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe   (local)
 *   Dashboard -> Developers -> Webhooks -> checkout.session.completed  (prod)
 *
 * Stripe sends the receipt, so this exists to give AFE a record of what sold
 * and to hang fulfilment off later.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  // Raw body — Stripe's signature covers the exact bytes sent.
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET"),
    );
  } catch (error) {
    console.warn("[stripe-webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("[stripe-webhook] order paid", {
        sessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
        email: session.customer_details?.email,
        product: session.metadata?.productSlug,
        size: session.metadata?.size,
        memberTier: session.metadata?.memberTier || null,
      });
      // Fulfilment hook: decrement stock, notify the team, push to a 3PL.
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
