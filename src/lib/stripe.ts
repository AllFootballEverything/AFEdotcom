import "server-only";

import Stripe from "stripe";

import { requireEnv } from "@/lib/env";

let client: Stripe | null = null;

/**
 * Lazily constructed so that a missing key only breaks the shop routes rather
 * than the whole build. No explicit apiVersion — the account default is used,
 * which avoids pinning to a version the installed SDK may not know about.
 */
export function getStripe(): Stripe {
  if (!client) {
    client = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
      typescript: true,
    });
  }
  return client;
}
