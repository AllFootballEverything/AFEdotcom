import Link from "next/link";

import type { Cta } from "@/sanity/types";

type Props = {
  label?: string;
  items?: string[];
  cta?: Cta;
};

/**
 * The Clubhouse ticker.
 *
 * The item list is rendered twice inside a `w-max` flex row and translated by
 * -50%, which is what makes the scroll seamless — the second copy is exactly
 * where the first started. Marked aria-hidden on the duplicate so screen
 * readers hear the headlines once.
 */
export function Ticker({ label = "THE CLUBHOUSE — LIVE", items, cta }: Props) {
  if (!items || items.length === 0) return null;

  const strip = (
    <span className="whitespace-nowrap py-4.5 font-mono text-[13px] font-medium text-cream/85">
      {items.map((item, index) => (
        <span key={index}>
          {item}
          <span className="px-3 text-volt">✦</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="flex items-stretch border-y-2 border-volt bg-ink-deep">
      <div className="hidden flex-none items-center gap-2.5 bg-volt px-5 text-[#1a1a1a] sm:flex">
        <span className="h-2 w-2 rounded-full bg-rust" />
        <span className="font-sans text-xs font-black tracking-[0.1em]">{label}</span>
      </div>

      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        <div className="flex w-max animate-[afe-ticker_30s_linear_infinite]">
          {strip}
          <span aria-hidden="true">{strip}</span>
        </div>
      </div>

      {cta ? (
        <Link
          href={cta.href}
          className="flex flex-none items-center border-l border-white/15 px-5 font-sans text-xs font-black tracking-[0.08em] text-volt transition-colors hover:bg-rust hover:text-white"
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
