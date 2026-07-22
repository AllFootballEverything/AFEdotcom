import { type NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * POST-only: a GET logout can be triggered by any image tag on any site.
 * The sign-out control renders as a real form submit.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
