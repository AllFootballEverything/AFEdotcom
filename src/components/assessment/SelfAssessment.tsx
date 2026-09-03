"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ANSWER_LABELS,
  ARCHETYPES,
  COPY,
  QUESTIONS,
  TOTAL_QUESTIONS,
  resolveArchetype,
  scoreCategories,
} from "@/lib/assessment";

type Screen = "intro" | "quiz" | "results";

/** The AFE mark used in the dialog header — pure CSS, per the handoff. */
function Mark() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-[22px] w-[22px] bg-volt"
      style={{ clipPath: "polygon(0% 100%, 60% 0%, 100% 0%, 100% 30%, 45% 100%)" }}
    />
  );
}

const CARD = "#2A272A";

export function SelfAssessment() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => Array(TOTAL_QUESTIONS).fill(0));
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setScreen("intro");
    setIndex(0);
    setAnswers(Array(TOTAL_QUESTIONS).fill(0));
    setEmail("");
    setSubmitted(false);
    setSendError("");
  }, []);

  const close = useCallback(() => setQuizOpen(false), []);

  // Body scroll lock + Escape-to-close while the dialog is open.
  useEffect(() => {
    if (!quizOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [quizOpen, close]);

  // Never leave the auto-advance timer running after unmount.
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  function pick(value: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      if (index < TOTAL_QUESTIONS - 1) setIndex((i) => i + 1);
      else setScreen("results");
    }, 180);
  }

  const scores = scoreCategories(answers);
  const archetypeKey = resolveArchetype(scores);
  const archetype = ARCHETYPES[archetypeKey];

  async function submitEmail() {
    if (!email.includes("@") || sending) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          archetype: archetypeKey,
          scores: scores.map((s) => ({ key: s.key, pct: s.pct })),
          answers,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSendError(data.error ?? "Something went wrong — try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setSendError("Network error — try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* ---------------------------------------------- homepage CTA band */}
      <section className="flex flex-wrap items-center justify-between gap-8 border-t border-white/[0.12] bg-ink-deep px-6 py-14 lg:px-12">
        <div>
          <p className="mb-3.5 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-rust">
            {COPY.eyebrow}
          </p>
          <h2 className="font-display text-[clamp(38px,5vw,52px)] uppercase leading-none tracking-[0.01em] text-white">
            Are you ready to <span className="text-volt">play abroad?</span>
          </h2>
          <p className="mt-4 max-w-[480px] font-sans text-sm leading-[1.6] text-cream/65">
            {COPY.ctaSub}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setQuizOpen(true)}
          className="bg-volt px-[30px] py-[18px] font-sans text-[13px] font-black uppercase tracking-[0.08em] text-ink transition-colors hover:bg-rust hover:text-white"
        >
          {COPY.ctaButton}
        </button>
      </section>

      {/* ---------------------------------------------- dialog */}
      {quizOpen ? (
        <div
          role="presentation"
          onClick={close}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
          style={{ background: "rgba(16,14,16,.8)" }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Are you ready to play abroad? — self-assessment"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-[640px] overflow-auto border border-white/[0.18] bg-ink px-9 pb-11 pt-7 outline-none"
          >
            {/* header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mark />
                <span className="font-display text-xl uppercase">AFE</span>
              </div>
              <div className="flex items-center gap-4">
                {screen === "quiz" ? (
                  <span className="font-sans text-xs font-semibold text-cream/50">
                    {String(index + 1).padStart(2, "0")} / {TOTAL_QUESTIONS}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="text-lg leading-none text-cream/70 transition-colors hover:text-volt"
                >
                  ✕
                </button>
              </div>
            </div>

            {screen === "intro" ? (
              <IntroScreen onStart={() => setScreen("quiz")} />
            ) : null}

            {screen === "quiz" ? (
              <QuizScreen
                index={index}
                selected={answers[index]}
                onPick={pick}
                onBack={() => setIndex((i) => Math.max(0, i - 1))}
              />
            ) : null}

            {screen === "results" ? (
              <ResultsScreen
                archetype={archetype}
                archetypeKey={archetypeKey}
                scores={scores}
                email={email}
                onEmail={setEmail}
                onSubmit={submitEmail}
                sending={sending}
                submitted={submitted}
                sendError={sendError}
                onRetake={reset}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------------- */

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-rust">
        {COPY.eyebrow}
      </p>
      <h3 className="font-display text-[clamp(40px,7vw,54px)] uppercase leading-none">
        {COPY.introHeadline}
      </h3>
      <p className="mt-5 font-sans text-[15px] leading-[1.7] text-cream/60">
        {COPY.introParagraph}
      </p>
      <div
        className="mt-6 border-l-[3px] border-volt px-5 py-[18px] font-sans text-[13px] leading-[1.6] text-cream/70"
        style={{ background: CARD }}
      >
        {COPY.introNote}
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-7 w-full bg-volt px-6 py-[18px] font-display text-[19px] uppercase text-ink transition-colors hover:bg-rust hover:text-white"
      >
        {COPY.introButton}
      </button>
    </div>
  );
}

function QuizScreen({
  index,
  selected,
  onPick,
  onBack,
}: {
  index: number;
  selected: number;
  onPick: (value: number) => void;
  onBack: () => void;
}) {
  const question = QUESTIONS[index];
  const progress = (index / TOTAL_QUESTIONS) * 100;

  return (
    <div>
      <div className="h-1 w-full" style={{ background: CARD }}>
        <div
          className="h-full bg-volt transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mb-3 mt-6 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-rust">
        // QUESTION {index + 1}
      </p>
      <h3 className="font-display text-[30px] uppercase leading-[1.15]">
        {question.text}
      </h3>
      {question.sub ? (
        <p className="mt-2 font-sans text-[13px] italic leading-[1.55] text-cream/55">
          {question.sub}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-2.5">
        {ANSWER_LABELS.map((label, i) => {
          const value = i + 1;
          const isSelected = selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onPick(value)}
              aria-pressed={isSelected}
              className={`flex items-center gap-4 border px-[18px] py-[15px] text-left transition-colors ${
                isSelected ? "border-volt" : "border-white/[0.14] hover:border-volt"
              }`}
              style={{ background: isSelected ? "#33361A" : CARD }}
            >
              <span
                className={`font-display text-xl ${isSelected ? "text-volt" : "text-cream/50"}`}
              >
                {value}
              </span>
              <span className="font-sans text-sm text-cream/70">{label}</span>
            </button>
          );
        })}
      </div>

      {index > 0 ? (
        <button
          type="button"
          onClick={onBack}
          className="mt-5 font-sans text-[13px] text-cream/50 transition-colors hover:text-volt"
        >
          ← back
        </button>
      ) : null}
    </div>
  );
}

function ResultsScreen({
  archetype,
  archetypeKey,
  scores,
  email,
  onEmail,
  onSubmit,
  sending,
  submitted,
  sendError,
  onRetake,
}: {
  archetype: { name: string; tagline: string; copy: string };
  archetypeKey: string;
  scores: { key: string; label: string; pct: number }[];
  email: string;
  onEmail: (value: string) => void;
  onSubmit: () => void;
  sending: boolean;
  submitted: boolean;
  sendError: string;
  onRetake: () => void;
}) {
  const emailValid = email.includes("@");

  return (
    <div>
      <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-rust">
        // YOUR RESULT
      </p>

      <div
        className="border border-white/[0.14] px-6 py-7 text-center"
        style={{ background: CARD }}
      >
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-cream/50">
          You are
        </p>
        <p className="mt-1 font-display text-[44px] uppercase leading-none text-volt">
          {archetype.name}
        </p>
        <p className="mt-3 font-sans text-sm italic text-white">{archetype.tagline}</p>
        <p className="mt-3 font-sans text-[13px] leading-[1.65] text-cream/70">
          {archetype.copy}
        </p>
      </div>

      <p className="mb-4 mt-8 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-rust">
        // YOUR BREAKDOWN
      </p>
      <div className="flex flex-col gap-[18px]">
        {scores.map((s) => (
          <div key={s.key}>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-cream/80">
                {s.label}
              </span>
              <span className="font-display text-base text-cream">{s.pct}%</span>
            </div>
            <div className="h-2 w-full" style={{ background: CARD }}>
              <div
                className="h-full bg-volt transition-[width] duration-[600ms] ease-out"
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {submitted ? (
        <div
          className="mt-8 border-l-[3px] border-volt px-5 py-[18px] font-sans text-sm leading-[1.6] text-white"
          style={{ background: CARD }}
        >
          {COPY.confirmation}
        </div>
      ) : (
        <div className="mt-8">
          <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-rust">
            // GET YOUR FULL BREAKDOWN
          </p>
          <p className="mb-4 font-sans text-[13px] leading-[1.6] text-cream/70">
            {COPY.emailIntro}
          </p>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && emailValid) onSubmit();
            }}
            placeholder={COPY.emailPlaceholder}
            aria-label="Email address"
            className="w-full border border-white/[0.18] px-4 py-3.5 font-sans text-sm text-cream outline-none placeholder:text-cream/40 focus:border-volt"
            style={{ background: CARD }}
          />
          {sendError ? (
            <p role="alert" className="mt-2 font-sans text-xs font-bold text-rust">
              {sendError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!emailValid || sending}
            className={`mt-3 w-full px-6 py-[15px] font-display text-[17px] uppercase transition-colors ${
              emailValid && !sending
                ? "bg-volt text-ink hover:bg-rust hover:text-white"
                : "cursor-not-allowed text-cream/45"
            }`}
            style={emailValid && !sending ? undefined : { background: "#3A342F" }}
          >
            {sending ? "SENDING…" : COPY.emailButton}
          </button>
        </div>
      )}

      <ShareRow archetype={archetype} archetypeKey={archetypeKey} scores={scores} />

      <button
        type="button"
        onClick={onRetake}
        className="mt-6 font-sans text-[13px] text-cream/50 transition-colors hover:text-volt"
      >
        ← retake the assessment
      </button>
    </div>
  );
}

/**
 * Share the archetype result.
 *
 * On devices with the Web Share API (mostly mobile) the primary button opens
 * the native share sheet; elsewhere it copies the link and confirms. X and
 * WhatsApp are always offered as explicit fallbacks so desktop has a path too.
 *
 * The URL is read from window.location.origin at click time rather than an env
 * var, so a shared link always points at wherever the site is actually served.
 */
function ShareRow({
  archetype,
  archetypeKey,
  scores,
}: {
  archetype: { name: string; tagline: string };
  archetypeKey: string;
  scores: { key: string; pct: number }[];
}) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  const [working, setWorking] = useState(false);
  // Whether the browser can share an actual image file. Read after mount so
  // the button label is stable between server and client render.
  const [canShareFiles, setCanShareFiles] = useState(false);

  useEffect(() => {
    setCanShareFiles(
      typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        typeof navigator.share === "function",
    );
  }, []);

  const shareText = `I'm ${archetype.name} — ${archetype.tagline} Are you ready to play abroad? Take AFE's self-assessment:`;
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://allfootballeverything.com";

  /** URL of the generated Instagram Story card for this exact result. */
  function cardUrl(): string {
    const params = new URLSearchParams({ archetype: archetypeKey });
    for (const s of scores) params.set(s.key, String(s.pct));
    return `/api/assessment/card?${params.toString()}`;
  }

  /**
   * The Instagram path. Instagram has no web share intent and won't take a URL,
   * so we hand it an image: fetch the generated card, then on mobile open the
   * native share sheet with the file (Instagram appears as a target → Story),
   * and everywhere else download the PNG to post manually.
   */
  async function shareCard() {
    if (working) return;
    setWorking(true);
    setStatus("");
    try {
      const res = await fetch(cardUrl());
      if (!res.ok) throw new Error("card generation failed");
      const blob = await res.blob();
      const file = new File([blob], "afe-result.png", { type: "image/png" });

      if (canShareFiles && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: `${shareText} ${shareUrl}` });
        } catch {
          // Share sheet dismissed — not an error.
        }
        return;
      }

      // Desktop / no file share: download so it can be posted from a phone.
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "afe-result.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      setStatus("Card saved — post it to your story.");
    } catch {
      setStatus("Couldn't generate the card — try again.");
    } finally {
      setWorking(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  const buttonClass =
    "flex items-center justify-center gap-2 border border-white/[0.18] px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.08em] text-cream transition-colors hover:border-volt hover:text-volt disabled:opacity-50";

  return (
    <div className="mt-8">
      <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-rust">
        // SHARE YOUR RESULT
      </p>

      {/* Primary: the shareable image card (the Instagram path). */}
      <button
        type="button"
        onClick={shareCard}
        disabled={working}
        className={`w-full bg-volt !text-ink hover:bg-rust hover:!text-white ${buttonClass} border-volt`}
      >
        {working
          ? "PREPARING…"
          : canShareFiles
            ? "SHARE MY RESULT CARD"
            : "SAVE CARD FOR INSTAGRAM"}
      </button>
      {status ? (
        <p role="status" className="mt-2 font-sans text-[11px] text-cream/60">
          {status}
        </p>
      ) : null}

      {/* Secondary: link-based shares. */}
      <div className="mt-2.5 grid grid-cols-3 gap-2.5">
        <a href={xHref} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          X
        </a>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          WHATSAPP
        </a>
        <button type="button" onClick={copyLink} className={buttonClass}>
          {copied ? "COPIED ✓" : "COPY LINK"}
        </button>
      </div>
    </div>
  );
}
