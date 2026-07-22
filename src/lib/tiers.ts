/**
 * AFE membership tiers.
 *
 * Tiers are strictly ordered — Access includes everything in Scout, Elite
 * includes everything in Access — so access checks are a rank comparison, not
 * a set membership test.
 *
 * This module is imported by both the Sanity schema and the runtime gating
 * helpers so the two can never drift apart.
 */

export const TIERS = ["scout", "access", "elite"] as const;
export type Tier = (typeof TIERS)[number];

/** `public` means "no membership required". */
export type Visibility = "public" | Tier;

export const TIER_RANK: Record<Tier, number> = {
  scout: 1,
  access: 2,
  elite: 3,
};

export const TIER_LABEL: Record<Tier, string> = {
  scout: "AFE Scout",
  access: "AFE Access",
  elite: "AFE Elite",
};

/** Short uppercase badge text, as used on cards in the design. */
export const TIER_BADGE: Record<Tier, string> = {
  scout: "SCOUT",
  access: "ACCESS",
  elite: "ELITE",
};

export function isTier(value: unknown): value is Tier {
  return typeof value === "string" && (TIERS as readonly string[]).includes(value);
}

/**
 * Can a viewer holding `viewerTier` (null = signed out or lapsed) see content
 * marked `required`?
 */
export function canAccess(
  viewerTier: Tier | null,
  required: Visibility,
): boolean {
  if (required === "public") return true;
  if (!viewerTier) return false;
  return TIER_RANK[viewerTier] >= TIER_RANK[required];
}

/**
 * Highest tier from a list of active memberships. Whop can return more than
 * one active membership per user, so we always resolve to the strongest.
 */
export function highestTier(tiers: readonly Tier[]): Tier | null {
  let best: Tier | null = null;
  for (const tier of tiers) {
    if (!best || TIER_RANK[tier] > TIER_RANK[best]) best = tier;
  }
  return best;
}
