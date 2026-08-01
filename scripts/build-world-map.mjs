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

import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

import { regionFor } from "../src/lib/world-regions.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Canvas the prototype was authored against; the SVG scales via viewBox.
const WIDTH = 1400;
const HEIGHT = 640;

// Antarctica — dropped in the prototype, it eats vertical space and AFE has
// no presence there.
const EXCLUDED = new Set(["010"]);

/**
 * Countries whose single world-atlas feature also covers territory far from the
 * landmass people mean when they point at it.
 *
 * France is one feature spanning metropolitan France *and* French Guiana in
 * South America, so hovering France lit up a shape on another continent. Each
 * entry gives the lon/lat box of the landmass that should own the hover; any
 * polygon whose centroid falls outside is still drawn, in the same colour, but
 * split into its own inert shape so it never joins the highlight.
 *
 * Deliberately opt-in per country rather than a blanket "keep the biggest
 * polygon" rule: Alaska and Hawaii genuinely are the US, and Svalbard is
 * Norway, so those should keep highlighting whole.
 */
const PRIMARY_LANDMASS = {
  // Metropolitan France incl. Corsica (~9.5E, 41.4N); excludes French Guiana.
  "250": { lonMin: -6, lonMax: 10, latMin: 41, latMax: 52 },
};

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
countries.forEach((f, index) => {
  // A handful of features (disputed/unrecognised territories) carry no id.
  // They are always grey and inert, but each still needs a UNIQUE id so it can
  // be a stable React key — otherwise several "undefined" ids collide and React
  // drops all but one of those landmasses. Fall back to the feature index.
  const id = f.id != null ? String(f.id).padStart(3, "0") : `x${index}`;
  const region = regionFor(id);
  const name = f.properties?.name ?? id;

  // Split off distant territories so they do not join the country's highlight.
  const bounds = PRIMARY_LANDMASS[id];
  if (bounds && f.geometry?.type === "MultiPolygon") {
    const primary = [];
    const detached = [];

    for (const coordinates of f.geometry.coordinates) {
      const [lon, lat] = geoCentroid({ type: "Polygon", coordinates });
      const inside =
        lon >= bounds.lonMin &&
        lon <= bounds.lonMax &&
        lat >= bounds.latMin &&
        lat <= bounds.latMax;
      (inside ? primary : detached).push(coordinates);
    }

    if (primary.length > 0) {
      const d = toPath({ type: "MultiPolygon", coordinates: primary });
      // The hoverable country: one path, one highlight, one tooltip.
      if (d) shapes.push({ id, d: round(d), ...(region && { region, name }) });
    }

    detached.forEach((coordinates, i) => {
      const d = toPath({ type: "MultiPolygon", coordinates: [coordinates] });
      // Same fill so the map is unchanged at rest, but `inert` keeps it out of
      // the hover target set — no highlight, no tooltip, no focus stop.
      if (d) shapes.push({ id: `${id}-t${i}`, d: round(d), ...(region && { region }), inert: true });
    });

    return;
  }

  const d = toPath(f);
  if (!d) return; // degenerate geometry — nothing to draw

  shapes.push({
    id,
    d: round(d),
    // Names are only needed for the countries that show a tooltip.
    ...(region && { region, name }),
  });
});

const withRegion = shapes.filter((s) => s.region && !s.inert).length;
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
