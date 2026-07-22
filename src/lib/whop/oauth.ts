import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { requireEnv } from "@/lib/env";

import {
  WHOP_AUTHORIZE_URL,
  WHOP_SCOPES,
  WHOP_TOKEN_URL,
  WHOP_USERINFO_URL,
} from "./config";

/** base64url without padding, as required by RFC 7636. */
function base64url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function createPkcePair() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function createState(): string {
  return base64url(randomBytes(16));
}

export function buildAuthorizeUrl({
  state,
  codeChallenge,
}: {
  state: string;
  codeChallenge: string;
}): string {
  const url = new URL(WHOP_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", requireEnv("WHOP_CLIENT_ID"));
  url.searchParams.set("redirect_uri", requireEnv("WHOP_REDIRECT_URI"));
  url.searchParams.set("scope", WHOP_SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export type WhopTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
};

export async function exchangeCodeForTokens({
  code,
  codeVerifier,
}: {
  code: string;
  codeVerifier: string;
}): Promise<WhopTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: requireEnv("WHOP_REDIRECT_URI"),
    client_id: requireEnv("WHOP_CLIENT_ID"),
    client_secret: requireEnv("WHOP_CLIENT_SECRET"),
    code_verifier: codeVerifier,
  });

  const response = await fetch(WHOP_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Whop token exchange failed (${response.status}): ${detail.slice(0, 300)}`,
    );
  }

  return (await response.json()) as WhopTokenResponse;
}

export type WhopUserInfo = {
  /** Whop user id. */
  sub: string;
  name?: string;
  preferred_username?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
};

export async function fetchUserInfo(accessToken: string): Promise<WhopUserInfo> {
  const response = await fetch(WHOP_USERINFO_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Whop userinfo failed (${response.status}): ${detail.slice(0, 300)}`,
    );
  }

  return (await response.json()) as WhopUserInfo;
}
