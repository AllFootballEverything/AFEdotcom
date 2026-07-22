/**
 * Environment access helpers.
 *
 * `requireEnv` throws at call time rather than module-load time so that a
 * missing integration secret breaks only the route that needs it — the rest of
 * the marketing site still renders and deploys.
 */

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example.`,
    );
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
