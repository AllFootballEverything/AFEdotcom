/**
 * Projects the world-atlas country outlines into flat SVG path data.
 *
 * Run with `npm run build:map`. The output is committed, so normal builds do
 * not need d3, topojson, or a network fetch — the browser receives plain
 * `<path d="…">` strings and nothing else.
 *
 * Regenerate when the region lists in src/lib/world-regions.ts change, or to
 * move to a higher-resolution source (countries-50m.json).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

import { regionFor } from "../src/lib/world-regions.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Canvas the prototype was authored against; the SVG scales via viewBox.
const WIDTH = 1400;
const HEIGHT = 640;

// Antarctica — dropped in the prototype, it eats vertical space and AFE has
// no presence there.
const EXCLUDED = new Set(["010"]);

/** Two decimals is well below one screen pixel at this scale, and ~40% smaller. */
function round(d) {
  return d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 100) / 100));
}

const topo = JSON.parse(
  await readFile(path.join(ROOT, "node_modules/world-atlas/countries-110m.json"), "utf8"),
);

const countries = feature(topo, topo.objects.countries).features.filter(
  (f) => !EXCLUDED.has(String(f.id).padStart(3, "0")),
);

const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], {
  type: "FeatureCollection",
  features: countries,
});
const toPath = geoPath(projection);

const shapes = [];
for (const f of countries) {
  const id = String(f.id).padStart(3, "0");
  const d = toPath(f);
  if (!d) continue; // degenerate geometry — nothing to draw

  const region = regionFor(id);
  shapes.push({
    id,
    d: round(d),
    // Names are only needed for the countries that show a tooltip.
    ...(region && { region, name: f.properties?.name ?? id }),
  });
}

const withRegion = shapes.filter((s) => s.region).length;
const output = { width: WIDTH, height: HEIGHT, shapes };

await mkdir(path.join(ROOT, "src/data"), { recursive: true });
await writeFile(
  path.join(ROOT, "src/data/world-map.json"),
  `${JSON.stringify(output)}\n`,
);

const bytes = JSON.stringify(output).length;
console.log(
  `world-map.json: ${shapes.length} shapes (${withRegion} highlighted), ${(bytes / 1024).toFixed(0)} KB`,
);
