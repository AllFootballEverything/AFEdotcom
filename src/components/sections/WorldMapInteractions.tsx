"use client";

import { useCallback, useRef, useState } from "react";

type Hovered = {
  d: string;
  name: string;
  region: "core" | "extended";
  x: number;
  y: number;
};

const REGION_LABEL = {
  core: "AFE CORE REGION",
  extended: "AFE EXTENDED REGION",
} as const;

const REGION_COLOR = {
  core: "#CAE74D",
  extended: "#C35934",
} as const;

/**
 * Hover, focus and tooltip behaviour for the regions map.
 *
 * Two things are worth knowing about how this is put together:
 *
 * 1. The 176 base `<path>` elements are server-rendered children. Rather than
 *    holding them in React state, this component reads the geometry back off
 *    the hovered node (`getAttribute("d")`) — so the path data stays out of
 *    the client bundle entirely.
 *
 * 2. Dimming the other countries is done by toggling a class on the base svg
 *    and letting CSS handle it, not by re-rendering. Re-rendering 176 paths on
 *    every mousemove would be visibly janky.
 *
 * The "lift" — the hovered country scaling up with a light stroke — is drawn
 * in a second, overlaid svg sharing the same viewBox, which puts it above the
 * dimmed base without needing to reorder anything.
 */
export function WorldMapInteractions({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [lifted, setLifted] = useState(false);

  const positionFor = useCallback((target: SVGPathElement, clientX?: number, clientY?: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const bounds = container.getBoundingClientRect();

    // Keyboard focus has no pointer position — fall back to the shape itself.
    const point =
      clientX !== undefined && clientY !== undefined
        ? { x: clientX, y: clientY }
        : (() => {
            const box = target.getBoundingClientRect();
            return { x: box.left + box.width / 2, y: box.top };
          })();

    let x = point.x - bounds.left + 16;
    const y = point.y - bounds.top - 10;
    if (x > bounds.width - 180) x -= 200;
    return { x, y };
  }, []);

  const enter = useCallback(
    (target: SVGPathElement, clientX?: number, clientY?: number) => {
      const region = target.getAttribute("data-region");
      const name = target.getAttribute("data-name");
      const d = target.getAttribute("d");
      if ((region !== "core" && region !== "extended") || !name || !d) return;

      const base = containerRef.current?.querySelector("[data-afe-map-base]");
      base?.classList.add("afe-map-hovering");
      base?.querySelector(".afe-map-hovered")?.classList.remove("afe-map-hovered");
      target.classList.add("afe-map-hovered");

      const { x, y } = positionFor(target, clientX, clientY);
      setHovered({ d, name, region, x, y });
      // Next frame, so the scale transition actually animates from 1.
      requestAnimationFrame(() => setLifted(true));
    },
    [positionFor],
  );

  const leave = useCallback(() => {
    const base = containerRef.current?.querySelector("[data-afe-map-base]");
    base?.classList.remove("afe-map-hovering");
    base?.querySelector(".afe-map-hovered")?.classList.remove("afe-map-hovered");
    setLifted(false);
    setHovered(null);
  }, []);

  const onPointerOver = useCallback(
    (event: React.MouseEvent) => {
      const target = (event.target as Element).closest<SVGPathElement>("path[data-region]");
      if (target) enter(target, event.clientX, event.clientY);
    },
    [enter],
  );

  const onPointerMove = useCallback(
    (event: React.MouseEvent) => {
      if (!hovered) return;
      const container = containerRef.current;
      if (!container) return;
      const bounds = container.getBoundingClientRect();
      let x = event.clientX - bounds.left + 16;
      const y = event.clientY - bounds.top - 10;
      if (x > bounds.width - 180) x -= 200;
      setHovered((current) => (current ? { ...current, x, y } : current));
    },
    [hovered],
  );

  const onFocus = useCallback(
    (event: React.FocusEvent) => {
      const target = (event.target as Element).closest<SVGPathElement>("path[data-region]");
      if (target) enter(target);
    },
    [enter],
  );

  return (
    <div
      ref={containerRef}
      className="afe-map relative overflow-hidden border border-white/[0.14] bg-ink-deep"
      onMouseOver={onPointerOver}
      onMouseMove={onPointerMove}
      onMouseLeave={leave}
      onFocus={onFocus}
      onBlur={leave}
    >
      {children}

      {hovered ? (
        <>
          <svg
            viewBox="0 0 1400 640"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] block h-auto w-full"
          >
            <path
              d={hovered.d}
              fill={REGION_COLOR[hovered.region]}
              className={`afe-map-lift${lifted ? " afe-map-lift-up" : ""}`}
            />
          </svg>

          <div
            role="status"
            className="pointer-events-none absolute z-[3] whitespace-nowrap border border-white/20 bg-ink px-3 py-2"
            style={{ left: hovered.x, top: hovered.y }}
          >
            <span className="block font-display text-sm uppercase">{hovered.name}</span>
            <span
              className="mt-[3px] block font-mono text-[9px] font-medium tracking-[0.1em]"
              style={{ color: REGION_COLOR[hovered.region] }}
            >
              {REGION_LABEL[hovered.region]}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
