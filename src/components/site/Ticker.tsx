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
 * where the first started.
 *
 * The two copies MUST be structurally identical. An earlier version wrapped
 * only the duplicate in an extra `<span aria-hidden>`, which made the two flex
 * items align differently and left the second copy sitting 15px higher than
 * the first — the text visibly jumped as the strip scrolled. Both copies are
 * now the same element with the same classes; the duplicate just carries
 * aria-hidden so the headlines are announced once.
 */
function Strip({ items, hidden }: { items: string[]; hidden?: boolean }) {
  return (
    <span
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center whitespace-nowrap py-4.5 font-mono text-[13px] font-medium text-cream/85"
    >
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          {item}
          {/* 16px each side of the separator — refined spacing per handoff. */}
          <span className="px-4 text-volt">✦</span>
        </span>
      ))}
    </span>
  );
}

export function Ticker({ label = "THE CLUBHOUSE — LIVE", items, cta }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex items-stretch border-y-2 border-volt bg-ink-deep">
      <div className="hidden flex-none items-center gap-2.5 bg-volt px-5 text-[#1a1a1a] sm:flex">
        <span className="h-2 w-2 rounded-full bg-rust" />
        <span className="font-sans text-xs font-black tracking-[0.1em]">{label}</span>
      </div>

      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        <div className="flex w-max items-center animate-[afe-ticker_30s_linear_infinite]">
          <Strip items={items} />
          <Strip items={items} hidden />
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
