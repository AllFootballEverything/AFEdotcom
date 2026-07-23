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

/** Header cart glyph — 18×18 stroked outline, matches the design handoff. */
function CartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M3 4h2.5l2.2 11.5h10.6L21 8H6.1" />
      <circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Shared with the account chip so LOG IN and the signed-in name look identical.
const OUTLINE_BUTTON =
  "border border-white/35 px-[18px] py-[11px] font-sans text-xs font-bold uppercase tracking-[0.08em] text-cream transition-colors hover:border-volt hover:text-volt";

export function Nav({ navCta, viewerName, isSignedIn = false }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const cta = navCta ?? { label: "BOOK NOW", href: "/training" };
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // LOG IN uses the site's own Whop OAuth flow (not the design's external
  // placeholder URL), returning the viewer to wherever they were. A plain <a>,
  // not <Link> — it targets an API route, so it must be a full navigation.
  const loginHref = `/api/auth/whop/login?returnTo=${encodeURIComponent(
    pathname || "/members",
  )}`;

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-volt bg-ink/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-3.5 lg:px-12">
        <Link href="/" aria-label="All Football Everything — home" className="flex">
          <Image
            src="/assets/afe-logo-white.png"
            alt="AFE"
            width={123}
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
            <Link href="/members" className={`ml-4 ${OUTLINE_BUTTON}`}>
              {viewerName ? viewerName.split(" ")[0] : "ACCOUNT"}
            </Link>
          ) : (
            <a href={loginHref} className={`ml-4 ${OUTLINE_BUTTON}`}>
              LOG IN
            </a>
          )}

          {/* Cart — stretches to match the button heights either side of it. */}
          <Link
            href="/shop"
            aria-label="Cart"
            title="Cart"
            className="flex w-[42px] self-stretch items-center justify-center border border-white/35 text-cream transition-colors hover:border-volt hover:text-volt"
          >
            <CartIcon />
          </Link>

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
          {isSignedIn ? (
            <Link
              href="/members"
              onClick={() => setOpen(false)}
              className="border-b border-white/10 px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.08em] text-cream"
            >
              {viewerName ? viewerName.split(" ")[0] : "ACCOUNT"}
            </Link>
          ) : (
            <a
              href={loginHref}
              className="border-b border-white/10 px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.08em] text-cream"
            >
              LOG IN
            </a>
          )}

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
