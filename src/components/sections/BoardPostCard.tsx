import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";

import { formatEventDate } from "@/lib/format";
import { type Tier, canAccess } from "@/lib/tiers";
import type { BoardPost, Cta } from "@/sanity/types";

/**
 * Filler shown in place of gated paragraphs.
 *
 * The design blurs the real copy — but blurred text is still text in the DOM,
 * readable by anyone who opens dev tools or disables CSS. So the locked
 * portion is never sent: we render this stand-in at roughly the right length
 * and blur that instead. Visually identical, actually private.
 *
 * This component must stay a server component for that guarantee to hold.
 */
const REDACTED =
  "Members get the full breakdown here, including the specifics we only share inside the Clubhouse.";

export type BoardTheme = "dark" | "light";

const THEME = {
  dark: {
    card: "border-white/[0.16] bg-ink-panel text-cream",
    body: "text-cream/85",
    handle: "text-white/45",
    badge: "bg-volt text-[#1a1a1a]",
    footer: "text-white/45 border-white/10",
  },
  light: {
    card: "border-black/[0.09] bg-white text-ink",
    body: "text-ink/[0.88]",
    handle: "text-ink/50",
    badge: "bg-ink text-volt",
    footer: "text-ink/50 border-black/[0.08]",
  },
} as const;

export function BoardPostCard({
  post,
  viewerTier,
  lockedMessage = "🔒 MEMBERS ONLY",
  lockedCta,
  theme = "dark",
  variant = "full",
}: {
  post: BoardPost;
  viewerTier: Tier | null;
  lockedMessage?: string;
  lockedCta?: Cta;
  theme?: BoardTheme;
  /** `teaser` is the homepage treatment: solid ink card in the light band. */
  variant?: "full" | "teaser";
}) {
  const unlocked = canAccess(viewerTier, post.visibility);
  const teaserCount = Math.max(post.teaserParagraphs ?? 1, 0);

  // Only blocks the viewer is entitled to are ever passed to PortableText.
  const visibleBlocks = unlocked ? post.body : post.body.slice(0, teaserCount);
  const hasHiddenContent = !unlocked && post.body.length > teaserCount;

  const styles = THEME[theme];
  const cardClass =
    variant === "teaser"
      ? "border-ink bg-ink text-cream"
      : styles.card;

  const portableComponents = {
    block: {
      normal: ({ children }: { children?: React.ReactNode }) => (
        <p
          className={`mb-3 font-sans text-sm leading-[1.65] last:mb-0 ${
            variant === "teaser" ? "text-cream/85" : styles.body
          }`}
        >
          {children}
        </p>
      ),
    },
  };

  return (
    <article className={`flex flex-col gap-3.5 border p-7 transition-colors hover:border-volt ${cardClass}`}>
      <header className="flex items-center gap-3">
        <Image
          src="/assets/afe-logo-orange.png"
          alt=""
          width={36}
          height={36}
          className="h-9 w-9"
        />
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-[13px] font-bold">
            AFE{" "}
            <span
              className={`font-mono text-xs font-medium ${
                variant === "teaser" ? "text-white/50" : styles.handle
              }`}
            >
              @afefootball
            </span>
          </span>
          <span
            className={`font-mono text-[11px] font-medium ${
              variant === "teaser" ? "text-white/45" : styles.handle
            }`}
          >
            {formatEventDate(post.publishedAt)}
          </span>
        </div>
        <span
          className={`ml-auto px-2.5 py-1.5 font-sans text-[10px] font-black tracking-[0.08em] ${
            variant === "teaser" ? "bg-volt text-[#1a1a1a]" : styles.badge
          }`}
        >
          {post.visibility === "public" ? "ALL MEMBERS" : post.visibility.toUpperCase()}
        </span>
      </header>

      <div>
        <PortableText value={visibleBlocks} components={portableComponents} />
      </div>

      {hasHiddenContent ? (
        <div className="relative">
          <p
            aria-hidden="true"
            className={`m-0 select-none font-sans text-sm leading-[1.65] blur-[5px] ${
              variant === "teaser" ? "text-cream/85" : styles.body
            }`}
          >
            {REDACTED}
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-volt px-3 py-2 text-center font-sans text-[11px] font-black tracking-[0.08em] text-[#1a1a1a]">
              {lockedMessage}
            </span>
          </div>
        </div>
      ) : null}

      <footer
        className={`mt-auto flex items-center gap-6 border-t pt-4 font-mono text-xs font-medium ${
          variant === "teaser" ? "border-white/10 text-white/45" : styles.footer
        }`}
      >
        {unlocked ? (
          <>
            <span>💬 {post.commentCount ?? 0}</span>
            <span>♥ {post.likes ?? 0}</span>
            {post.views ? <span>{post.views} VIEWS</span> : null}
          </>
        ) : lockedCta ? (
          <Link
            href={lockedCta.href}
            className="font-sans text-xs font-black tracking-[0.06em] text-volt"
          >
            {lockedCta.label}
          </Link>
        ) : null}
      </footer>
    </article>
  );
}
