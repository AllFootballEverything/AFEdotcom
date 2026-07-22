import { NextStudio } from "next-sanity/studio";

import { SANITY_SETUP_HINT, isSanityConfigured } from "@/sanity/env";

import config from "../../../../sanity.config";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  // The rest of the site degrades to design defaults without Sanity, but a
  // studio with no project to talk to would boot into an opaque error. Say
  // what is wrong instead.
  if (!isSanityConfigured) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          background: "#1E1E1E",
          color: "#EFEDE8",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ fontSize: 20, margin: "0 0 12px" }}>Studio unavailable</h1>
          <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.8 }}>
            {SANITY_SETUP_HINT}
          </p>
        </div>
      </div>
    );
  }

  return <NextStudio config={config} />;
}
