import Image from "next/image";
import Link from "next/link";

import { BoardPostCard } from "@/components/sections/BoardPostCard";
import { SessionCard } from "@/components/sections/SessionCard";
import { Ticker } from "@/components/site/Ticker";
import { ButtonLink } from "@/components/ui/Button";
import { Headline, MarkerHeadline } from "@/components/ui/Headline";
import { getViewer } from "@/lib/auth/viewer";
import { imageSrc } from "@/sanity/image";
import {
  getFeaturedBoardPosts,
  getFeaturedSessions,
  getHomePage,
  getPartners,
  getSiteSettings,
  getTestimonials,
} from "@/sanity/queries";
import { safeFetch } from "@/sanity/safe";

export const revalidate = 3600;

/** Design defaults, used until the studio is populated. */
const DEFAULTS = {
  heroHeadline: "All|football|every*thing.*",
  heroIntro:
    "Expert training, mentorship and community — a platform that supports your journey in the sport and beyond. Designed for those who live football, not just play it.",
  heroStats: [
    { value: "1.5M+", label: "FANS" },
    { value: "83.7M+", label: "VIEWS / 90 DAYS" },
    { value: "40+", label: "COUNTRIES" },
  ],
  missionHeadline:
    "Freedom to play with purpose. Find your style. Express yourself — *on and off the pitch.*",
  missionBody:
    "No rigid plans, just showing up and doing what we do best. We're disruptive, refined, and making waves in the football world with flair. Simplicity is key. We are straightforward and real.",
  missionValues: ["AUTHENTICITY", "PASSION", "FREEDOM", "INTENSITY", "DISRUPTION"],
  clubhouseHeadline: "Inside the|*clubhouse.*",
  clubhouseBody:
    "Plans, 1:1 check-ins, drills and the community — direct access to the AFE team, from $29/mo.",
  mapHeadline: "Trusted in *40+ countries.*",
};

export default async function HomePage() {
  const [page, settings, sessions, testimonials, partners, boardPosts, viewer] =
    await Promise.all([
      safeFetch(getHomePage, null, "homePage"),
      safeFetch(getSiteSettings, null, "siteSettings"),
      safeFetch(() => getFeaturedSessions(3), [], "featuredSessions"),
      safeFetch(() => getTestimonials(true), [], "testimonials"),
      safeFetch(getPartners, [], "partners"),
      safeFetch(() => getFeaturedBoardPosts(2), [], "featuredBoardPosts"),
      getViewer(),
    ]);

  const heroMedia = imageSrc(page?.heroMedia, 1400) ?? "/assets/afe-shooting.gif";
  const heroStats = page?.heroStats?.length ? page.heroStats : DEFAULTS.heroStats;
  const mapImage = imageSrc(page?.mapImage, 1800) ?? "/assets/afe-world-map-v2.png";

  return (
    <div className="animate-[afe-fadeup_0.45s_ease_both]">
      {/* ------------------------------------------------ hero */}
      <section className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col justify-between gap-11 px-6 py-12 lg:px-12 lg:py-16">
          <div>
            <Headline
              as="h1"
              text={page?.heroHeadline ?? DEFAULTS.heroHeadline}
              className="font-display text-[clamp(40px,5.4vw,96px)] uppercase leading-[0.95] tracking-[-0.01em]"
            />
            <p className="mt-7 max-w-[440px] font-sans text-base leading-[1.6] text-cream/75">
              {page?.heroIntro ?? DEFAULTS.heroIntro}
            </p>
          </div>

          <dl className="flex border border-white/20">
            {heroStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`min-w-0 flex-1 p-[clamp(12px,1.6vw,22px)] ${
                  index < heroStats.length - 1 ? "border-r border-white/20" : ""
                }`}
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="m-0">
                  <span className="block font-display text-[clamp(22px,2.4vw,36px)] leading-none text-volt">
                    {stat.value}
                  </span>
                  <span className="mt-2 block font-sans text-[10px] font-semibold tracking-[0.12em] text-white/55">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative min-h-[320px] min-w-0 overflow-hidden lg:min-h-0">
          {/* Unoptimised: the design's hero is an animated GIF, which the Next
              image pipeline would flatten to a still frame. */}
          <Image
            src={heroMedia}
            alt="AFE training"
            fill
            unoptimized
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover [filter:saturate(0.85)_contrast(1.05)]"
          />
          <ButtonLink
            href={page?.heroCta?.href ?? "/work"}
            className="absolute bottom-6 left-6 text-[13px]"
          >
            {page?.heroCta?.label ?? "WORK WITH AFE →"}
          </ButtonLink>
        </div>
      </section>

      {/* ------------------------------------------------ ticker */}
      {settings?.tickerEnabled !== false ? (
        <Ticker
          label={settings?.tickerLabel}
          items={settings?.tickerItems}
          cta={settings?.tickerCta ?? { label: "JOIN →", href: "/members" }}
        />
      ) : null}

      {/* ------------------------------------------------ mission */}
      <section className="bg-bone px-6 pb-18 pt-21 text-ink lg:px-12">
        <p className="afe-kicker mb-6">{page?.missionKicker ?? "OUR DNA"}</p>
        <MarkerHeadline
          as="h2"
          text={page?.missionHeadline ?? DEFAULTS.missionHeadline}
          className="m-0 max-w-[1000px] font-display text-[clamp(30px,4vw,46px)] uppercase leading-[1.15]"
        />
        <p className="mt-7 max-w-[560px] font-sans text-[15px] leading-[1.7] text-ink/65">
          {page?.missionBody ?? DEFAULTS.missionBody}
        </p>
        <div className="mt-9 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-10 gap-y-3 font-sans text-xs font-semibold tracking-[0.12em] text-ink/60">
            {(page?.missionValues ?? DEFAULTS.missionValues).map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
          <Link
            href={page?.missionCta?.href ?? "/about"}
            className="self-start border-b-2 border-volt pb-[3px] font-sans text-xs font-black tracking-[0.08em] text-ink transition-colors hover:text-rust"
          >
            {page?.missionCta?.label ?? "MORE ABOUT AFE →"}
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------ testimonials */}
      {testimonials.length > 0 || boardPosts.length > 0 ? (
        <section className="bg-bone px-6 pb-21 text-ink lg:px-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 2).map((testimonial) => (
              <figure
                key={testimonial._id}
                className="m-0 flex flex-col justify-between gap-2.5 border border-black/[0.09] bg-white p-7 transition-colors hover:border-volt"
              >
                <div>
                  <span
                    aria-hidden="true"
                    className="block font-display text-[40px] leading-none text-volt [-webkit-text-stroke:1.5px_#1E1E1E]"
                  >
                    &quot;
                  </span>
                  <blockquote className="m-0 mb-4.5 mt-2.5 font-sans text-sm leading-[1.65]">
                    {testimonial.quote}
                  </blockquote>
                </div>
                <figcaption className="font-sans text-[11px] font-bold tracking-[0.1em] text-rust">
                  {testimonial.attribution}
                </figcaption>
              </figure>
            ))}

            {boardPosts[0] ? (
              <BoardPostCard
                post={boardPosts[0]}
                viewerTier={viewer.tier}
                variant="teaser"
                lockedCta={{ label: "SEE WHAT MEMBERS GET →", href: "/members" }}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------ upcoming sessions */}
      {sessions.length > 0 ? (
        <section className="bg-ink px-6 py-20 lg:px-12">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-display text-[clamp(24px,3vw,32px)] uppercase">
              {page?.eventsHeading ?? "Upcoming sessions"}
            </h2>
            <Link
              href={page?.eventsCta?.href ?? "/training"}
              className="font-sans text-xs font-bold tracking-[0.1em] text-volt transition-colors hover:text-rust"
            >
              {page?.eventsCta?.label ?? "FULL CALENDAR →"}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard key={session._id} session={session} compact />
            ))}
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------ clubhouse + map */}
      <section className="grid grid-cols-1 items-center gap-12 bg-ink px-6 pb-20 lg:grid-cols-2 lg:px-12">
        <div>
          <p className="afe-kicker mb-4.5">
            {page?.clubhouseKicker ?? "MEMBERS — POWERED BY WHOP"}
          </p>
          <Headline
            as="h2"
            text={page?.clubhouseHeadline ?? DEFAULTS.clubhouseHeadline}
            className="font-display text-[clamp(32px,4.2vw,48px)] uppercase leading-none"
          />
          <p className="mt-4.5 max-w-[420px] font-sans text-sm leading-[1.7] text-cream/70">
            {page?.clubhouseBody ?? DEFAULTS.clubhouseBody}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {(
              page?.clubhouseCtas ?? [
                { label: "JOIN ON WHOP →", href: "/members" },
                { label: "SEE TIERS", href: "/members#tiers" },
              ]
            ).map((cta, index) => (
              <ButtonLink
                key={cta.href}
                href={cta.href}
                variant={index === 0 ? "volt" : "outline"}
              >
                {cta.label}
              </ButtonLink>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          {boardPosts.map((post) => (
            <BoardPostCard
              key={post._id}
              post={post}
              viewerTier={viewer.tier}
              lockedCta={{ label: "SEE WHAT MEMBERS GET →", href: "/members" }}
            />
          ))}
          <span className="text-right font-mono text-[10px] font-medium text-white/40">
            FROM THE BOARD
          </span>
        </div>

        <div className="relative col-span-full overflow-hidden border border-white/[0.14] bg-ink-deep">
          <Image
            src={mapImage}
            alt="AFE core and extended regions world map"
            width={1800}
            height={950}
            sizes="100vw"
            className="block h-auto w-full"
          />
          <div className="flex flex-col gap-3 p-6 lg:absolute lg:bottom-5 lg:left-6 lg:p-0">
            <div className="flex flex-wrap items-baseline gap-4">
              <Headline
                as="h2"
                text={page?.mapHeadline ?? DEFAULTS.mapHeadline}
                className="font-display text-[22px] uppercase"
              />
              <span className="font-mono text-[11px] font-medium text-white/50">
                {page?.mapTopCountries ?? "TOP: UK · ITALY · FRANCE · SPAIN · GERMANY"}
              </span>
            </div>
            <div className="flex flex-wrap gap-5">
              {(
                page?.mapLegend ?? [
                  { value: "volt", label: "AFE CORE REGIONS" },
                  { value: "rust", label: "AFE EXTENDED REGIONS" },
                ]
              ).map((entry) => (
                <span key={entry.label} className="flex items-center gap-2">
                  <span
                    className={`inline-block h-3 w-3 ${
                      entry.value === "rust" ? "bg-rust" : "bg-volt"
                    }`}
                  />
                  <span className="font-mono text-[10px] font-medium tracking-[0.08em] text-cream/75">
                    {entry.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ partners */}
      {partners.length > 0 ? (
        <section className="bg-bone px-6 py-20 text-ink lg:px-12">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-display text-[clamp(24px,3vw,32px)] uppercase">
              {page?.partnersHeading ?? "The brands we play with"}
            </h2>
            <span className="afe-kicker">{page?.partnersKicker ?? "OUR NETWORK"}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {partners.map((partner) => {
              const logo = imageSrc(partner.logo, 400);
              return (
                <div
                  key={partner._id}
                  className="flex h-[140px] items-center justify-center border border-black/[0.09] bg-white p-6"
                >
                  {logo ? (
                    <Image
                      src={logo}
                      alt={partner.name}
                      width={200}
                      height={92}
                      className="max-h-full w-auto object-contain"
                    />
                  ) : (
                    <span className="font-sans text-xs font-bold text-ink/40">
                      {partner.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
