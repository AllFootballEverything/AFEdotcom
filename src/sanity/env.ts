/**
 * Sanity configuration.
 *
 * Nothing here throws at module load. It used to, following the standard
 * Sanity template, and the result was that a deploy with no environment
 * configured failed during Next's "collect page data" step with a stack trace
 * pointing at whichever route happened to import the client first — typically
 * an auth route with no connection to Sanity at all.
 *
 * Instead the client is created lazily (see `client.ts`) and read failures are
 * absorbed by `safeFetch`, so an unconfigured deploy builds and renders the
 * design defaults rather than dying. `isSanityConfigured` is the flag to check
 * when you need to know.
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-07-22";

/** Sanity's own default dataset name — no reason to require it explicitly. */
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/** No sensible default exists for this one; empty means "not configured". */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

export const isSanityConfigured = projectId.length > 0;

export const SANITY_SETUP_HINT =
  "Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID (and optionally " +
  "NEXT_PUBLIC_SANITY_DATASET, which defaults to 'production'). See README.md.";
