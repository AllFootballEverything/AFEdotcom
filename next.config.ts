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
};

export default nextConfig;
