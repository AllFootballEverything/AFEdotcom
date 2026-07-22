"use client";

import { useState } from "react";

const DEFAULT_INTERESTS = ["TECHNIQUE", "FINISHING", "FITNESS", "FULL PACKAGE"];

const INPUT_CLASS =
  "border border-white/20 bg-[#262626] p-4 font-sans text-[13px] font-semibold tracking-[0.06em] text-cream outline-none placeholder:text-cream/40 focus:border-volt";

export function BookingForm({
  interests = DEFAULT_INTERESTS,
  confirmation = "We'll hit your inbox within 48 hours with session options. 'Til the wheels fall off.",
}: {
  interests?: string[];
  confirmation?: string;
}) {
  const options = interests.length > 0 ? interests : DEFAULT_INTERESTS;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState(options[0]);
  const [company, setCompany] = useState(""); // honeypot
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const firstName = name.trim().split(" ")[0] || "legend";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.includes("@")) {
      setError("NAME + VALID EMAIL REQUIRED");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, interest, company }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "SOMETHING WENT WRONG — TRY AGAIN");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("NETWORK ERROR — TRY AGAIN");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col justify-center gap-4 border-2 border-volt p-10">
        <span className="font-display text-[clamp(26px,4vw,36px)] uppercase text-volt">
          You&apos;re in, {firstName}.
        </span>
        <p className="m-0 font-sans text-sm leading-[1.7] text-cream/80">{confirmation}</p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setName("");
            setEmail("");
          }}
          className="self-start font-sans text-xs font-black tracking-[0.06em] text-rust transition-colors hover:text-volt"
        >
          SUBMIT ANOTHER REQUEST
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
      <label className="sr-only" htmlFor="booking-name">
        Full name
      </label>
      <input
        id="booking-name"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="FULL NAME"
        className={INPUT_CLASS}
      />

      <label className="sr-only" htmlFor="booking-email">
        Email
      </label>
      <input
        id="booking-email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="EMAIL"
        className={INPUT_CLASS}
      />

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <fieldset className="m-0 flex flex-wrap gap-2.5 border-0 p-0">
        <legend className="sr-only">What do you want to work on?</legend>
        {options.map((option) => {
          const active = interest === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setInterest(option)}
              aria-pressed={active}
              className={`border px-4 py-2.5 font-sans text-xs font-bold tracking-[0.06em] transition-colors ${
                active
                  ? "border-volt bg-volt text-[#1a1a1a]"
                  : "border-white/25 text-cream/80 hover:border-volt"
              }`}
            >
              {option}
            </button>
          );
        })}
      </fieldset>

      {error ? (
        <span role="alert" className="font-sans text-xs font-bold text-rust">
          {error}
        </span>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1.5 bg-volt px-6 py-4.5 text-center font-sans text-[13px] font-black tracking-[0.08em] text-[#1a1a1a] transition-colors hover:bg-rust hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "SENDING…" : "REQUEST A SPOT →"}
      </button>
    </form>
  );
}
