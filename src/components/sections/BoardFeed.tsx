"use client";

import { type ReactNode, useState } from "react";

import { TIERS, type Visibility } from "@/lib/tiers";

/**
 * The Board: a sticky intro column on the left, filtered posts on the right.
 *
 * The cards are rendered on the server and handed here as ReactNodes — that is
 * deliberate. Filtering needs interactivity, but gated post bodies must never
 * be serialised into the client bundle, so only already-redacted markup crosses
 * the boundary. The `intro` slot is server-rendered for the same reason.
 */

export type BoardFeedItem = {
  id: string;
  visibility: Visibility;
  card: ReactNode;
};

const FILTER_LABEL: Record<string, string> = {
  ALL: "ALL",
  public: "ALL MEMBERS",
  scout: "SCOUT",
  access: "ACCESS",
  elite: "ELITE",
};

export function BoardFeed({
  intro,
  items,
}: {
  intro: ReactNode;
  items: BoardFeedItem[];
}) {
  const [filter, setFilter] = useState<"ALL" | Visibility>("ALL");

  // Only offer filters that actually match something.
  const present = new Set(items.map((item) => item.visibility));
  const available: Array<"ALL" | Visibility> = [
    "ALL",
    ...(["public", ...TIERS] as Visibility[]).filter((value) => present.has(value)),
  ];

  const visible =
    filter === "ALL" ? items : items.filter((item) => item.visibility === filter);

  return (
    <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-[110px]">
        {intro}

        {available.length > 2 ? (
          <div className="mt-6.5 flex flex-wrap gap-2">
            {available.map((value) => {
              const active = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={active}
                  className={`border border-ink/25 px-3.5 py-2.5 font-sans text-[11px] font-bold tracking-[0.08em] transition-colors hover:border-ink ${
                    active ? "bg-ink text-volt" : "bg-transparent text-ink"
                  }`}
                >
                  {FILTER_LABEL[value] ?? value}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        {visible.length > 0 ? (
          visible.map((item) => <div key={item.id}>{item.card}</div>)
        ) : (
          <p className="font-sans text-sm text-ink/60">Nothing posted here yet.</p>
        )}
      </div>
    </div>
  );
}
