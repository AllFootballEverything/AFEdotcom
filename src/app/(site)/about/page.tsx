import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";

import { NumberedGrid, PageHeader } from "@/components/sections/PageHeader";
import { getAboutPage, getTestimonials } from "@/sanity/queries";
import { safeFetch } from "@/sanity/safe";

export const revalidate = 3600;

const DEFAULTS = {
  kicker: "ABOUT — ALL FOOTBALL EVERYTHING",
  headline: "More than|*a badge.*",
  intro:
    "We're disruptive, refined, and making waves in the football world with flair. Simplicity is key. We are straightforward and real.",
  stats: [
    { value: "1.5M+", label: "FANS" },
    { value: "83.7M+", label: "VIEWS / 90 DAYS" },
    { value: "40+", label: "COUNTRIES" },
  ],
  topEurope: ["United Kingdom", "Italy", "France", "Spain", "Germany"],
  topWorld: ["United States", "Brazil", "Indonesia", "India", "Argentina"],
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeFetch(getAboutPage, null, "aboutPage");
  return {
    title: page?.seo?.title ?? "About",
    description: page?.seo?.description ?? DEFAULTS.intro,
  };
}

function RegionList({ title, regions }: { title: string; regions: string[] }) {
  return (
    <div>
      <h3 className="afe-kicker mb-4">{title}</h3>
      <ol className="m-0 list-none p-0">
        {regions.map((region, index) => (
          <li
            key={region}
            className="flex items-baseline gap-4 border-b border-white/[0.12] py-3"
          >
            <span className="font-mono text-xs font-medium text-volt">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-sans text-sm text-cream/80">{region}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default async function AboutPage() {
  const [page, testimonials] = await Promise.all([
    safeFetch(getAboutPage, null, "aboutPage"),
    safeFetch(() => getTestimonials(), [], "testimonials"),
  ]);

  const stats = page?.stats?.length ? page.stats : DEFAULTS.stats;
  const topEurope = page?.topRegionsEurope?.length
    ? page.topRegionsEurope
    : DEFAULTS.topEurope;
  const topWorld = page?.topRegionsWorld?.length
    ? page.topRegionsWorld
    : DEFAULTS.topWorld;

  return (
    <div className="animate-[afe-fadeup_0.45s_ease_both]">
      <PageHeader
        kicker={page?.kicker ?? DEFAULTS.kicker}
        headline={page?.headline ?? DEFAULTS.headline}
        intro={page?.intro ?? DEFAULTS.intro}
      />

      {/* ------------------------------------------------ reach */}
      <section className="px-6 py-16 lg:px-12">
        <dl className="grid grid-cols-1 border border-white/20 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`p-6 ${
                index < stats.length - 1 ? "sm:border-r sm:border-white/20" : ""
              }`}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="m-0">
                <span className="block font-display text-[clamp(28px,3vw,40px)] leading-none text-volt">
                  {stat.value}
                </span>
                <span className="mt-2 block font-sans text-[10px] font-semibold tracking-[0.12em] text-white/55">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
          <RegionList title="TOP REGIONS — EUROPE" regions={topEurope} />
          <RegionList title="TOP REGIONS — WORLDWIDE" regions={topWorld} />
        </div>
      </section>

      {/* ------------------------------------------------ story */}
      {page?.body?.length ? (
        <section className="bg-bone px-6 py-20 text-ink lg:px-12">
          <div className="max-w-[720px]">
            <PortableText
              value={page.body}
              components={{
                block: {
                  normal: ({ children }) => (
                    <p className="mb-6 font-sans text-base leading-[1.75] text-ink/75 last:mb-0">
                      {children}
                    </p>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-5 mt-10 font-display text-[clamp(22px,3vw,32px)] uppercase first:mt-0">
                      {children}
                    </h2>
                  ),
                },
              }}
            />
          </div>
        </section>
      ) : null}

      {page?.values?.length ? <NumberedGrid blocks={page.values} /> : null}

      {/* ------------------------------------------------ testimonials */}
      {testimonials.length > 0 ? (
        <section className="bg-bone px-6 py-20 text-ink lg:px-12">
          <h2 className="mb-8 font-display text-[clamp(24px,3vw,32px)] uppercase">
            What players say
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
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
          </div>
        </section>
      ) : null}
    </div>
  );
}
