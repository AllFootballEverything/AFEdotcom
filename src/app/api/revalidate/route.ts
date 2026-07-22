import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { timingSafeEqualString } from "@/lib/crypto";

/**
 * Sanity content webhook.
 *
 * Configure in Sanity: Manage -> API -> Webhooks
 *   URL:     https://<site>/api/revalidate
 *   Trigger: Create, Update, Delete
 *   Filter:  (leave empty to cover every type)
 *   Projection: {"_type": _type}
 *   Headers: x-afe-revalidate-secret: <SANITY_REVALIDATE_SECRET>
 *
 * The cache tags match the `tags` passed in `src/sanity/queries.ts`, so
 * publishing one board post invalidates the board — not the whole site.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "SANITY_REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  const provided = request.headers.get("x-afe-revalidate-secret") ?? "";
  if (!timingSafeEqualString(provided, secret)) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  let body: { _type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const type = body._type;
  if (!type) {
    return NextResponse.json(
      { error: 'Payload is missing _type — check the webhook projection is {"_type": _type}' },
      { status: 400 },
    );
  }

  revalidateTag(type);

  return NextResponse.json({ revalidated: true, tag: type });
}
