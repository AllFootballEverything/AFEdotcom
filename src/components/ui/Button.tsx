import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * The three button treatments in the design. Every one is a hard-edged block
 * of uppercase Archivo — no radii, no shadows.
 */
export type ButtonVariant = "volt" | "outline" | "dark";

const VARIANTS: Record<ButtonVariant, string> = {
  // Primary CTA: volt block, inverts to rust on hover.
  volt: "bg-volt text-[#1a1a1a] hover:bg-rust hover:text-white",
  // Secondary: hairline border on dark, picks up volt on hover.
  outline:
    "border border-white/30 text-cream hover:border-volt hover:text-volt",
  // Used on the volt footer band, where a volt button would disappear.
  dark: "bg-ink text-volt hover:bg-rust hover:text-white",
};

const BASE =
  "inline-flex items-center justify-center gap-2 px-6 py-4 font-sans font-black text-xs uppercase tracking-[0.08em] transition-colors cursor-pointer";

type ButtonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({
  href,
  variant = "volt",
  className = "",
  children,
  ...rest
}: ButtonProps & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`;

  // Absolute URLs (Whop checkout, socials) must not go through the router.
  if (/^https?:\/\//.test(href) || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={classes}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "volt",
  className = "",
  children,
  ...rest
}: ButtonProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
