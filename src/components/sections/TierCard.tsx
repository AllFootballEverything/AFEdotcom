import Image from "next/image";

import { TIER_BADGE, TIER_RANK, type Tier } from "@/lib/tiers";
import { imageSrc } from "@/sanity/image";
import type { MembershipTier } from "@/sanity/types";

/** Fallback artwork shipped with the design, keyed by tier. */
const FALLBACK_IMAGE: Record<Tier, string> = {
  scout: "/assets/tier-scout.png",
  access: "/assets/tier-access.png",
  elite: "/assets/tier-elite.png",
};

/**
 * Works out what the button on a tier card should say and do, given who is
 * looking at it. Kept separate from the markup because this is the part with
 * actual rules in it.
 */
function resolveCta({
  tier,
  viewerTier,
  isSignedIn,
  checkoutUrl,
}: {
  tier: Tier;
  viewerTier: Tier | null;
  isSignedIn: boolean;
  checkoutUrl?: string;
}) {
  if (viewerTier === tier) {
    return { label: "YOUR CURRENT PLAN", href: null, muted: true };
  }

  if (viewerTier && TIER_RANK[viewerTier] > TIER_RANK[tier]) {
    return { label: "INCLUDED IN YOUR PLAN", href: null, muted: true };
  }

  const verb = viewerTier ? "UPGRADE TO" : "JOIN";
  const label = `${verb} ${TIER_BADGE[tier]} →`;

  // With no checkout URL configured, send people through Whop sign-in rather
  // than a dead button — they land back on /members afterwards.
  const href =
    checkoutUrl ??
    (isSignedIn ? "/members" : "/api/auth/whop/login?returnTo=/members");

  return { label, href, muted: false };
}

export function TierCard({
  tier,
  viewerTier,
  isSignedIn,
}: {
  tier: MembershipTier;
  viewerTier: Tier | null;
  isSignedIn: boolean;
}) {
  const image = imageSrc(tier.image, 700) ?? FALLBACK_IMAGE[tier.key];
  const cta = resolveCta({
    tier: tier.key,
    viewerTier,
    isSignedIn,
    checkoutUrl: tier.whopCheckoutUrl,
  });

  const isCurrent = viewerTier === tier.key;

  return (
    <div
      className={`flex flex-col bg-ink-panel transition-colors hover:border-volt ${
        tier.highlighted || isCurrent
          ? "border-2 border-volt"
          : "border border-white/[0.18]"
      }`}
    >
      <div className="relative h-[190px] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={tier.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : null}
        {tier.badge ? (
          <span className="absolute left-3.5 top-3.5 bg-volt px-2.5 py-1.5 font-sans text-[10px] font-black tracking-[0.08em] text-[#1a1a1a]">
            {tier.badge}
          </span>
        ) : null}
        {isCurrent ? (
          <span className="absolute right-3.5 top-3.5 bg-ink px-2.5 py-1.5 font-sans text-[10px] font-black tracking-[0.08em] text-volt">
            ACTIVE
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4.5 p-6.5">
        <div>
          <h3 className="font-display text-2xl uppercase">{tier.name}</h3>
          <p className="mt-2 font-display text-3xl text-volt">
            {tier.price}
            <span className="font-mono text-[13px] font-medium text-white/50">
              {" "}
              {tier.cadence ?? "/ month"}
            </span>
          </p>
        </div>

        <ul className="m-0 flex flex-1 list-none flex-col border-t border-white/15 p-0">
          {tier.perks.map((perk) => (
            <li
              key={perk}
              className="border-b border-white/[0.12] py-2.75 font-sans text-[13.5px] leading-[1.5] text-cream/[0.78]"
            >
              {perk}
            </li>
          ))}
        </ul>

        {cta.href ? (
          <a
            href={cta.href}
            {...(/^https?:\/\//.test(cta.href)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className={`block p-4 text-center font-sans text-xs font-black tracking-[0.08em] transition-colors hover:border-rust hover:bg-rust hover:text-white ${
              tier.highlighted
                ? "border border-volt bg-volt text-[#1a1a1a]"
                : "border border-white/30 bg-transparent text-cream"
            }`}
          >
            {cta.label}
          </a>
        ) : (
          <span className="block border border-volt/40 bg-volt/10 p-4 text-center font-sans text-xs font-black tracking-[0.08em] text-volt">
            {cta.label}
          </span>
        )}
      </div>
    </div>
  );
}
