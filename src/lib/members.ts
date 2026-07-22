import "server-only";

import { groq } from "next-sanity";

import { getWriteClient } from "@/sanity/client";
import { type Tier, isTier } from "@/lib/tiers";

/**
 * The `member` document is a mirror of Whop membership state.
 *
 * Whop remains the source of truth for billing; this mirror exists so that
 * rendering a gated page is a single fast Sanity read instead of a round trip
 * to the Whop API on every request.
 *
 * Document ids are derived from the Whop user id so that writes are idempotent
 * — a replayed webhook overwrites rather than duplicating.
 */

export type MemberRecord = {
  whopUserId: string;
  email?: string;
  username?: string;
  tier?: Tier;
  status?: string;
  whopMembershipId?: string;
  joinedAt?: string;
  renewsAt?: string | null;
};

/** Sanity ids allow [A-Za-z0-9._-]; anything else is replaced. */
export function memberDocId(whopUserId: string): string {
  return `member.${whopUserId.replace(/[^A-Za-z0-9._-]/g, "-")}`;
}

export async function upsertMember(record: MemberRecord): Promise<void> {
  const client = getWriteClient();
  const _id = memberDocId(record.whopUserId);
  const now = new Date().toISOString();

  const fields = {
    whopUserId: record.whopUserId,
    ...(record.email !== undefined && { email: record.email }),
    ...(record.username !== undefined && { username: record.username }),
    ...(record.tier !== undefined && { tier: record.tier }),
    ...(record.status !== undefined && { status: record.status }),
    ...(record.whopMembershipId !== undefined && {
      whopMembershipId: record.whopMembershipId,
    }),
    ...(record.renewsAt !== undefined && { renewsAt: record.renewsAt }),
    lastSyncedAt: now,
  };

  // Patch-with-setIfMissing rather than createOrReplace: this runs on every
  // sign-in, and createOrReplace would reset joinedAt each time — so a member
  // of two years would always look like they joined today.
  await client
    .patch(_id)
    .setIfMissing({
      _type: "member",
      whopUserId: record.whopUserId,
      joinedAt: record.joinedAt ?? now,
    })
    .set(fields)
    .commit()
    .catch(async (error) => {
      // No document yet — patch cannot create one, so make it here.
      if (error?.statusCode !== 404) throw error;
      await client.createIfNotExists({
        _id,
        _type: "member",
        joinedAt: record.joinedAt ?? now,
        ...fields,
      });
    });
}

/**
 * Patch an existing member without resetting joinedAt. Used by the webhook,
 * which may fire for a user we already know about.
 */
export async function patchMember(
  whopUserId: string,
  fields: Partial<Omit<MemberRecord, "whopUserId">>,
): Promise<void> {
  const client = getWriteClient();
  const _id = memberDocId(whopUserId);
  const now = new Date().toISOString();

  await client
    .patch(_id)
    .setIfMissing({
      _type: "member",
      whopUserId,
      joinedAt: now,
    })
    .set({ ...fields, lastSyncedAt: now })
    .commit()
    .catch(async (error) => {
      if (error?.statusCode !== 404) throw error;
      await upsertMember({ whopUserId, ...fields });
    });
}

/**
 * Revoke a membership.
 *
 * `tier` is *unset*, not set to undefined — a `.set({ tier: undefined })`
 * patch is a no-op in Sanity, which would silently leave the old tier in place
 * and keep gated content unlocked after a cancellation.
 */
export async function deactivateMember(
  whopUserId: string,
  { status = "cancelled", membershipId }: { status?: string; membershipId?: string } = {},
): Promise<void> {
  const client = getWriteClient();
  const _id = memberDocId(whopUserId);

  await client
    .patch(_id)
    .setIfMissing({ _type: "member", whopUserId, joinedAt: new Date().toISOString() })
    .unset(["tier"])
    .set({
      status,
      ...(membershipId && { whopMembershipId: membershipId }),
      lastSyncedAt: new Date().toISOString(),
    })
    .commit()
    .catch(async (error) => {
      if (error?.statusCode !== 404) throw error;
      await upsertMember({ whopUserId, status });
    });
}

export type StoredMember = {
  tier: Tier | null;
  status: string | null;
  renewsAt: string | null;
};

/**
 * Read the mirrored membership.
 *
 * Deliberately uses the non-CDN client: a member who just cancelled must lose
 * access immediately, and CDN staleness would keep the door open.
 */
export async function getStoredMember(
  whopUserId: string,
): Promise<StoredMember | null> {
  const client = getWriteClient();

  const result = await client.fetch<{
    tier?: string;
    status?: string;
    renewsAt?: string;
  } | null>(
    groq`*[_type == "member" && whopUserId == $whopUserId][0]{ tier, status, renewsAt }`,
    { whopUserId },
  );

  if (!result) return null;

  return {
    tier: isTier(result.tier) ? result.tier : null,
    status: result.status ?? null,
    renewsAt: result.renewsAt ?? null,
  };
}
