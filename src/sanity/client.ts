import "server-only";

import { type SanityClient, createClient } from "next-sanity";

import { SANITY_SETUP_HINT, apiVersion, dataset, isSanityConfigured, projectId } from "./env";

/**
 * Clients are built on first use, never at module load.
 *
 * `next build` evaluates every route module to collect page data. A client
 * constructed at module scope turns a missing environment variable into a
 * hard build failure attributed to an unrelated route, which is a miserable
 * thing to debug. Deferring construction keeps the failure where it belongs:
 * at the point something actually tries to read content.
 */

let readClient: SanityClient | null = null;
let writeClient: SanityClient | null = null;

/**
 * Read-only client for rendering pages. CDN-backed and cached; content updates
 * reach the site through the revalidation webhook in
 * `src/app/api/revalidate/route.ts`.
 *
 * Throws when Sanity is unconfigured — callers go through `safeFetch`, which
 * logs and falls back to the design defaults.
 */
export function getSanityClient(): SanityClient {
  if (!isSanityConfigured) throw new Error(SANITY_SETUP_HINT);

  if (!readClient) {
    readClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    });
  }
  return readClient;
}

/**
 * Write client for server actions and webhooks (booking enquiries, Whop member
 * sync). Requires SANITY_API_WRITE_TOKEN — never expose this to the browser.
 */
export function getWriteClient(): SanityClient {
  if (!isSanityConfigured) throw new Error(SANITY_SETUP_HINT);

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Missing SANITY_API_WRITE_TOKEN — required for write operations.",
    );
  }

  if (!writeClient) {
    writeClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token,
    });
  }
  return writeClient;
}
