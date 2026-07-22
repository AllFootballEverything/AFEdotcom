import type { Metadata } from "next";

import { NumberedGrid, PageHeader } from "@/components/sections/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { getWorkPage } from "@/sanity/queries";
import { safeFetch } from "@/sanity/safe";

export const revalidate = 3600;

const DEFAULTS = {
  kicker: "WORK WITH AFE — SERVICES",
  headline: "Built for brands|*that get it.*",
  intro:
    "Training, strategy and marketing for brands and players who want the real thing. Concept to execution, with people who live the game.",
  services: [
    {
      number: "S.01",
      title: "Training",
      items: [
        "Elite pro-player in-person training",
        "Expert group sessions & camps",
        "Scouting, player tracking & agent consultancy",
        "Community events",
      ],
    },
    {
      number: "S.02",
      title: "Strategy & Consultancy",
      items: [
        "Marketing brand strategy",
        "Brand campaign strategy — concept to execution",
        "Performance apparel consultancy & wear testing",
        "Boot design consultancy & wear testing",
      ],
    },
    {
      number: "S.03",
      title: "Marketing",
      items: [
        "Always-on content — organic brand & product features",
        "Boot launch & collection campaigns, product collabs",
        "Bespoke brand content or ambassadorship",
        "Key-moment hosting & content coverage",
      ],
    },
  ],
  contactHeading: "Let's make|*something.*",
  contactBody:
    "Tell us what you're working on. Campaigns, collabs, consultancy — if it moves the game forward, we want to hear about it.",
  contactEmail: "hello@allfootballeverything.com",
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeFetch(getWorkPage, null, "workPage");
  return {
    title: page?.seo?.title ?? "Work With AFE",
    description: page?.seo?.description ?? DEFAULTS.intro,
  };
}

export default async function WorkPage() {
  const page = await safeFetch(getWorkPage, null, "workPage");
  const services = page?.services?.length ? page.services : DEFAULTS.services;
  const email = page?.contactEmail ?? DEFAULTS.contactEmail;

  return (
    <div className="animate-[afe-fadeup_0.45s_ease_both]">
      <PageHeader
        kicker={page?.kicker ?? DEFAULTS.kicker}
        headline={page?.headline ?? DEFAULTS.headline}
        intro={page?.intro ?? DEFAULTS.intro}
      />

      <NumberedGrid blocks={services} />

      <section className="grid grid-cols-1 items-center gap-12 bg-bone px-6 py-20 text-ink lg:grid-cols-2 lg:px-12">
        <div>
          <p className="afe-kicker mb-4.5">GET IN TOUCH</p>
          <Headline
            as="h2"
            text={page?.contactHeading ?? DEFAULTS.contactHeading}
            accent="rust"
            className="font-display text-[clamp(30px,4.4vw,48px)] uppercase leading-[1.05]"
          />
          <p className="mt-5 max-w-[440px] font-sans text-sm leading-[1.7] text-ink/65">
            {page?.contactBody ?? DEFAULTS.contactBody}
          </p>
        </div>

        <div className="flex flex-col items-start gap-5 border border-black/15 bg-white p-9">
          <span className="afe-meta text-ink/50">DIRECT LINE</span>
          <a
            href={`mailto:${email}`}
            className="font-display text-[clamp(18px,2.4vw,26px)] break-all text-ink transition-colors hover:text-rust"
          >
            {email}
          </a>
          <ButtonLink href={`mailto:${email}`} variant="dark">
            START A CONVERSATION →
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
