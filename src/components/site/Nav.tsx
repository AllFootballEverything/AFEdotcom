"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { NAV_ITEMS } from "@/lib/nav";
import type { Cta } from "@/sanity/types";

type Props = {
  navCta?: Cta;
  /** Signed-in viewer's display name, if any. Drives the account affordance. */
  viewerName?: string | null;
  isSignedIn?: boolean;
  /**
   * Header button visibility, from Sanity site settings. Undefined means shown
   * — a missing/empty setting must never hide a control, only an explicit false.
   */
  showBookNow?: boolean;
  showLogin?: boolean;
  showCart?: boolean;
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

export function Nav({
  navCta,
  viewerName,
  isSignedIn = false,
  showBookNow,
  showLogin,
  showCart,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const cta = navCta ?? { label: "BOOK NOW", href: "/training" };
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Default to shown; only an explicit `false` from Sanity hides a control.
  const bookVisible = showBookNow !== false;
  const loginVisible = showLogin !== false;
  const cartVisible = showCart !== false;

  // LOG IN uses the site's own Whop OAuth flow (not the design's external
  // placeholder URL), returning the viewer to wherever they were. A plain <a>,
  // not <Link> — it targets an API route, so it must be a full navigation.
  const loginHref = `/api/auth/whop/login?returnTo=${encodeURIComponent(
    pathname || "/members",
  )}`;

  // Lock body scroll and allow Escape-to-close while the full-screen menu is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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

          {loginVisible || cartVisible || bookVisible ? (
            <div className="ml-4 flex items-center gap-1.5">
              {loginVisible ? (
                isSignedIn ? (
                  <Link href="/members" className={OUTLINE_BUTTON}>
                    {viewerName ? viewerName.split(" ")[0] : "ACCOUNT"}
                  </Link>
                ) : (
                  <a href={loginHref} className={OUTLINE_BUTTON}>
                    LOG IN
                  </a>
                )
              ) : null}

              {cartVisible ? (
                <Link
                  href="/shop"
                  aria-label="Cart"
                  title="Cart"
                  className="flex w-[42px] self-stretch items-center justify-center border border-white/35 text-cream transition-colors hover:border-volt hover:text-volt"
                >
                  <CartIcon />
                </Link>
              ) : null}

              {bookVisible ? (
                <Link
                  href={cta.href}
                  className="bg-volt px-5 py-3 font-sans text-xs font-black uppercase tracking-[0.08em] text-[#1a1a1a] transition-colors hover:bg-rust hover:text-white"
                >
                  {cta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
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

      {/* Mobile / tablet menu — full-screen, generously spaced */}
      <div
        id="afe-mobile-nav"
        hidden={!open}
        className="fixed inset-0 z-[60] flex h-dvh flex-col bg-ink lg:hidden"
      >
        {/* Header row inside the overlay (it covers the sticky header). */}
        <div className="flex items-center justify-between border-b-[3px] border-volt px-6 py-3.5">
          <Link href="/" aria-label="Home" onClick={() => setOpen(false)} className="flex">
            <Image
              src="/assets/afe-logo-white.png"
              alt="AFE"
              width={123}
              height={34}
              className="h-[34px] w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center text-cream transition-colors hover:text-volt"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        {/* Links take the remaining height and breathe. */}
        <nav className="flex flex-1 flex-col justify-center gap-1 overflow-y-auto px-6 py-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`py-4 font-display text-[clamp(28px,7vw,40px)] uppercase leading-none transition-colors ${
                isActive(item.href) ? "text-volt" : "text-cream hover:text-volt"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action buttons pinned to the bottom, each honouring its toggle. */}
        {loginVisible || cartVisible || bookVisible ? (
          <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-6">
            {loginVisible ? (
              isSignedIn ? (
                <Link
                  href="/members"
                  onClick={() => setOpen(false)}
                  className="border border-white/35 px-5 py-4 text-center font-sans text-sm font-bold uppercase tracking-[0.08em] text-cream"
                >
                  {viewerName ? viewerName.split(" ")[0] : "ACCOUNT"}
                </Link>
              ) : (
                <a
                  href={loginHref}
                  className="border border-white/35 px-5 py-4 text-center font-sans text-sm font-bold uppercase tracking-[0.08em] text-cream"
                >
                  LOG IN
                </a>
              )
            ) : null}

            {cartVisible ? (
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 border border-white/35 px-5 py-4 font-sans text-sm font-bold uppercase tracking-[0.08em] text-cream"
              >
                <CartIcon />
                CART
              </Link>
            ) : null}

            {bookVisible ? (
              <Link
                href={cta.href}
                onClick={() => setOpen(false)}
                className="bg-volt px-5 py-4 text-center font-sans text-sm font-black uppercase tracking-[0.08em] text-[#1a1a1a]"
              >
                {cta.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
