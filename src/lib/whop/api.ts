import "server-only";

import { type Tier, highestTier } from "@/lib/tiers";

import { WHOP_API_BASE, getTierMap, isActiveStatus } from "./config";

/**
 * Membership as returned by GET /api/v1/memberships.
 * Only the fields we actually rely on are typed.
 */
export type WhopMembership = {
  id: string;
  status: string;
  user?: { id?: string } | null;
  plan?: { id?: string } | null;
  product?: { id?: string } | null;
  renewal_period_end?: number | string | null;
  canceled_at?: number | string | null;
};

export type ResolvedMembership = {
  tier: Tier;
  membershipId: string;
  status: string;
  renewsAt: string | null;
};

/**
 * Look up a user's memberships directly from Whop.
 *
 * This is a *backfill* path, used at sign-in to catch members who joined
 * before the webhook was live or whose event was missed. Steady-state tier
 * data comes from the `member` documents the webhook maintains in Sanity.
 *
 * Best-effort by design: on any failure it returns null and the caller falls
 * back to the mirrored data rather than blocking the login.
 */
export async function fetchMembershipsForUser(
  whopUserId: string,
): Promise<WhopMembership[] | null> {
  const apiKey = process.env.WHOP_API_KEY;
  const companyId = process.env.WHOP_COMPANY_ID;

  if (!apiKey || !companyId) return null;

  const url = new URL(`${WHOP_API_BASE}/memberships`);
  url.searchParams.set("company_id", companyId);
  url.searchParams.set("user_ids", whopUserId);

  try {
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `[whop] memberships lookup failed (${response.status}) for ${whopUserId}`,
      );
      return null;
    }

    const payload = (await response.json()) as { data?: WhopMembership[] };
    const all = payload.data ?? [];

    // The user_ids filter is applied server-side, but double-check rather than
    // trusting it — a filter that silently no-ops would leak other members.
    return all.filter((m) => !m.user?.id || m.user.id === whopUserId);
  } catch (error) {
    console.error("[whop] memberships lookup threw", error);
    return null;
  }
}

/** Turn a plan/product id into an AFE tier using WHOP_TIER_MAP. */
export function tierForMembership(membership: WhopMembership): Tier | null {
  const map = getTierMap();
  const planId = membership.plan?.id;
  const productId = membership.product?.id;
  return (planId && map.get(planId)) || (productId && map.get(productId)) || null;
}

function toIsoString(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  // Whop returns unix seconds for renewal_period_end.
  const date =
    typeof value === "number" ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Reduce a list of memberships to the single strongest active entitlement.
 * A user can hold several memberships; the highest tier wins.
 */
export function resolveEntitlement(
  memberships: WhopMembership[],
): ResolvedMembership | null {
  const active = memberships.filter((m) => isActiveStatus(m.status));

  const candidates = active
    .map((membership) => {
      const tier = tierForMembership(membership);
      return tier ? { membership, tier } : null;
    })
    .filter((entry): entry is { membership: WhopMembership; tier: Tier } => !!entry);

  if (candidates.length === 0) return null;

  const best = highestTier(candidates.map((c) => c.tier));
  if (!best) return null;

  const winner = candidates.find((c) => c.tier === best);
  if (!winner) return null;

  return {
    tier: best,
    membershipId: winner.membership.id,
    status: winner.membership.status,
    renewsAt: toIsoString(winner.membership.renewal_period_end),
  };
}
