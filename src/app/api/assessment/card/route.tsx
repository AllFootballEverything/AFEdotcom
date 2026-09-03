import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

import {
  ARCHETYPES,
  CATEGORIES,
  type CategoryKey,
  isCategoryKey,
} from "@/lib/assessment";

export const runtime = "nodejs";

// Instagram Story canvas.
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = "#201D1F";
const CARD = "#2A272A";
const VOLT = "#C2E812";
const RUST = "#D05126";
const CREAM = "#F2F2F2";

/**
 * Fonts are read from disk once and cached. They ship with the serverless
 * function via `outputFileTracingIncludes` in next.config.ts — without that
 * entry the .otf files are not traced into the deployment and this 500s.
 */
let fontsPromise: Promise<{ schabo: Buffer; neue: Buffer; neueItalic: Buffer }> | null =
  null;

function loadFonts() {
  if (!fontsPromise) {
    const dir = path.join(process.cwd(), "src/fonts");
    fontsPromise = Promise.all([
      readFile(path.join(dir, "SCHABO-Condensed.otf")),
      readFile(path.join(dir, "PPNeueMontreal-Book.otf")),
      readFile(path.join(dir, "PPNeueMontreal-SemiBolditalic.otf")),
    ]).then(([schabo, neue, neueItalic]) => ({ schabo, neue, neueItalic }));
  }
  return fontsPromise;
}

function clampPct(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, 0), 100);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const archetypeParam = params.get("archetype");
  const archetypeKey: CategoryKey = isCategoryKey(archetypeParam)
    ? archetypeParam
    : "competitive";
  const archetype = ARCHETYPES[archetypeKey];

  // One pct per category, read by key; missing/garbage clamps to 0.
  const bars = CATEGORIES.map((c) => ({
    label: c.label,
    pct: clampPct(params.get(c.key)),
  }));

  const { schabo, neue, neueItalic } = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          color: CREAM,
          fontFamily: "Neue",
          padding: "96px 84px 0",
        }}
      >
        {/* result */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
          <div
            style={{
              color: RUST,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 8,
            }}
          >
            // SELF-ASSESSMENT
          </div>
          <div
            style={{
              color: CREAM,
              opacity: 0.55,
              fontSize: 40,
              letterSpacing: 12,
              marginTop: 44,
            }}
          >
            I AM
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Schabo",
              color: VOLT,
              fontSize: 168,
              lineHeight: 0.92,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginTop: 8,
            }}
          >
            {archetype.name}
          </div>
          <div
            style={{
              fontFamily: "Neue",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 44,
              color: CREAM,
              marginTop: 28,
              maxWidth: 820,
              lineHeight: 1.25,
            }}
          >
            {archetype.tagline}
          </div>
        </div>

        {/* category bars */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
          {bars.map((bar) => (
            <div
              key={bar.label}
              style={{ display: "flex", flexDirection: "column", marginBottom: 40 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 3, opacity: 0.85 }}>
                  {bar.label}
                </div>
                <div style={{ fontFamily: "Schabo", fontSize: 44, color: CREAM }}>
                  {`${bar.pct}%`}
                </div>
              </div>
              <div style={{ display: "flex", width: "100%", height: 18, background: CARD }}>
                <div style={{ width: `${bar.pct}%`, height: "100%", background: VOLT }} />
              </div>
            </div>
          ))}
        </div>

        {/* brand lockup */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <div style={{ fontSize: 24, letterSpacing: 8, opacity: 0.5 }}>
            ALL FOOTBALL EVERYTHING
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: VOLT,
                clipPath: "polygon(0% 100%, 60% 0%, 100% 0%, 100% 30%, 45% 100%)",
                marginRight: 16,
              }}
            />
            <div style={{ fontFamily: "Schabo", fontSize: 56, letterSpacing: 2 }}>AFE</div>
          </div>
        </div>

        {/* CTA band — full-bleed, so negative side margins cancel the padding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: VOLT,
            color: INK,
            marginLeft: -84,
            marginRight: -84,
            marginTop: 56,
            padding: "44px 40px",
          }}
        >
          <div style={{ fontFamily: "Schabo", fontSize: 72, letterSpacing: 1 }}>
            ARE YOU READY TO PLAY ABROAD?
          </div>
          <div style={{ fontSize: 26, letterSpacing: 4, opacity: 0.75, marginTop: 8 }}>
            TAKE THE ASSESSMENT · ALLFOOTBALLEVERYTHING.COM
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Schabo", data: schabo, weight: 400, style: "normal" },
        { name: "Neue", data: neue, weight: 400, style: "normal" },
        { name: "Neue", data: neueItalic, weight: 600, style: "italic" },
      ],
      headers: {
        // Card content is deterministic for a given result — let it cache.
        "cache-control": "public, max-age=31536000, immutable",
      },
    },
  );
}
