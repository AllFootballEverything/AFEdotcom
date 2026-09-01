import { type NextRequest, NextResponse } from "next/server";

import { getWriteClient } from "@/sanity/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ARCHETYPES = new Set(["competitive", "independence", "resilience", "adaptability"]);

function looksLikeEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Records a self-assessment lead.
 *
 * Front end validates the email too, but never trust the client — the address
 * and the answer shape are both checked here. The lead is stored in Sanity
 * (`assessmentLead`); actually sending the Playing Abroad Toolkit is a separate
 * CRM/email step the team wires on top.
 */
export async function POST(request: NextRequest) {
  let payload: {
    email?: unknown;
    archetype?: unknown;
    scores?: unknown;
    answers?: unknown;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  if (!looksLikeEmail(payload.email)) {
    return NextResponse.json({ error: "VALID EMAIL REQUIRED" }, { status: 400 });
  }
  const email = payload.email.trim().slice(0, 200);

  const archetype =
    typeof payload.archetype === "string" && ARCHETYPES.has(payload.archetype)
      ? payload.archetype
      : undefined;

  // Answers: up to 14 integers clamped to 0–5; scores: [{key, pct}] clamped 0–100.
  const answers = Array.isArray(payload.answers)
    ? payload.answers
        .slice(0, 14)
        .map((n) => Math.max(0, Math.min(5, Math.round(Number(n) || 0))))
    : [];

  const scores = Array.isArray(payload.scores)
    ? payload.scores
        .slice(0, 8)
        .map((s) => {
          const entry = s as { key?: unknown; pct?: unknown };
          return {
            _key: typeof entry.key === "string" ? entry.key.slice(0, 40) : "x",
            key: typeof entry.key === "string" ? entry.key.slice(0, 40) : "",
            pct: Math.max(0, Math.min(100, Math.round(Number(entry.pct) || 0))),
          };
        })
        .filter((s) => s.key)
    : [];

  try {
    await getWriteClient().create({
      _type: "assessmentLead",
      email,
      ...(archetype && { archetype }),
      scores,
      answers,
      submittedAt: new Date().toISOString(),
      toolkitSent: false,
    });
  } catch (error) {
    console.error("[assessment] failed to persist lead", error);
    return NextResponse.json(
      { error: "COULD NOT SAVE — TRY AGAIN" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
