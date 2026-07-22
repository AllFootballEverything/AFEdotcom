import worldMap from "@/data/world-map.json";

import { WorldMapInteractions } from "./WorldMapInteractions";

const FILL = {
  core: "#CAE74D",
  extended: "#C35934",
  none: "#5d5d5d",
} as const;

type Shape = {
  id: string;
  d: string;
  region?: "core" | "extended";
  name?: string;
};

/**
 * The AFE regions map.
 *
 * Ported from the "AFE Interactive Map" prototype, which projected the
 * world-atlas topology with d3 in the browser on every page load. Here the
 * projection is done once at build time (`npm run build:map`) and the result
 * committed, so the browser gets plain `<path>` elements — no d3, no topojson,
 * and no runtime fetch from a CDN.
 *
 * This component is a *server* component on purpose: the 136 KB of path data
 * is rendered to HTML and never enters the client bundle. The interactive
 * layer reads geometry back off the hovered node instead.
 */
export function WorldMap({
  headline,
  topCountries,
  legend,
}: {
  headline?: React.ReactNode;
  topCountries?: string;
  legend?: React.ReactNode;
}) {
  const shapes = worldMap.shapes as Shape[];
  const regionCount = shapes.filter((s) => s.region).length;

  return (
    <WorldMapInteractions>
      <svg
        viewBox={`0 0 ${worldMap.width} ${worldMap.height}`}
        role="img"
        aria-label={`World map highlighting the ${regionCount} countries where AFE operates`}
        className="block h-auto w-full"
        data-afe-map-base=""
      >
        {shapes.map((shape) => (
          <path
            key={shape.id}
            d={shape.d}
            fill={FILL[shape.region ?? "none"]}
            stroke="#161616"
            strokeWidth={0.7}
            {...(shape.region && {
              "data-region": shape.region,
              "data-name": shape.name,
              tabIndex: 0,
              role: "button",
              "aria-label": `${shape.name} — AFE ${shape.region} region`,
            })}
          />
        ))}
      </svg>

      {/* Overlay copy sits inside the frame on desktop, below it on mobile. */}
      <div className="flex flex-col gap-3 p-6 lg:absolute lg:bottom-5 lg:left-6 lg:z-[2] lg:p-0">
        <div className="flex flex-wrap items-baseline gap-4">
          {headline}
          {topCountries ? (
            <span className="font-mono text-[11px] font-medium text-white/50">
              {topCountries}
            </span>
          ) : null}
        </div>
        {legend}
      </div>
    </WorldMapInteractions>
  );
}
