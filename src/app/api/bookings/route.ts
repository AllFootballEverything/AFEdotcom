import { type NextRequest, NextResponse } from "next/server";

import { sendBookingNotification } from "@/lib/email";
import { getWriteClient } from "@/sanity/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_LENGTHS = { name: 120, email: 200, interest: 60, message: 2000 };

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/** Deliberately permissive — the goal is to catch typos, not police addresses. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  // Honeypot: a real person never fills a hidden field.
  if (clean(payload.company, 100)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(payload.name, MAX_LENGTHS.name);
  const email = clean(payload.email, MAX_LENGTHS.email);
  const interest = clean(payload.interest, MAX_LENGTHS.interest) || "GENERAL";
  const message = clean(payload.message, MAX_LENGTHS.message);
  const sessionId = clean(payload.sessionId, 100);

  if (!name) {
    return NextResponse.json({ error: "NAME REQUIRED" }, { status: 400 });
  }
  if (!looksLikeEmail(email)) {
    return NextResponse.json({ error: "VALID EMAIL REQUIRED" }, { status: 400 });
  }

  try {
    const client = getWriteClient();
    await client.create({
      _type: "bookingEnquiry",
      name,
      email,
      interest,
      ...(message && { message }),
      ...(sessionId && {
        session: { _type: "reference", _ref: sessionId },
      }),
      submittedAt: new Date().toISOString(),
      status: "new",
    });
  } catch (error) {
    console.error("[bookings] failed to persist enquiry", error);
    return NextResponse.json(
      { error: "COULD NOT SUBMIT — TRY AGAIN" },
      { status: 500 },
    );
  }

  // The enquiry is safely stored; email is a convenience on top of it.
  const notification = await sendBookingNotification({ name, email, interest, message });
  if (!notification.sent) {
    console.error(`[bookings] notification not sent: ${notification.error}`);
  }

  return NextResponse.json({ ok: true });
}
