import type { Metadata } from "next";

import { ExclusiveCard } from "@/components/sections/ExclusiveCard";
import { FilterGrid, type FilterGridItem } from "@/components/sections/FilterGrid";
import { PageHeader } from "@/components/sections/PageHeader";
import { getViewer } from "@/lib/auth/viewer";
import { getExclusiveItems, getExclusivePage } from "@/sanity/queries";
import { safeFetch } from "@/sanity/safe";

// What a viewer can open depends on their tier.
export const dynamic = "force-dynamic";

const DEFAULTS = {
  kicker: "EXCLUSIVE — THE LIBRARY",
  headline: "Drills, breakdowns|*and the real talk.*",
  intro:
    "Sessions, match IQ breakdowns and behind-the-scenes from the road. New drops every month, members first.",
};

export const metadata: Metadata = {
  title: "Exclusive",
  description: DEFAULTS.intro,
};

export default async function ExclusivePage() {
  const [page, items, viewer] = await Promise.all([
    safeFetch(getExclusivePage, null, "exclusivePage"),
    safeFetch(getExclusiveItems, [], "exclusiveItems"),
    getViewer(),
  ]);

  const gridItems: FilterGridItem[] = items.map((item) => ({
    id: item._id,
    category: item.category,
    card: (
      <ExclusiveCard
        item={item}
        viewerTier={viewer.tier}
        lockedCta={page?.lockedCta ?? { label: "UNLOCK WITH A MEMBERSHIP →", href: "/members" }}
      />
    ),
  }));

  return (
    <div className="animate-[afe-fadeup_0.45s_ease_both]">
      <PageHeader
        kicker={page?.kicker ?? DEFAULTS.kicker}
        headline={page?.headline ?? DEFAULTS.headline}
        intro={page?.intro ?? DEFAULTS.intro}
      >
        {!viewer.isSignedIn ? (
          <a
            href="/api/auth/whop/login?returnTo=/exclusive"
            className="mt-7 inline-block bg-volt px-5 py-3 font-sans text-xs font-black tracking-[0.08em] text-[#1a1a1a] transition-colors hover:bg-rust hover:text-white"
          >
            SIGN IN TO UNLOCK →
          </a>
        ) : null}
      </PageHeader>

      <section className="px-6 py-14 lg:px-12">
        {gridItems.length > 0 ? (
          <FilterGrid items={gridItems} categories={page?.categories} />
        ) : (
          <p className="font-sans text-sm text-cream/60">
            The library is being loaded up. Check back shortly.
          </p>
        )}
      </section>
    </div>
  );
}
