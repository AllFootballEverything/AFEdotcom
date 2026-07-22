import { defineField, defineType } from "sanity";

/**
 * Page singletons.
 *
 * Every page on the site gets exactly one document here, so an editor opens
 * "Home" and edits the home page rather than hunting through a flat pile of
 * content. Repeating things that live on more than one page (sessions, board
 * posts, products, tiers) stay in `collections.ts` and are referenced or
 * queried by the page.
 *
 * Singleton-ness is enforced by the desk structure in `structure.ts` plus the
 * document actions filter in `sanity.config.ts` — the schema itself is an
 * ordinary document type.
 */

/**
 * Title + SEO, shared by every page.
 *
 * Built by a function rather than a shared array so the field group can be set
 * at definition time — spreading a `defineField` result to bolt on `group`
 * afterwards widens the type and loses the schema validation.
 */
const pageBase = (groups?: { title?: string; seo?: string }) => [
  defineField({
    name: "title",
    title: "Page title",
    type: "string",
    ...(groups?.title && { group: groups.title }),
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "seo",
    title: "SEO",
    type: "seo",
    ...(groups?.seo && { group: groups.seo }),
  }),
];

/* -------------------------------------------------------------------------- */

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  description: "Global chrome — navigation, ticker, footer. Applies to every page.",
  groups: [
    { name: "nav", title: "Navigation" },
    { name: "ticker", title: "Ticker" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    defineField({
      name: "navCta",
      title: "Nav button",
      type: "cta",
      group: "nav",
      description: 'The volt button top-right. Design default: "BOOK NOW" → /training',
    }),
    defineField({
      name: "tickerEnabled",
      title: "Show the Clubhouse ticker",
      type: "boolean",
      group: "ticker",
      initialValue: true,
    }),
    defineField({
      name: "tickerLabel",
      title: "Ticker label",
      type: "string",
      group: "ticker",
      initialValue: "THE CLUBHOUSE — LIVE",
    }),
    defineField({
      name: "tickerItems",
      title: "Ticker items",
      type: "array",
      group: "ticker",
      of: [{ type: "string" }],
      description:
        'One line each, e.g. "JUL 02 — SUMMER ELITE WK 1 NEARLY FULL". Separators are added automatically.',
    }),
    defineField({
      name: "tickerCta",
      title: "Ticker button",
      type: "cta",
      group: "ticker",
    }),
    defineField({
      name: "footerHeadline",
      title: "Footer headline",
      type: "string",
      group: "footer",
      initialValue: "Join the movement",
    }),
    defineField({
      name: "footerMeta",
      title: "Footer meta line",
      type: "string",
      group: "footer",
      initialValue: "@AFE_FOOTBALL // ALLFOOTBALLEVERYTHING.COM",
    }),
    defineField({
      name: "footerCta",
      title: "Footer button",
      type: "cta",
      group: "footer",
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      group: "footer",
      of: [{ type: "cta" }],
      description: 'Design default: INSTAGRAM, TIKTOK, YOUTUBE.',
    }),
    defineField({
      name: "copyright",
      title: "Copyright line",
      type: "string",
      group: "footer",
      initialValue: "© 2026 ALL FOOTBALL EVERYTHING®",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

/* -------------------------------------------------------------------------- */

export const homePageType = defineType({
  name: "homePage",
  title: "Home",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "mission", title: "Mission" },
    { name: "clubhouse", title: "Clubhouse" },
    { name: "map", title: "World map" },
    { name: "sections", title: "Section headings" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    ...pageBase({ title: "hero", seo: "seo" }),
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
      group: "hero",
      description:
        'Use "|" to force line breaks and "*" around the volt-coloured part. Design default: "All|football|every*thing.*"',
      initialValue: "All|football|every*thing.*",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroIntro",
      title: "Hero intro",
      type: "text",
      group: "hero",
      rows: 3,
    }),
    defineField({
      name: "heroStats",
      title: "Hero stats",
      type: "array",
      group: "hero",
      of: [{ type: "stat" }],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "heroMedia",
      title: "Hero media",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      description: "Design default is the AFE shooting GIF.",
    }),
    defineField({ name: "heroCta", title: "Hero button", type: "cta", group: "hero" }),

    defineField({
      name: "missionKicker",
      title: "Mission kicker",
      type: "string",
      group: "mission",
      initialValue: "OUR DNA",
    }),
    defineField({
      name: "missionHeadline",
      title: "Mission headline",
      type: "text",
      group: "mission",
      rows: 3,
      description: 'Wrap the highlighted phrase in "*" to get the volt marker treatment.',
    }),
    defineField({
      name: "missionBody",
      title: "Mission body",
      type: "text",
      group: "mission",
      rows: 4,
    }),
    defineField({
      name: "missionValues",
      title: "Values",
      type: "array",
      group: "mission",
      of: [{ type: "string" }],
      description: "Design default: AUTHENTICITY, PASSION, FREEDOM, INTENSITY, DISRUPTION.",
    }),
    defineField({ name: "missionCta", title: "Mission link", type: "cta", group: "mission" }),

    defineField({
      name: "clubhouseKicker",
      title: "Clubhouse kicker",
      type: "string",
      group: "clubhouse",
      initialValue: "MEMBERS — POWERED BY WHOP",
    }),
    defineField({
      name: "clubhouseHeadline",
      title: "Clubhouse headline",
      type: "string",
      group: "clubhouse",
      description: 'Use "|" for line breaks and "*" for the volt part.',
      initialValue: "Inside the|*clubhouse.*",
    }),
    defineField({
      name: "clubhouseBody",
      title: "Clubhouse body",
      type: "text",
      group: "clubhouse",
      rows: 3,
    }),
    defineField({
      name: "clubhouseCtas",
      title: "Clubhouse buttons",
      type: "array",
      group: "clubhouse",
      of: [{ type: "cta" }],
      validation: (rule) => rule.max(2),
    }),

    defineField({
      name: "mapImage",
      title: "World map image",
      type: "image",
      group: "map",
      options: { hotspot: true },
    }),
    defineField({
      name: "mapHeadline",
      title: "Map headline",
      type: "string",
      group: "map",
      description: 'Use "*" for the volt part, e.g. "Trusted in *40+ countries.*"',
    }),
    defineField({
      name: "mapTopCountries",
      title: "Top countries line",
      type: "string",
      group: "map",
      initialValue: "TOP: UK · ITALY · FRANCE · SPAIN · GERMANY",
    }),
    defineField({
      name: "mapLegend",
      title: "Legend",
      type: "array",
      group: "map",
      of: [{ type: "stat" }],
      description:
        'Value = swatch colour ("volt" or "rust"), Label = legend text. Design default: volt/AFE CORE REGIONS, rust/AFE EXTENDED REGIONS.',
      validation: (rule) => rule.max(2),
    }),

    defineField({
      name: "eventsHeading",
      title: "Sessions section heading",
      type: "string",
      group: "sections",
      initialValue: "Upcoming sessions",
    }),
    defineField({
      name: "eventsCta",
      title: "Sessions section link",
      type: "cta",
      group: "sections",
    }),
    defineField({
      name: "partnersHeading",
      title: "Partners section heading",
      type: "string",
      group: "sections",
      initialValue: "The brands we play with",
    }),
    defineField({
      name: "partnersKicker",
      title: "Partners kicker",
      type: "string",
      group: "sections",
      initialValue: "OUR NETWORK",
    }),
  ],
  preview: { prepare: () => ({ title: "Home" }) },
});

/* -------------------------------------------------------------------------- */

export const trainingPageType = defineType({
  name: "trainingPage",
  title: "Training",
  type: "document",
  fields: [
    ...pageBase(),
    defineField({ name: "kicker", title: "Kicker", type: "string" }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: 'Use "|" for line breaks and "*" for the volt part.',
    }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
    defineField({
      name: "sessionTypes",
      title: "Session types",
      type: "array",
      of: [{ type: "numberedBlock" }],
      description: "The T.01 / T.02 / T.03 cards.",
    }),
    defineField({
      name: "calendarHeading",
      title: "Calendar heading",
      type: "string",
      initialValue: "Upcoming sessions",
    }),
    defineField({
      name: "bookingHeading",
      title: "Booking form heading",
      type: "string",
    }),
    defineField({ name: "bookingBody", title: "Booking form body", type: "text", rows: 3 }),
    defineField({
      name: "bookingInterests",
      title: "Interest options",
      type: "array",
      of: [{ type: "string" }],
      description: "Design default: TECHNIQUE, FINISHING, FITNESS, FULL PACKAGE.",
    }),
    defineField({
      name: "bookingConfirmation",
      title: "Confirmation message",
      type: "text",
      rows: 2,
      description: 'Shown after a successful submit. "{name}" is replaced with their first name.',
    }),
  ],
  preview: { prepare: () => ({ title: "Training" }) },
});

/* -------------------------------------------------------------------------- */

export const workPageType = defineType({
  name: "workPage",
  title: "Work With AFE",
  type: "document",
  fields: [
    ...pageBase(),
    defineField({ name: "kicker", title: "Kicker", type: "string" }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: 'Use "|" for line breaks and "*" for the volt part.',
    }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [{ type: "numberedBlock" }],
      description: "The S.01 / S.02 / S.03 service cards with their bullet lists.",
    }),
    defineField({ name: "contactHeading", title: "Contact heading", type: "string" }),
    defineField({ name: "contactBody", title: "Contact body", type: "text", rows: 3 }),
    defineField({ name: "contactEmail", title: "Contact email", type: "string" }),
  ],
  preview: { prepare: () => ({ title: "Work With AFE" }) },
});

/* -------------------------------------------------------------------------- */

export const exclusivePageType = defineType({
  name: "exclusivePage",
  title: "Exclusive",
  type: "document",
  fields: [
    ...pageBase(),
    defineField({ name: "kicker", title: "Kicker", type: "string" }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: 'Use "|" for line breaks and "*" for the volt part.',
    }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
    defineField({
      name: "categories",
      title: "Filter categories",
      type: "array",
      of: [{ type: "string" }],
      description: 'Order of the filter chips. "ALL" is prepended automatically.',
    }),
    defineField({
      name: "lockedCta",
      title: "Locked-item button",
      type: "cta",
      description: "Shown over gated items to a visitor without the required tier.",
    }),
  ],
  preview: { prepare: () => ({ title: "Exclusive" }) },
});

/* -------------------------------------------------------------------------- */

export const membersPageType = defineType({
  name: "membersPage",
  title: "Members",
  type: "document",
  groups: [
    { name: "intro", title: "Intro" },
    { name: "board", title: "The Board" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    ...pageBase({ title: "intro", seo: "seo" }),
    defineField({
      name: "kicker",
      title: "Kicker",
      type: "string",
      group: "intro",
      initialValue: "MEMBERS — POWERED BY WHOP",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      group: "intro",
      description: 'Use "|" for line breaks and "*" for the volt part.',
    }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3, group: "intro" }),
    defineField({
      name: "tiersHeading",
      title: "Tiers heading",
      type: "string",
      group: "intro",
    }),
    defineField({
      name: "boardHeading",
      title: "Board heading",
      type: "string",
      group: "board",
      initialValue: "The Board",
    }),
    defineField({
      name: "boardIntro",
      title: "Board intro",
      type: "text",
      rows: 2,
      group: "board",
    }),
    defineField({
      name: "boardLockedMessage",
      title: "Locked post message",
      type: "string",
      group: "board",
      initialValue: "🔒 MEMBERS ONLY",
    }),
    defineField({
      name: "boardLockedCta",
      title: "Locked post button",
      type: "cta",
      group: "board",
    }),
  ],
  preview: { prepare: () => ({ title: "Members" }) },
});

/* -------------------------------------------------------------------------- */

export const shopPageType = defineType({
  name: "shopPage",
  title: "Shop",
  type: "document",
  fields: [
    ...pageBase(),
    defineField({ name: "kicker", title: "Kicker", type: "string" }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: 'Use "|" for line breaks and "*" for the volt part.',
    }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
    defineField({
      name: "shippingNote",
      title: "Shipping note",
      type: "string",
      description: "Small print shown near the grid.",
    }),
    defineField({
      name: "memberPerkNote",
      title: "Member perk note",
      type: "string",
      description: 'e.g. "Members save 10% — discount applied at checkout."',
    }),
  ],
  preview: { prepare: () => ({ title: "Shop" }) },
});

/* -------------------------------------------------------------------------- */

export const aboutPageType = defineType({
  name: "aboutPage",
  title: "About",
  type: "document",
  fields: [
    ...pageBase(),
    defineField({ name: "kicker", title: "Kicker", type: "string" }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: 'Use "|" for line breaks and "*" for the volt part.',
    }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "values",
      title: "Values",
      type: "array",
      of: [{ type: "numberedBlock" }],
    }),
    defineField({
      name: "stats",
      title: "Reach stats",
      type: "array",
      of: [{ type: "stat" }],
    }),
    defineField({
      name: "topRegionsEurope",
      title: "Top regions — Europe",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "topRegionsWorld",
      title: "Top regions — Worldwide",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: { prepare: () => ({ title: "About" }) },
});

export const pageTypes = [
  siteSettingsType,
  homePageType,
  trainingPageType,
  workPageType,
  exclusivePageType,
  membersPageType,
  shopPageType,
  aboutPageType,
];

/**
 * Document types that must only ever have one instance.
 *
 * Explicitly `Set<string>`: it is queried with arbitrary schema-type names
 * from Sanity's document callbacks, which a Set inferred over the literal
 * union would reject.
 */
export const SINGLETON_TYPES: Set<string> = new Set(pageTypes.map((t) => t.name));
