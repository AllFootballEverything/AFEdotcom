import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Standard Webhooks signature verification.
 * https://docs.whop.com/developer/guides/webhooks
 *
 *   signed_content = "{webhook-id}.{webhook-timestamp}.{raw body}"
 *   signature      = base64( HMAC-SHA256( base64decode(secret), signed_content ) )
 *
 * The `webhook-signature` header may carry several space-separated versioned
 * signatures ("v1,<sig> v1,<sig>") during a secret rotation; any match passes.
 */

/** Reject events older than this to blunt replay attacks. */
const TOLERANCE_SECONDS = 5 * 60;

export type WebhookVerificationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function verifyWhopSignature({
  secret,
  id,
  timestamp,
  signatureHeader,
  body,
  now = Date.now(),
}: {
  secret: string;
  id: string | null;
  timestamp: string | null;
  signatureHeader: string | null;
  body: string;
  now?: number;
}): WebhookVerificationResult {
  if (!id || !timestamp || !signatureHeader) {
    return { ok: false, reason: "Missing webhook-id, webhook-timestamp or webhook-signature" };
  }

  const sentAt = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(sentAt)) {
    return { ok: false, reason: "webhook-timestamp is not an integer" };
  }

  const driftSeconds = Math.abs(Math.floor(now / 1000) - sentAt);
  if (driftSeconds > TOLERANCE_SECONDS) {
    return { ok: false, reason: `Timestamp outside tolerance (${driftSeconds}s)` };
  }

  // Secrets are distributed as "whsec_<base64>"; the prefix is not part of the key.
  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const key = Buffer.from(rawSecret, "base64");

  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${body}`)
    .digest();

  const provided = signatureHeader
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [version, value] = part.split(",");
      return version === "v1" && value ? value : null;
    })
    .filter((value): value is string => value !== null);

  if (provided.length === 0) {
    return { ok: false, reason: "No v1 signature present in webhook-signature" };
  }

  const matched = provided.some((candidate) => {
    const candidateBuffer = Buffer.from(candidate, "base64");
    if (candidateBuffer.length !== expected.length) return false;
    return timingSafeEqual(candidateBuffer, expected);
  });

  return matched ? { ok: true } : { ok: false, reason: "Signature mismatch" };
}

/** Envelope shape Whop posts: `{ "type": "...", "data": { ... } }`. */
export type WhopWebhookEvent = {
  type: string;
  data: Record<string, unknown>;
};
