import "server-only";

import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "./env";

/**
 * Read-only client for rendering pages. CDN-backed and cached; content updates
 * reach the site through the revalidation webhook in
 * `src/app/api/revalidate/route.ts`.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

/**
 * Write client for server actions and webhooks (booking enquiries, Whop member
 * sync). Requires SANITY_API_WRITE_TOKEN — never expose this to the browser.
 */
export function getWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Missing SANITY_API_WRITE_TOKEN — required for write operations.",
    );
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });
}
