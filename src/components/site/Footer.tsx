import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import type { SiteSettings } from "@/sanity/types";

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const headline = settings?.footerHeadline ?? "Join the movement";
  const meta = settings?.footerMeta ?? "@AFE_FOOTBALL // ALLFOOTBALLEVERYTHING.COM";
  const cta = settings?.footerCta ?? { label: "GET STARTED →", href: "/training" };
  const copyright = settings?.copyright ?? "© 2026 ALL FOOTBALL EVERYTHING®";
  const socials = settings?.socialLinks ?? [];

  return (
    <footer>
      <div className="flex flex-col items-start justify-between gap-8 bg-volt px-6 py-12 text-[#1a1a1a] lg:flex-row lg:items-center lg:px-12 lg:py-15">
        <div>
          <div className="font-display text-[clamp(38px,6vw,64px)] uppercase leading-none">
            {headline}
          </div>
          <div className="mt-4 font-mono text-xs font-medium tracking-[0.1em] opacity-75">
            {meta}
          </div>
        </div>
        <ButtonLink href={cta.href} variant="dark" className="px-7 py-4.5 text-[13px]">
          {cta.label}
        </ButtonLink>
      </div>

      <div className="flex flex-col gap-4 bg-ink px-6 py-5 font-mono text-[11px] font-medium tracking-[0.08em] text-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <span>{copyright}</span>
        {socials.length > 0 ? (
          <div className="flex gap-5">
            {socials.map((social) => (
              <Link
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/45 transition-colors hover:text-volt"
              >
                {social.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
