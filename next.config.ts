import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "img.whop.com" },
    ],
  },
  // typedRoutes is deliberately off: link targets come from Sanity as plain
  // strings (CTA hrefs, Whop checkout URLs), which a Route-typed `href` rejects.

  // The share-card route reads the brand .otf files at runtime; without this
  // they are not traced into the serverless function and the route 500s on
  // Vercel. Local dev reads them straight from disk regardless.
  outputFileTracingIncludes: {
    "/api/assessment/card": ["./src/fonts/*.otf"],
  },
};

export default nextConfig;
