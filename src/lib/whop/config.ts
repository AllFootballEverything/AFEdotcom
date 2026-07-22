import "server-only";

import { type Tier, isTier } from "@/lib/tiers";

/**
 * Whop endpoints, verified against docs.whop.com (July 2026).
 *
 *   OAuth 2.1 + PKCE + OIDC   https://docs.whop.com/developer/guides/oauth
 *   REST v1                   https://docs.whop.com/developer/api/getting-started
 */
export const WHOP_AUTHORIZE_URL = "https://api.whop.com/oauth/authorize";
export const WHOP_TOKEN_URL = "https://api.whop.com/oauth/token";
export const WHOP_USERINFO_URL = "https://api.whop.com/oauth/userinfo";
export const WHOP_REVOKE_URL = "https://api.whop.com/oauth/revoke";
export const WHOP_API_BASE = "https://api.whop.com/api/v1";

/** OIDC scopes. `profile` gives us username and avatar, `email` the address. */
export const WHOP_SCOPES = "openid profile email";

/**
 * Maps a Whop plan or product id to an AFE tier.
 *
 * Configured through WHOP_TIER_MAP as `id:tier` pairs, e.g.
 *   plan_abc:scout,plan_def:access,prod_ghi:elite
 *
 * Both plan ids and product ids are accepted so the mapping keeps working if
 * pricing is restructured into new plans under the same product.
 */
export function getTierMap(): Map<string, Tier> {
  const raw = process.env.WHOP_TIER_MAP ?? "";
  const map = new Map<string, Tier>();

  for (const pair of raw.split(",")) {
    const trimmed = pair.trim();
    if (!trimmed) continue;

    // rsplit on ":" — Whop ids never contain a colon, but be defensive.
    const separator = trimmed.lastIndexOf(":");
    if (separator === -1) continue;

    const id = trimmed.slice(0, separator).trim();
    const tier = trimmed.slice(separator + 1).trim().toLowerCase();

    if (id && isTier(tier)) map.set(id, tier);
  }

  return map;
}

/**
 * Membership statuses Whop reports that should grant access.
 * Anything else (canceled, expired, past_due, unresolved) does not.
 */
const ACTIVE_STATUSES = new Set(["active", "trialing", "completed"]);

export function isActiveStatus(status: string | null | undefined): boolean {
  return !!status && ACTIVE_STATUSES.has(status.toLowerCase());
}
