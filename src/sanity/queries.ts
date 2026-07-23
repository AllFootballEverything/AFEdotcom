import "server-only";

import type { PortableTextBlock } from "@portabletext/react";
import { groq } from "next-sanity";

import { getSanityClient } from "./client";
import type {
  AboutPage,
  BoardPost,
  ExclusiveItem,
  ExclusivePage,
  HomePage,
  MembersPage,
  MembershipTier,
  Partner,
  Product,
  SessionEvent,
  ShopPage,
  SiteSettings,
  Testimonial,
  TrainingPage,
  WorkPage,
} from "./types";

/**
 * All reads go through here.
 *
 * Every page fetch is tagged so the Sanity webhook in
 * `src/app/api/revalidate/route.ts` can invalidate exactly what changed
 * instead of dumping the whole cache.
 */

type FetchOptions = { tags: string[] };

async function query<T>(
  q: string,
  params: Record<string, unknown>,
  { tags }: FetchOptions,
): Promise<T> {
  return getSanityClient().fetch<T>(q, params, {
    next: { tags, revalidate: 3600 },
  });
}

/* -------------------------------------------------------------------------- */
/* Fragments                                                                   */
/* -------------------------------------------------------------------------- */

const CTA = groq`{ label, href }`;
const STAT = groq`{ value, label }`;
const NUMBERED = groq`{ number, title, description, items, meta }`;
const SEO = groq`{ title, description, image }`;

const SESSION_FIELDS = groq`
  _id, title, "slug": slug.current, startsAt, endsAt, location,
  description, status, spotsLeft, bookingUrl, priorityTier, featured
`;

const PRODUCT_FIELDS = groq`
  _id, name, "slug": slug.current, priceCents, currency, badge,
  images, sizes, inStock, memberDiscountPercent
`;

/**
 * Board post bodies are fetched in full and trimmed on the server by the
 * gating helper. Never send a gated body to a client component.
 */
const BOARD_POST_FIELDS = groq`
  _id, title, publishedAt, visibility, body, teaserParagraphs,
  featured, likes, commentCount, views
`;

const EXCLUSIVE_FIELDS = groq`
  _id, title, "slug": slug.current, media, category, meta,
  visibility, thumbnail, videoUrl, externalUrl, publishedAt
`;

const TIER_FIELDS = groq`
  _id, key, name, price, cadence, badge, image, perks,
  whopCheckoutUrl, highlighted
`;

/* -------------------------------------------------------------------------- */
/* Global                                                                      */
/* -------------------------------------------------------------------------- */

export function getSiteSettings() {
  return query<SiteSettings | null>(
    groq`*[_type == "siteSettings"][0]{
      navCta ${CTA},
      showBookNowButton, showLoginButton, showCartButton,
      tickerEnabled, tickerLabel, tickerItems,
      tickerCta ${CTA},
      footerHeadline, footerMeta,
      footerCta ${CTA},
      socialLinks[] ${CTA},
      copyright
    }`,
    {},
    { tags: ["siteSettings"] },
  );
}

/* -------------------------------------------------------------------------- */
/* Pages                                                                       */
/* -------------------------------------------------------------------------- */

export function getHomePage() {
  return query<HomePage | null>(
    groq`*[_type == "homePage"][0]{
      title, seo ${SEO},
      heroHeadline, heroIntro, heroStats[] ${STAT}, heroMedia,
      heroCta ${CTA},
      missionKicker, missionHeadline, missionBody, missionValues,
      missionCta ${CTA},
      clubhouseKicker, clubhouseHeadline, clubhouseBody,
      clubhouseCtas[] ${CTA},
      mapHeadline, mapTopCountries, mapLegend[] ${STAT},
      eventsHeading, eventsCta ${CTA},
      partnersHeading, partnersKicker
    }`,
    {},
    { tags: ["homePage"] },
  );
}

export function getTrainingPage() {
  return query<TrainingPage | null>(
    groq`*[_type == "trainingPage"][0]{
      title, seo ${SEO}, kicker, headline, intro,
      sessionTypes[] ${NUMBERED},
      calendarHeading, bookingHeading, bookingBody,
      bookingInterests, bookingConfirmation
    }`,
    {},
    { tags: ["trainingPage"] },
  );
}

export function getWorkPage() {
  return query<WorkPage | null>(
    groq`*[_type == "workPage"][0]{
      title, seo ${SEO}, kicker, headline, intro,
      services[] ${NUMBERED},
      contactHeading, contactBody, contactEmail
    }`,
    {},
    { tags: ["workPage"] },
  );
}

export function getExclusivePage() {
  return query<ExclusivePage | null>(
    groq`*[_type == "exclusivePage"][0]{
      title, seo ${SEO}, kicker, headline, intro, categories,
      lockedCta ${CTA}
    }`,
    {},
    { tags: ["exclusivePage"] },
  );
}

export function getMembersPage() {
  return query<MembersPage | null>(
    groq`*[_type == "membersPage"][0]{
      title, seo ${SEO}, kicker, headline, intro, tiersHeading,
      boardHeading, boardIntro, boardLockedMessage,
      boardLockedCta ${CTA}
    }`,
    {},
    { tags: ["membersPage"] },
  );
}

export function getShopPage() {
  return query<ShopPage | null>(
    groq`*[_type == "shopPage"][0]{
      title, seo ${SEO}, kicker, headline, intro,
      shippingNote, memberPerkNote
    }`,
    {},
    { tags: ["shopPage"] },
  );
}

export function getAboutPage() {
  return query<AboutPage | null>(
    groq`*[_type == "aboutPage"][0]{
      title, seo ${SEO}, kicker, headline, intro, body,
      values[] ${NUMBERED},
      stats[] ${STAT},
      topRegionsEurope, topRegionsWorld
    }`,
    {},
    { tags: ["aboutPage"] },
  );
}

/* -------------------------------------------------------------------------- */
/* Collections                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Upcoming sessions only. `$now` is passed explicitly rather than using GROQ's
 * now() so the result is stable within a cache entry.
 */
export function getUpcomingSessions(limit?: number) {
  const slice = typeof limit === "number" ? `[0...${limit}]` : "";
  return query<SessionEvent[]>(
    groq`*[_type == "session" && (endsAt > $now || startsAt > $now)]
      | order(startsAt asc)${slice}{ ${SESSION_FIELDS} }`,
    { now: new Date().toISOString() },
    { tags: ["session"] },
  );
}

export function getFeaturedSessions(limit = 3) {
  return query<SessionEvent[]>(
    groq`*[_type == "session" && featured == true && (endsAt > $now || startsAt > $now)]
      | order(startsAt asc)[0...${limit}]{ ${SESSION_FIELDS} }`,
    { now: new Date().toISOString() },
    { tags: ["session"] },
  );
}

export function getBoardPosts(limit?: number) {
  const slice = typeof limit === "number" ? `[0...${limit}]` : "";
  return query<BoardPost[]>(
    groq`*[_type == "boardPost"] | order(publishedAt desc)${slice}{ ${BOARD_POST_FIELDS} }`,
    {},
    { tags: ["boardPost"] },
  );
}

export function getFeaturedBoardPosts(limit = 2) {
  return query<BoardPost[]>(
    groq`*[_type == "boardPost" && featured == true]
      | order(publishedAt desc)[0...${limit}]{ ${BOARD_POST_FIELDS} }`,
    {},
    { tags: ["boardPost"] },
  );
}

export function getExclusiveItems() {
  return query<ExclusiveItem[]>(
    groq`*[_type == "exclusiveItem"] | order(publishedAt desc){ ${EXCLUSIVE_FIELDS} }`,
    {},
    { tags: ["exclusiveItem"] },
  );
}

/**
 * Single library item, including its body.
 *
 * The body is fetched unconditionally — the *page* is responsible for checking
 * entitlement before rendering it. Keeping the gate in one place (the page)
 * rather than in the query avoids two subtly different definitions of "can
 * they see this".
 */
export function getExclusiveItemBySlug(slug: string) {
  return query<(ExclusiveItem & { body?: PortableTextBlock[] }) | null>(
    groq`*[_type == "exclusiveItem" && slug.current == $slug][0]{
      ${EXCLUSIVE_FIELDS}, body
    }`,
    { slug },
    { tags: ["exclusiveItem"] },
  );
}

export function getExclusiveSlugs() {
  return query<string[]>(
    groq`*[_type == "exclusiveItem" && defined(slug.current)].slug.current`,
    {},
    { tags: ["exclusiveItem"] },
  );
}

export function getProducts() {
  return query<Product[]>(
    groq`*[_type == "product"] | order(order asc, name asc){ ${PRODUCT_FIELDS} }`,
    {},
    { tags: ["product"] },
  );
}

export function getProductBySlug(slug: string) {
  return query<Product | null>(
    groq`*[_type == "product" && slug.current == $slug][0]{ ${PRODUCT_FIELDS} }`,
    { slug },
    { tags: ["product"] },
  );
}

export function getTiers() {
  return query<MembershipTier[]>(
    groq`*[_type == "tier"] | order(order asc){ ${TIER_FIELDS} }`,
    {},
    { tags: ["tier"] },
  );
}

export function getTestimonials(featuredOnly = false) {
  const filter = featuredOnly ? " && featured == true" : "";
  return query<Testimonial[]>(
    groq`*[_type == "testimonial"${filter}] | order(order asc){
      _id, quote, attribution, featured
    }`,
    {},
    { tags: ["testimonial"] },
  );
}

export function getPartners() {
  return query<Partner[]>(
    groq`*[_type == "partner"] | order(order asc){ _id, name, logo, url }`,
    {},
    { tags: ["partner"] },
  );
}
