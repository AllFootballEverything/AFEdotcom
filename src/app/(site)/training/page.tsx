import type { Metadata } from "next";
import Link from "next/link";

import { BookingForm } from "@/components/forms/BookingForm";
import { NumberedGrid, PageHeader } from "@/components/sections/PageHeader";
import { formatEventDate } from "@/lib/format";
import { TIER_BADGE } from "@/lib/tiers";
import { getTrainingPage, getUpcomingSessions } from "@/sanity/queries";
import { safeFetch } from "@/sanity/safe";

export const revalidate = 3600;

const DEFAULTS = {
  kicker: "TRAINING — SESSIONS & CAMPS",
  headline: "Elite training.|*Zero fluff.*",
  intro:
    "High intensity, elite quality. Small and large group sessions built to develop the complete player — first touch, speed of play, finishing, fitness.",
  sessionTypes: [
    {
      number: "T.01",
      title: "1:1 Elite Training",
      description:
        "In-person pro-player training. Honest feedback on where you are and what to change — tailored to your position and goals.",
      meta: "FROM €120 / SESSION",
    },
    {
      number: "T.02",
      title: "Group Sessions",
      description:
        "Small and large groups. First touch, control, finishing — high demands, high intensity, and a good laugh in between.",
      meta: "FROM €35 / PLAYER",
    },
    {
      number: "T.03",
      title: "Training Camps",
      description:
        "Multi-day off-season camps to stay sharp and arrive ready for pre-season. Meet players from all over.",
      meta: "SEASONAL — SEE DATES",
    },
  ],
  bookingHeading: "Show up.|We handle the rest.",
  bookingBody:
    "Tell us what you want to work on and where you're based. We'll get back within 48 hours with a plan.",
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeFetch(getTrainingPage, null, "trainingPage");
  return {
    title: page?.seo?.title ?? "Training",
    description: page?.seo?.description ?? DEFAULTS.intro,
  };
}

export default async function TrainingPage() {
  const [page, sessions] = await Promise.all([
    safeFetch(getTrainingPage, null, "trainingPage"),
    safeFetch(() => getUpcomingSessions(), [], "upcomingSessions"),
  ]);

  const sessionTypes = page?.sessionTypes?.length
    ? page.sessionTypes
    : DEFAULTS.sessionTypes;

  return (
    <div className="animate-[afe-fadeup_0.45s_ease_both]">
      <PageHeader
        kicker={page?.kicker ?? DEFAULTS.kicker}
        headline={page?.headline ?? DEFAULTS.headline}
        intro={page?.intro ?? DEFAULTS.intro}
      />

      <NumberedGrid blocks={sessionTypes} />

      {/* ------------------------------------------------ schedule */}
      {sessions.length > 0 ? (
        <section className="bg-bone px-6 py-18 text-ink lg:px-12">
          <h2 className="mb-7 font-display text-[clamp(24px,3vw,32px)] uppercase">
            {page?.calendarHeading ?? "Upcoming sessions"}
          </h2>

          <ul className="m-0 list-none border-t border-black/15 p-0">
            {sessions.map((session) => {
              const statusText =
                session.status === "full"
                  ? "WAITLIST"
                  : session.status === "limited" && typeof session.spotsLeft === "number"
                    ? `${session.spotsLeft} SPOTS LEFT ↗`
                    : "RESERVE ↗";

              return (
                <li
                  key={session._id}
                  className="grid grid-cols-1 items-center gap-2 border-b border-black/15 px-2 py-5 transition-colors hover:bg-white sm:grid-cols-[110px_1fr] lg:grid-cols-[150px_1fr_220px_170px] lg:gap-5"
                >
                  <span className="font-display text-xl text-ink">
                    {formatEventDate(session.startsAt)}
                  </span>
                  <span className="font-sans text-base font-bold uppercase tracking-[0.02em]">
                    {session.title}
                  </span>
                  <span className="font-mono text-xs font-medium text-ink/55">
                    {session.location}
                  </span>

                  <span className="flex items-center gap-3">
                    {session.bookingUrl ? (
                      <a
                        href={session.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-xs font-black tracking-[0.06em] text-ink transition-colors hover:text-rust"
                      >
                        {statusText}
                      </a>
                    ) : (
                      <Link
                        href="/training#book"
                        className={`font-sans text-xs font-black tracking-[0.06em] transition-colors hover:text-rust ${
                          session.status === "full" ? "text-ink/40" : "text-ink"
                        }`}
                      >
                        {statusText}
                      </Link>
                    )}
                    {session.priorityTier ? (
                      <span className="bg-ink px-2 py-1 font-sans text-[9px] font-black tracking-[0.08em] text-volt">
                        {TIER_BADGE[session.priorityTier]} FIRST
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* ------------------------------------------------ booking */}
      <section
        id="book"
        className="grid scroll-mt-24 grid-cols-1 gap-14 bg-ink px-6 py-18 lg:grid-cols-2 lg:px-12"
      >
        <div>
          <p className="afe-kicker mb-4.5">BOOK YOUR SESSION</p>
          <h2 className="font-display text-[clamp(30px,4.2vw,48px)] uppercase leading-[1.05]">
            {(page?.bookingHeading ?? DEFAULTS.bookingHeading)
              .split("|")
              .map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
          </h2>
          <p className="mt-5.5 max-w-[420px] font-sans text-sm leading-[1.7] text-cream/70">
            {page?.bookingBody ?? DEFAULTS.bookingBody}
          </p>
        </div>

        <BookingForm
          interests={page?.bookingInterests ?? []}
          confirmation={page?.bookingConfirmation ?? undefined}
        />
      </section>
    </div>
  );
}
