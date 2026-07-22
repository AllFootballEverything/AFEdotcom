import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/Button";
import { getViewer } from "@/lib/auth/viewer";
import { formatLongDate } from "@/lib/format";
import { TIER_LABEL, canAccess } from "@/lib/tiers";
import { getExclusiveItemBySlug } from "@/sanity/queries";
import { safeFetch } from "@/sanity/safe";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = await safeFetch(
    () => getExclusiveItemBySlug(slug),
    null,
    "exclusiveItem",
  );

  if (!item) return { title: "Not found" };

  return {
    title: item.title,
    // Gated items stay out of search results and link previews.
    ...(item.visibility !== "public" && { robots: { index: false, follow: false } }),
  };
}

export default async function ExclusiveDetailPage({ params }: Params) {
  const { slug } = await params;
  const [item, viewer] = await Promise.all([
    safeFetch(() => getExclusiveItemBySlug(slug), null, "exclusiveItem"),
    getViewer(),
  ]);

  if (!item) notFound();

  const unlocked = canAccess(viewer.tier, item.visibility);

  return (
    <article className="animate-[afe-fadeup_0.45s_ease_both]">
      <header className="border-b border-white/[0.14] px-6 pb-12 pt-14 lg:px-12">
        <Link
          href="/exclusive"
          className="afe-meta text-white/50 transition-colors hover:text-volt"
        >
          ← BACK TO THE LIBRARY
        </Link>
        <p className="afe-kicker mt-6 mb-4">{item.category}</p>
        <h1 className="font-display text-[clamp(30px,5vw,64px)] uppercase leading-[1.02]">
          {item.title}
        </h1>
        <p className="mt-5 flex flex-wrap gap-4 font-mono text-[11px] font-medium tracking-[0.08em] text-white/50">
          {item.meta ? <span>{item.meta}</span> : null}
          {item.publishedAt ? <span>{formatLongDate(item.publishedAt)}</span> : null}
        </p>
      </header>

      {unlocked ? (
        <div className="px-6 py-12 lg:px-12">
          {item.videoUrl ? (
            <div className="mb-10 aspect-video w-full max-w-[900px] border border-white/[0.18]">
              <iframe
                src={item.videoUrl}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : null}

          {item.body?.length ? (
            <div className="max-w-[720px]">
              <PortableText
                value={item.body}
                components={{
                  block: {
                    normal: ({ children }) => (
                      <p className="mb-6 font-sans text-base leading-[1.75] text-cream/80 last:mb-0">
                        {children}
                      </p>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-4 mt-10 font-display text-[clamp(20px,2.6vw,28px)] uppercase first:mt-0">
                        {children}
                      </h2>
                    ),
                  },
                }}
              />
            </div>
          ) : null}
        </div>
      ) : (
        /* Locked: nothing from the body or the video URL is rendered at all. */
        <div className="px-6 py-16 lg:px-12">
          <div className="flex max-w-[560px] flex-col items-start gap-5 border-2 border-volt p-10">
            <span className="font-display text-[clamp(22px,3vw,32px)] uppercase text-volt">
              🔒 Members only
            </span>
            <p className="m-0 font-sans text-sm leading-[1.7] text-cream/80">
              {item.visibility === "public"
                ? "Sign in to watch this one."
                : `This one is for ${TIER_LABEL[item.visibility]} members and above.`}
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/members">SEE TIERS →</ButtonLink>
              {!viewer.isSignedIn ? (
                <a
                  href={`/api/auth/whop/login?returnTo=/exclusive/${item.slug}`}
                  className="inline-flex items-center border border-white/30 px-6 py-4 font-sans text-xs font-black uppercase tracking-[0.08em] text-cream transition-colors hover:border-volt hover:text-volt"
                >
                  SIGN IN WITH WHOP
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
