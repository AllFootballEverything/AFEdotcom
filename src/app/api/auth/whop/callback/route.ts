import { type NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, encodeSession, sessionCookieOptions } from "@/lib/auth/session";
import { timingSafeEqualString } from "@/lib/crypto";
import { upsertMember } from "@/lib/members";
import { fetchMembershipsForUser, resolveEntitlement } from "@/lib/whop/api";
import { exchangeCodeForTokens, fetchUserInfo } from "@/lib/whop/oauth";

export const dynamic = "force-dynamic";

function clearTransientCookies(response: NextResponse) {
  for (const name of ["afe_oauth_state", "afe_oauth_verifier", "afe_oauth_return"]) {
    response.cookies.delete(name);
  }
  return response;
}

function failure(request: NextRequest, reason: string) {
  const url = new URL("/members", request.url);
  url.searchParams.set("error", reason);
  return clearTransientCookies(NextResponse.redirect(url));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // Whop reports user-facing refusals (e.g. "cancel") as an error param.
  const oauthError = params.get("error");
  if (oauthError) {
    return failure(request, oauthError === "access_denied" ? "cancelled" : "oauth");
  }

  const code = params.get("code");
  const state = params.get("state");
  const expectedState = request.cookies.get("afe_oauth_state")?.value;
  const codeVerifier = request.cookies.get("afe_oauth_verifier")?.value;
  const returnTo = request.cookies.get("afe_oauth_return")?.value ?? "/members";

  if (!code || !state || !expectedState || !codeVerifier) {
    return failure(request, "missing_params");
  }

  if (!timingSafeEqualString(state, expectedState)) {
    return failure(request, "state_mismatch");
  }

  let whopUserId: string;
  let sessionToken: string;

  try {
    const tokens = await exchangeCodeForTokens({ code, codeVerifier });
    const user = await fetchUserInfo(tokens.access_token);

    whopUserId = user.sub;
    sessionToken = await encodeSession({
      sub: user.sub,
      name: user.name,
      username: user.preferred_username,
      email: user.email,
      picture: user.picture,
    });

    // Backfill the membership mirror. Members who joined before the webhook
    // existed, or whose event was dropped, get their tier resolved here.
    // Best-effort: a failure must not block a successful sign-in.
    try {
      const memberships = await fetchMembershipsForUser(user.sub);
      if (memberships) {
        const entitlement = resolveEntitlement(memberships);
        await upsertMember({
          whopUserId: user.sub,
          email: user.email,
          username: user.preferred_username,
          tier: entitlement?.tier,
          status: entitlement?.status ?? "expired",
          whopMembershipId: entitlement?.membershipId,
          renewsAt: entitlement?.renewsAt ?? null,
        });
      }
    } catch (error) {
      console.error("[auth] membership backfill failed", error);
    }
  } catch (error) {
    console.error("[auth] Whop callback failed", error);
    return failure(request, "exchange_failed");
  }

  const response = NextResponse.redirect(new URL(returnTo, request.url));
  response.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions);
  return clearTransientCookies(response);
}
