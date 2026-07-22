"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { NAV_ITEMS } from "@/lib/nav";
import type { Cta } from "@/sanity/types";

type Props = {
  navCta?: Cta;
  /** Signed-in viewer's display name, if any. Drives the account affordance. */
  viewerName?: string | null;
  isSignedIn?: boolean;
};

export function Nav({ navCta, viewerName, isSignedIn = false }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const cta = navCta ?? { label: "BOOK NOW", href: "/training" };
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-volt bg-ink/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-3.5 lg:px-12">
        <Link href="/" aria-label="All Football Everything — home" className="flex">
          <Image
            src="/assets/afe-logo-white.png"
            alt="AFE"
            width={120}
            height={34}
            priority
            className="h-[34px] w-auto"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.08em] transition-colors hover:text-volt ${
                isActive(item.href)
                  ? "border-volt text-volt"
                  : "border-transparent text-cream"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {isSignedIn ? (
            <Link
              href="/members"
              className="ml-3 border border-white/25 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.08em] text-cream transition-colors hover:border-volt hover:text-volt"
            >
              {viewerName ? viewerName.split(" ")[0] : "ACCOUNT"}
            </Link>
          ) : null}

          <Link
            href={cta.href}
            className="ml-4 bg-volt px-5 py-3 font-sans text-xs font-black uppercase tracking-[0.08em] text-[#1a1a1a] transition-colors hover:bg-rust hover:text-white"
          >
            {cta.label}
          </Link>
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="afe-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`block h-[2px] w-6 bg-cream transition-transform ${
              open ? "translate-y-[8px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-6 bg-cream transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-6 bg-cream transition-transform ${
              open ? "-translate-y-[8px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="afe-mobile-nav"
        hidden={!open}
        className="border-t border-white/10 bg-ink lg:hidden"
      >
        <nav className="flex flex-col">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`border-b border-white/10 px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.08em] ${
                isActive(item.href) ? "text-volt" : "text-cream"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={cta.href}
            onClick={() => setOpen(false)}
            className="bg-volt px-6 py-4 text-center font-sans text-sm font-black uppercase tracking-[0.08em] text-[#1a1a1a]"
          >
            {cta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
