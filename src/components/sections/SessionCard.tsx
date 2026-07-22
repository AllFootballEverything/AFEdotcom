import Link from "next/link";

import { formatEventDate } from "@/lib/format";
import { TIER_BADGE } from "@/lib/tiers";
import type { SessionEvent } from "@/sanity/types";

const STATUS_LABEL: Record<SessionEvent["status"], string> = {
  open: "RESERVE ↗",
  limited: "SPOTS LEFT ↗",
  full: "WAITLIST",
};

/**
 * A single upcoming session.
 *
 * `compact` is the homepage treatment (date, title, place only); the full
 * variant adds the booking status and priority-tier flag used on Training.
 */
export function SessionCard({
  session,
  compact = false,
  href = "/training#book",
}: {
  session: SessionEvent;
  compact?: boolean;
  href?: string;
}) {
  const destination = session.bookingUrl ?? href;
  const isExternal = /^https?:\/\//.test(destination);

  const statusText =
    session.status === "limited" && typeof session.spotsLeft === "number"
      ? `${session.spotsLeft} SPOTS LEFT ↗`
      : STATUS_LABEL[session.status];

  const inner = (
    <>
      <span className="font-display text-[22px] leading-none text-volt">
        {formatEventDate(session.startsAt)}
      </span>
      {/* Explicit text-cream: the card is an <a>, and the global a{color:volt}
          rule would otherwise tint this title volt instead of white. */}
      <span className="font-sans text-base font-bold uppercase text-cream">
        {session.title}
      </span>
      <span className="font-mono text-xs font-medium text-white/50">
        {session.location}
      </span>

      {!compact ? (
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span
            className={`font-sans text-[11px] font-black tracking-[0.08em] ${
              session.status === "full" ? "text-white/40" : "text-volt"
            }`}
          >
            {statusText}
          </span>
          {session.priorityTier ? (
            <span className="bg-volt px-2 py-1 font-sans text-[9px] font-black tracking-[0.08em] text-[#1a1a1a]">
              {TIER_BADGE[session.priorityTier]} PRIORITY
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const className =
    "flex cursor-pointer flex-col gap-3.5 border border-white/[0.18] p-6 transition-colors hover:border-volt hover:bg-ink-panel";

  if (isExternal) {
    return (
      <a
        href={destination}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={destination} className={className}>
      {inner}
    </Link>
  );
}
