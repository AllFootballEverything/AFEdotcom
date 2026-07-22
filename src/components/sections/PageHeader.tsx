import { Headline } from "@/components/ui/Headline";

/**
 * The masthead every inner page opens with: rust kicker, oversized display
 * headline with a volt-coloured second clause, intro paragraph, hairline rule.
 */
export function PageHeader({
  kicker,
  headline,
  intro,
  children,
}: {
  kicker?: string;
  headline: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b border-white/[0.14] px-6 pb-14 pt-18 lg:px-12">
      {kicker ? <p className="afe-kicker mb-5">{kicker}</p> : null}
      <Headline
        as="h1"
        text={headline}
        className="font-display text-[clamp(40px,7vw,84px)] uppercase leading-[0.98] tracking-[-0.01em]"
      />
      {intro ? (
        <p className="mt-7 max-w-[560px] font-sans text-base leading-[1.6] text-cream/75">
          {intro}
        </p>
      ) : null}
      {children}
    </header>
  );
}

/**
 * The numbered editorial cards used on Training (T.01…) and Work (S.01…).
 * A card shows either a description or a bullet list, depending on the page.
 */
export function NumberedGrid({
  blocks,
}: {
  blocks: Array<{
    number: string;
    title: string;
    description?: string;
    items?: string[];
    meta?: string;
  }>;
}) {
  if (blocks.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      {blocks.map((block) => (
        <div
          key={block.number}
          className="flex flex-col gap-4 border-b border-white/[0.14] px-6 py-11 transition-colors hover:bg-ink-panel md:border-r md:px-12 md:last:border-r-0"
        >
          <span className="font-sans text-[11px] font-bold tracking-[0.12em] text-rust">
            {block.number}
          </span>
          <h2 className="font-display text-[clamp(20px,2.5vw,26px)] uppercase">
            {block.title}
          </h2>

          {block.description ? (
            <p className="m-0 font-sans text-sm leading-[1.65] text-cream/70">
              {block.description}
            </p>
          ) : null}

          {block.items && block.items.length > 0 ? (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {block.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 font-sans text-sm leading-[1.6] text-cream/70"
                >
                  <span aria-hidden="true" className="text-volt">
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {block.meta ? (
            <span className="mt-auto pt-2 font-sans text-[13px] font-black tracking-[0.06em] text-volt">
              {block.meta}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
