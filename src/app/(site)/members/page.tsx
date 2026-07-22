import type { Metadata } from "next";

import { BoardFeed, type BoardFeedItem } from "@/components/sections/BoardFeed";
import { BoardPostCard } from "@/components/sections/BoardPostCard";
import { TierCard } from "@/components/sections/TierCard";
import { MemberBar } from "@/components/site/MemberBar";
import { ButtonLink } from "@/components/ui/Button";
import { Headline, MarkerHeadline } from "@/components/ui/Headline";
import { getViewer } from "@/lib/auth/viewer";
import { getBoardPosts, getMembersPage, getTiers } from "@/sanity/queries";
import { safeFetch } from "@/sanity/safe";

// Membership state is per-viewer, so this page must never be cached statically.
export const dynamic = "force-dynamic";

const DEFAULTS = {
  kicker: "MEMBERS — POWERED BY WHOP",
  headline: "Inside the|*clubhouse.*",
  intro:
    "Monthly memberships with direct access to the AFE team — plans, check-ins, drills and the community. Cancel anytime.",
  boardHeadline: "Updates from *the inside.*",
  boardIntro:
    "What we're working on with members — check-ins, plans, drops and drills. Posted for members first, always.",
};

export const metadata: Metadata = {
  title: "Members",
  description: DEFAULTS.intro,
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [page, tiers, posts, viewer, params] = await Promise.all([
    safeFetch(getMembersPage, null, "membersPage"),
    safeFetch(getTiers, [], "tiers"),
    safeFetch(() => getBoardPosts(), [], "boardPosts"),
    getViewer(),
    searchParams,
  ]);

  const boardItems: BoardFeedItem[] = posts.map((post) => ({
    id: post._id,
    visibility: post.visibility,
    card: (
      <BoardPostCard
        post={post}
        viewerTier={viewer.tier}
        theme="light"
        lockedMessage={page?.boardLockedMessage}
        lockedCta={
          page?.boardLockedCta ?? { label: "SEE TIERS →", href: "/members#tiers" }
        }
      />
    ),
  }));

  return (
    <div className="animate-[afe-fadeup_0.45s_ease_both]">
      <MemberBar viewer={viewer} error={params.error} />

      {/* ------------------------------------------------ header */}
      <header className="flex flex-col justify-between gap-8 border-b border-white/[0.14] px-6 pb-14 pt-18 lg:flex-row lg:items-end lg:px-12">
        <div>
          <p className="afe-kicker mb-5">{page?.kicker ?? DEFAULTS.kicker}</p>
          <Headline
            as="h1"
            text={page?.headline ?? DEFAULTS.headline}
            className="font-display text-[clamp(40px,7vw,84px)] uppercase leading-[0.98] tracking-[-0.01em]"
          />
          <p className="mt-7 max-w-[560px] font-sans text-base leading-[1.6] text-cream/75">
            {page?.intro ?? DEFAULTS.intro}
          </p>
        </div>
        <span className="whitespace-nowrap pb-3.5 font-mono text-xs font-medium text-white/55">
          1:1 SUPPORT — WORLDWIDE
        </span>
      </header>

      {/* ------------------------------------------------ tiers */}
      {tiers.length > 0 ? (
        <section id="tiers" className="scroll-mt-24 px-6 py-12 lg:px-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <TierCard
                key={tier._id}
                tier={tier}
                viewerTier={viewer.tier}
                isSignedIn={viewer.isSignedIn}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------ the board */}
      {posts.length > 0 ? (
        <section className="bg-bone px-6 py-20 text-ink lg:px-12">
          <BoardFeed
            items={boardItems}
            intro={
              <>
                <p className="afe-kicker mb-5.5">{page?.boardHeading ?? "THE BOARD"}</p>
                <MarkerHeadline
                  as="h2"
                  text={DEFAULTS.boardHeadline}
                  className="m-0 font-display text-[clamp(28px,3.6vw,38px)] uppercase leading-[1.12]"
                />
                <p className="mt-5 font-sans text-sm leading-[1.7] text-ink/65">
                  {page?.boardIntro ?? DEFAULTS.boardIntro}
                </p>
              </>
            }
          />
        </section>
      ) : null}

      {/* ------------------------------------------------ closing CTA */}
      <section className="flex flex-col items-start justify-between gap-8 bg-ink px-6 py-16 lg:flex-row lg:items-center lg:px-12">
        <Headline
          as="h2"
          text="Not sure which tier? *Start with Scout.*"
          className="font-display text-[clamp(28px,4vw,44px)] uppercase leading-[1.05]"
        />
        <ButtonLink
          href={
            tiers.find((tier) => tier.key === "scout")?.whopCheckoutUrl ?? "#tiers"
          }
          className="whitespace-nowrap px-7 py-4.5 text-[13px]"
        >
          JOIN ON WHOP →
        </ButtonLink>
      </section>
    </div>
  );
}
