import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { requireEnv } from "@/lib/env";

/**
 * The session cookie carries *identity only* — who signed in with Whop.
 *
 * Entitlement (which tier they hold) is deliberately NOT stored here. It is
 * read per request from the mirrored `member` document, so that a cancellation
 * takes effect on the next page view instead of whenever the cookie happens to
 * expire. See `viewer.ts`.
 */

export const SESSION_COOKIE = "afe_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = {
  /** Whop user id (the OIDC `sub`). */
  sub: string;
  name?: string;
  username?: string;
  email?: string;
  picture?: string;
};

function secretKey(): Uint8Array {
  return new TextEncoder().encode(requireEnv("SESSION_SECRET"));
}

export async function encodeSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer("afe")
    .setAudience("afe-site")
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function decodeSession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: "afe",
      audience: "afe-site",
    });

    if (typeof payload.sub !== "string") return null;

    return {
      sub: payload.sub,
      name: typeof payload.name === "string" ? payload.name : undefined,
      username: typeof payload.username === "string" ? payload.username : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
    };
  } catch {
    // Expired, tampered with, or signed by a rotated secret — all mean "no session".
    return null;
  }
}

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
