import "server-only";

import { cache } from "react";

import { getStoredMember } from "@/lib/members";
import { type Tier, type Visibility, canAccess } from "@/lib/tiers";

import { readSession } from "./session";

/**
 * The current viewer, as every server component should see them.
 *
 * `cache()` dedupes the Sanity lookup within a single render pass, so a page
 * with a dozen gated cards still performs exactly one membership read.
 */

export type Viewer = {
  isSignedIn: boolean;
  whopUserId: string | null;
  name: string | null;
  username: string | null;
  email: string | null;
  picture: string | null;
  /** null means signed out, or signed in with no active membership. */
  tier: Tier | null;
  membershipStatus: string | null;
};

const ANONYMOUS: Viewer = {
  isSignedIn: false,
  whopUserId: null,
  name: null,
  username: null,
  email: null,
  picture: null,
  tier: null,
  membershipStatus: null,
};

export const getViewer = cache(async (): Promise<Viewer> => {
  const session = await readSession();
  if (!session) return ANONYMOUS;

  const base: Viewer = {
    isSignedIn: true,
    whopUserId: session.sub,
    name: session.name ?? null,
    username: session.username ?? null,
    email: session.email ?? null,
    picture: session.picture ?? null,
    tier: null,
    membershipStatus: null,
  };

  try {
    const member = await getStoredMember(session.sub);
    if (!member) return base;

    return { ...base, tier: member.tier, membershipStatus: member.status };
  } catch (error) {
    // A Sanity outage should not sign everyone out — it should just mean nobody
    // is treated as a member for the duration. Failing closed is the safe side.
    console.error("[auth] membership lookup failed", error);
    return base;
  }
});

/** Convenience wrapper used throughout the page components. */
export async function viewerCanAccess(required: Visibility): Promise<boolean> {
  const viewer = await getViewer();
  return canAccess(viewer.tier, required);
}
