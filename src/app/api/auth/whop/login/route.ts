import { type NextRequest, NextResponse } from "next/server";

import { buildAuthorizeUrl, createPkcePair, createState } from "@/lib/whop/oauth";

export const dynamic = "force-dynamic";

/** Short-lived cookies that carry PKCE state across the redirect to Whop. */
const TRANSIENT_MAX_AGE = 10 * 60; // 10 minutes

const transientCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: TRANSIENT_MAX_AGE,
};

/**
 * Only same-origin relative paths may be used as a post-login destination —
 * otherwise `?returnTo=https://evil.example` turns this into an open redirect.
 */
function safeReturnTo(raw: string | null): string {
  if (!raw) return "/members";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/members";
  return raw;
}

export async function GET(request: NextRequest) {
  const state = createState();
  const { verifier, challenge } = createPkcePair();
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));

  let authorizeUrl: string;
  try {
    authorizeUrl = buildAuthorizeUrl({ state, codeChallenge: challenge });
  } catch (error) {
    console.error("[auth] cannot build Whop authorize URL", error);
    return NextResponse.redirect(new URL("/members?error=config", request.url));
  }

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("afe_oauth_state", state, transientCookieOptions);
  response.cookies.set("afe_oauth_verifier", verifier, transientCookieOptions);
  response.cookies.set("afe_oauth_return", returnTo, transientCookieOptions);

  return response;
}
