import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison.
 *
 * Hashes both sides first so that inputs of different lengths can still be
 * compared without leaking the expected length through an early return.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  const ha = createHmac("sha256", "compare").update(a).digest();
  const hb = createHmac("sha256", "compare").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function hmacSha256Hex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}
