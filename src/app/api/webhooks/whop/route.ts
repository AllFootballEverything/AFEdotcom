import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { deactivateMember, patchMember } from "@/lib/members";
import { type Tier, isTier } from "@/lib/tiers";
import { getTierMap, isActiveStatus } from "@/lib/whop/config";
import { type WhopWebhookEvent, verifyWhopSignature } from "@/lib/whop/webhook";

export const dynamic = "force-dynamic";
// The raw body is needed byte-for-byte for signature verification, so this
// route must run on Node rather than the edge JSON-parsing path.
export const runtime = "nodejs";

/**
 * Whop membership webhook.
 *
 * Configure at Whop dashboard -> Developer -> your app -> Webhooks:
 *   URL:    https://<site>/api/webhooks/whop
 *   Events: membership.activated, membership.deactivated,
 *           membership.trial_ending_soon, payment.succeeded
 *
 * Keeps the Sanity `member` mirror in step with Whop so that gated pages can
 * be rendered from a single fast read. See `src/lib/members.ts`.
 */

/**
 * Whop payloads have shifted between flat (`user_id`) and nested (`user: {id}`)
 * shapes across API versions, so read both rather than assuming one.
 */
function pick(data: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = key.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object" && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, data);

    if (typeof value === "string" && value) return value;
  }
  return null;
}

function resolveTier(data: Record<string, unknown>): Tier | null {
  const map = getTierMap();
  const planId = pick(data, "plan_id", "plan.id");
  const productId = pick(data, "product_id", "product.id");

  const fromPlan = planId ? map.get(planId) : undefined;
  if (fromPlan) return fromPlan;

  const fromProduct = productId ? map.get(productId) : undefined;
  if (fromProduct) return fromProduct;

  // Some payloads carry the tier directly if the plan was named to match.
  const explicit = pick(data, "tier");
  return isTier(explicit) ? explicit : null;
}

function resolveRenewsAt(data: Record<string, unknown>): string | null {
  const raw = data.renewal_period_end ?? data.expires_at ?? data.valid_until;
  if (raw === null || raw === undefined) return null;

  const date =
    typeof raw === "number" ? new Date(raw * 1000) : new Date(String(raw));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function POST(request: NextRequest) {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[whop-webhook] WHOP_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const body = await request.text();

  const verification = verifyWhopSignature({
    secret,
    id: request.headers.get("webhook-id"),
    timestamp: request.headers.get("webhook-timestamp"),
    signatureHeader: request.headers.get("webhook-signature"),
    body,
  });

  if (!verification.ok) {
    console.warn(`[whop-webhook] rejected: ${verification.reason}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: WhopWebhookEvent;
  try {
    event = JSON.parse(body) as WhopWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const data = (event.data ?? {}) as Record<string, unknown>;
  const whopUserId = pick(data, "user_id", "user.id", "member.user.id");

  if (!whopUserId) {
    // Not every subscribed event is user-scoped (ledger events, for example).
    // Acknowledge so Whop does not retry something we will never act on.
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const membershipId = pick(data, "id", "membership_id", "membership.id");
  const status = pick(data, "status", "membership.status");

  try {
    switch (event.type) {
      case "membership.activated":
      case "membership.trial_ending_soon": {
        const tier = resolveTier(data);
        if (!tier) {
          console.warn(
            `[whop-webhook] no tier mapping for ${event.type}; check WHOP_TIER_MAP`,
            { plan: pick(data, "plan_id", "plan.id"), product: pick(data, "product_id", "product.id") },
          );
        }
        await patchMember(whopUserId, {
          ...(tier && { tier }),
          status: status && isActiveStatus(status) ? status : "active",
          ...(membershipId && { whopMembershipId: membershipId }),
          renewsAt: resolveRenewsAt(data),
          ...(pick(data, "user.email", "email") && {
            email: pick(data, "user.email", "email") as string,
          }),
          ...(pick(data, "user.username", "username") && {
            username: pick(data, "user.username", "username") as string,
          }),
        });
        break;
      }

      case "membership.deactivated": {
        // Clears the tier as well as the status — `getStoredMember` reads tier
        // directly, so a stale tier would keep gated content unlocked.
        await deactivateMember(whopUserId, {
          status: status ?? "cancelled",
          ...(membershipId && { membershipId }),
        });
        break;
      }

      case "payment.succeeded": {
        // Renewal — refresh the expiry window but leave the tier alone.
        await patchMember(whopUserId, {
          status: "active",
          renewsAt: resolveRenewsAt(data),
        });
        break;
      }

      default:
        return NextResponse.json({ ok: true, ignored: event.type });
    }
  } catch (error) {
    console.error(`[whop-webhook] failed handling ${event.type}`, error);
    // 500 so Whop retries — a dropped membership change is worse than a dupe.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  revalidateTag("member");

  return NextResponse.json({ ok: true, handled: event.type });
}
