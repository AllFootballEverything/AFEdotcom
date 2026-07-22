import "server-only";

/**
 * Run a Sanity read, falling back to a default if it fails.
 *
 * The site ships with sensible design defaults baked into the components, so
 * an empty dataset or a transient Sanity outage should degrade to "looks like
 * the design" rather than a 500. Configuration errors (a missing projectId)
 * still throw at import time, which is what we want — those need fixing, not
 * papering over.
 */
export async function safeFetch<T>(
  read: () => Promise<T>,
  fallback: T,
  label: string,
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    console.error(`[sanity] ${label} failed`, error);
    return fallback;
  }
}
