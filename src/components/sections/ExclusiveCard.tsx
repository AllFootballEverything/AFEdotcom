import Image from "next/image";
import Link from "next/link";

import { type Tier, canAccess } from "@/lib/tiers";
import { imageSrc } from "@/sanity/image";
import type { Cta, ExclusiveItem } from "@/sanity/types";

const MEDIA_LABEL: Record<ExclusiveItem["media"], string> = {
  video: "VIDEO",
  article: "ARTICLE",
  series: "SERIES",
};

/**
 * One item in the Exclusive library.
 *
 * A locked card still shows its title and category — that is the marketing
 * value — but never links through, and never renders the video URL or body.
 */
export function ExclusiveCard({
  item,
  viewerTier,
  lockedCta,
}: {
  item: ExclusiveItem;
  viewerTier: Tier | null;
  lockedCta?: Cta;
}) {
  const unlocked = canAccess(viewerTier, item.visibility);
  const thumbnail = imageSrc(item.thumbnail, 800);

  const body = (
    <>
      <div className="relative aspect-video overflow-hidden bg-ink-deep">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover transition-transform duration-300 ${
              unlocked ? "group-hover:scale-105" : "blur-[6px] saturate-50"
            }`}
          />
        ) : (
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#1E1E1E,#1E1E1E_10px,#232323_10px,#232323_20px)]" />
        )}

        <span className="absolute left-3 top-3 bg-volt px-2 py-1 font-sans text-[10px] font-black tracking-[0.08em] text-[#1a1a1a]">
          {item.category}
        </span>
        <span className="absolute right-3 top-3 font-mono text-[10px] font-medium text-white/70">
          {MEDIA_LABEL[item.media]}
        </span>

        {!unlocked ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
            <span className="bg-volt px-3 py-2 font-sans text-[11px] font-black tracking-[0.08em] text-[#1a1a1a]">
              🔒 {item.visibility === "public" ? "MEMBERS" : item.visibility.toUpperCase()}{" "}
              ONLY
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-sans text-base font-bold uppercase leading-tight">
          {item.title}
        </h3>
        {item.meta ? (
          <span className="font-mono text-[11px] font-medium text-white/50">
            {item.meta}
          </span>
        ) : null}

        {!unlocked && lockedCta ? (
          <Link
            href={lockedCta.href}
            className="mt-auto pt-3 font-sans text-xs font-black tracking-[0.06em] text-volt"
          >
            {lockedCta.label}
          </Link>
        ) : null}
      </div>
    </>
  );

  const className =
    "group flex flex-col border border-white/[0.18] transition-colors hover:border-volt";

  if (!unlocked) {
    return <article className={className}>{body}</article>;
  }

  return (
    <Link href={`/exclusive/${item.slug}`} className={className}>
      {body}
    </Link>
  );
}
