# AFEdotcom

All Football Everything — web app.

Next.js (App Router) on Vercel, Sanity for content, Whop for memberships,
Stripe for the shop. Ported from the "AFE Website v2 (1b)" Claude Design
project.

## Stack

| Concern    | Choice                                                     |
| ---------- | ---------------------------------------------------------- |
| Framework  | Next.js 15, App Router, React 19, TypeScript               |
| Styling    | Tailwind CSS v4 (tokens in `src/app/globals.css`)          |
| Content    | Sanity v3, studio embedded at `/studio`                    |
| Membership | Whop — OAuth 2.1 + PKCE, webhooks mirrored into Sanity     |
| Commerce   | Stripe Checkout, products authored in Sanity               |
| Email      | Resend (booking enquiry notifications)                     |
| Hosting    | Vercel                                                     |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill it in — see below
npm run dev
```

The site runs at `http://localhost:3000`, the studio at
`http://localhost:3000/studio`.

> **Note:** `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
> must be set before the app will build at all — they are read at module load.
> Everything else fails softly, affecting only the feature that needs it.

## Setup checklist

### 1. Brand assets

Drop the design project's `assets/` files into `public/assets/`. See
[`public/assets/README.md`](public/assets/README.md) for the filenames.

### 2. Sanity

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage).
2. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`.
3. Add `http://localhost:3000` and your production domain to
   **API → CORS origins** (with credentials allowed).
4. Create an **Editor** token under **API → Tokens** → `SANITY_API_WRITE_TOKEN`.
   This is what writes booking enquiries and member records.
5. Open `/studio` and fill in each page, starting with **Site settings**.

**Content revalidation.** Add a webhook under **API → Webhooks**:

- URL: `https://<your-domain>/api/revalidate`
- Trigger on: create, update, delete
- Projection: `{"_type": _type}`
- Header: `x-afe-revalidate-secret: <SANITY_REVALIDATE_SECRET>`

Cache tags match document types, so publishing one board post invalidates the
board rather than the whole site.

### 3. Whop

1. Create an app in the Whop dashboard under **Developer**.
2. Add the redirect URI **exactly**:
   `https://<your-domain>/api/auth/whop/callback` (and the localhost variant
   for development). Whop requires an exact match.
3. Copy `WHOP_CLIENT_ID` (`app_…`) and `WHOP_CLIENT_SECRET`.
4. Create an API key with `member:basic:read` and `member:email:read`
   → `WHOP_API_KEY`. Set `WHOP_COMPANY_ID` to your `biz_…` id.
5. Map your plans to AFE tiers in `WHOP_TIER_MAP`:

   ```
   WHOP_TIER_MAP=plan_abc:scout,plan_def:access,plan_ghi:elite
   ```

   Plan **or** product ids work. Tiers must be `scout`, `access`, or `elite`.
   Getting this wrong is the single most likely cause of "I paid but nothing
   unlocked" — the webhook logs a warning when it sees an unmapped plan.

6. Add a webhook pointing at `https://<your-domain>/api/webhooks/whop`,
   subscribed to `membership.activated`, `membership.deactivated`,
   `membership.trial_ending_soon` and `payment.succeeded`. Copy the signing
   secret to `WHOP_WEBHOOK_SECRET`.
7. Generate a session secret: `openssl rand -base64 32` → `SESSION_SECRET`.
8. In Sanity, create a **Membership tier** document for each tier with a
   matching `key`, and paste the Whop checkout URL into `whopCheckoutUrl`.

### 4. Stripe

1. `STRIPE_SECRET_KEY` from the Stripe dashboard.
2. Webhook → `https://<your-domain>/api/webhooks/stripe`, event
   `checkout.session.completed`. Secret → `STRIPE_WEBHOOK_SECRET`.
3. Locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

Prices live in Sanity in **minor units** (`3900` = €39.00) and are resolved
server-side at checkout. The client never supplies a price.

### 5. Resend

`RESEND_API_KEY`, plus `BOOKING_NOTIFY_TO` and a verified sender in
`BOOKING_NOTIFY_FROM`.

### 6. Vercel

Import the repo, add every variable from `.env.example`, and set
`NEXT_PUBLIC_SITE_URL` to the production URL. Then update the Whop redirect
URI and both webhook URLs to match the deployed domain.

## How membership gating works

```
Whop checkout ──▶ webhook ──▶ Sanity `member` doc ──▶ page render
       │                             ▲
       └── OAuth sign-in ────────────┘  (backfill on first login)
```

- The **session cookie holds identity only** — never the tier. Entitlement is
  read per request from the mirrored `member` document, so a cancellation takes
  effect on the next page view rather than whenever the cookie expires.
- `getViewer()` (`src/lib/auth/viewer.ts`) is the single source of truth, and is
  `cache()`d so a page with a dozen gated cards does one membership read.
- Tiers are **strictly ordered** — Elite sees everything Access sees. Checks go
  through `canAccess()` in `src/lib/tiers.ts`.
- **Gated content is never sent to the browser.** Locked board posts render a
  fixed placeholder behind the blur rather than the real text, and locked
  library items never emit their body or video URL. The design blurs real copy;
  blurred copy is still readable in dev tools, so this deviates deliberately.

## Project layout

```
src/
├── app/
│   ├── (site)/            # public site — nav + footer chrome
│   ├── studio/            # embedded Sanity Studio
│   └── api/
│       ├── auth/whop/     # OAuth login + callback
│       ├── webhooks/      # whop, stripe
│       ├── bookings/      # training enquiry form
│       ├── checkout/      # Stripe Checkout session
│       └── revalidate/    # Sanity content webhook
├── components/
│   ├── forms/             # booking form
│   ├── sections/          # cards and grids
│   ├── site/              # nav, ticker, footer, member bar
│   └── ui/                # button, headline
├── lib/                   # auth, whop, tiers, stripe, email, formatting
└── sanity/                # schema, queries, client, desk structure
```

## Content model

Organised by page, matching the site:

- **Page singletons** — Home, Training, Work With AFE, Exclusive, Members,
  Shop, About, plus Site settings.
- **Library** — sessions, board posts, exclusive items, products, tiers,
  testimonials, partners. These appear on more than one page, so they are
  referenced rather than duplicated.
- **Records** — booking enquiries and Whop member mirrors. Written by the site,
  read-only in practice.

Headline fields use a small markup: `|` forces a line break, `*` wraps the
volt-coloured run. `"All|football|every*thing.*"` renders the design's hero.

## Deviations from the design source

The design is a single-page prototype with client-side page switching and
hardcoded data. Ported to real routes, this changed:

- Page switching became real routes, so each page is linkable and indexable.
- Hardcoded arrays became Sanity documents; the original values ship as
  component-level defaults so the site looks right before the dataset is filled.
- The blurred "MEMBERS ONLY" copy is now genuinely withheld (see above).
- Desktop-only layouts gained responsive breakpoints and a mobile nav drawer.
