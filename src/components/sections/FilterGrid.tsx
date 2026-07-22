"use client";

import { type ReactNode, useState } from "react";

/**
 * Generic "chips filter a grid" control.
 *
 * As with the Board, the cards arrive already rendered by the server so that
 * gated content never has to cross into the client bundle — this component
 * only decides which of them to mount.
 */

export type FilterGridItem = {
  id: string;
  category: string;
  card: ReactNode;
};

export function FilterGrid({
  items,
  categories,
  allLabel = "ALL",
}: {
  items: FilterGridItem[];
  categories?: string[];
  allLabel?: string;
}) {
  const [active, setActive] = useState(allLabel);

  // Preserve the editor's ordering when categories are supplied, otherwise
  // fall back to first-seen order from the items themselves.
  const present = new Set(items.map((item) => item.category));
  const ordered = (categories ?? []).filter((category) => present.has(category));
  const extras = [...present].filter((category) => !ordered.includes(category));
  const chips = [allLabel, ...ordered, ...extras];

  const visible =
    active === allLabel ? items : items.filter((item) => item.category === active);

  return (
    <>
      {chips.length > 2 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {chips.map((chip) => {
            const isActive = active === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setActive(chip)}
                aria-pressed={isActive}
                className={`border px-3.5 py-2.5 font-sans text-[11px] font-bold tracking-[0.08em] transition-colors ${
                  isActive
                    ? "border-volt bg-volt text-[#1a1a1a]"
                    : "border-white/25 text-cream/80 hover:border-volt"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <div key={item.id}>{item.card}</div>
        ))}
      </div>
    </>
  );
}
