import { defineField, defineType } from "sanity";

import { TIERS } from "@/lib/tiers";

const tierOptions = TIERS.map((tier) => ({
  title: tier.charAt(0).toUpperCase() + tier.slice(1),
  value: tier,
}));

const visibilityField = defineField({
  name: "visibility",
  title: "Visibility",
  type: "string",
  description:
    "Minimum membership required. Higher tiers always inherit access from lower ones.",
  initialValue: "public",
  options: {
    list: [{ title: "Public", value: "public" }, ...tierOptions],
    layout: "radio",
  },
  validation: (rule) => rule.required(),
});

/* -------------------------------------------------------------------------- */
/* Training sessions & events                                                  */
/* -------------------------------------------------------------------------- */

export const sessionType = defineType({
  name: "session",
  title: "Session / Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "startsAt",
      title: "Starts at",
      type: "datetime",
      description: "Drives ordering and the JUL 18 style date chip.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endsAt",
      title: "Ends at",
      type: "datetime",
      description: "Optional — set for multi-day camps.",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: 'Shown in mono caps, e.g. "COPENHAGEN, DK" or "BY REQUEST".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "status",
      title: "Booking status",
      type: "string",
      initialValue: "open",
      options: {
        list: [
          { title: "Open — reserve", value: "open" },
          { title: "Limited spots", value: "limited" },
          { title: "Full — waitlist", value: "full" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "spotsLeft",
      title: "Spots left",
      type: "number",
      description: 'Only used when status is "Limited spots".',
      hidden: ({ parent }) => parent?.status !== "limited",
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "bookingUrl",
      title: "External booking URL",
      type: "url",
      description:
        "Optional. If set, the reserve button links here instead of the on-site enquiry form.",
    }),
    defineField({
      name: "priorityTier",
      title: "Priority booking tier",
      type: "string",
      description:
        "Members at or above this tier get a priority window before public release.",
      options: { list: tierOptions, layout: "radio" },
    }),
    defineField({
      name: "featured",
      title: "Feature on homepage",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Soonest first",
      name: "startsAtAsc",
      by: [{ field: "startsAt", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "location", date: "startsAt" },
    prepare: ({ title, subtitle, date }) => ({
      title,
      subtitle: [date ? new Date(date).toDateString() : null, subtitle]
        .filter(Boolean)
        .join(" — "),
    }),
  },
});

/* -------------------------------------------------------------------------- */
/* The Board — members feed                                                    */
/* -------------------------------------------------------------------------- */

export const boardPostType = defineType({
  name: "boardPost",
  title: "Board post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      description: "Not shown on the site — used to find the post in the studio.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    visibilityField,
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block", styles: [{ title: "Normal", value: "normal" }] }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "teaserParagraphs",
      title: "Free paragraphs",
      type: "number",
      description:
        "How many opening paragraphs non-members can read before the blur and the MEMBERS ONLY lock. 0 hides the whole post.",
      initialValue: 1,
      validation: (rule) => rule.required().min(0).integer(),
    }),
    defineField({
      name: "featured",
      title: "Feature on homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "likes", title: "Likes", type: "number", initialValue: 0 }),
    defineField({
      name: "commentCount",
      title: "Comments",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "views",
      title: "Views",
      type: "string",
      description: 'Display string, e.g. "1.2K".',
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", visibility: "visibility", date: "publishedAt" },
    prepare: ({ title, visibility, date }) => ({
      title,
      subtitle: `${String(visibility ?? "public").toUpperCase()} — ${
        date ? new Date(date).toDateString() : "no date"
      }`,
    }),
  },
});

/* -------------------------------------------------------------------------- */
/* Exclusive library                                                           */
/* -------------------------------------------------------------------------- */

export const exclusiveItemType = defineType({
  name: "exclusiveItem",
  title: "Exclusive item",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "media",
      title: "Media type",
      type: "string",
      initialValue: "video",
      options: {
        list: [
          { title: "Video", value: "video" },
          { title: "Article", value: "article" },
          { title: "Series", value: "series" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category tag",
      type: "string",
      description: 'The volt chip, e.g. "DRILLS", "MATCH IQ", "FINISHING".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "meta",
      title: "Meta line",
      type: "string",
      description: 'e.g. "12 MIN — MEMBERS" or "EP. 01–04"',
    }),
    visibilityField,
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      hidden: ({ parent }) => parent?.media === "article",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "thumbnail" },
  },
});

/* -------------------------------------------------------------------------- */
/* Shop products                                                               */
/* -------------------------------------------------------------------------- */

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "priceCents",
      title: "Price (in cents)",
      type: "number",
      description: "3900 = €39.00. Stored in minor units to avoid rounding bugs.",
      validation: (rule) => rule.required().min(0).integer(),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "eur",
      options: {
        list: [
          { title: "EUR", value: "eur" },
          { title: "GBP", value: "gbp" },
          { title: "USD", value: "usd" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "string",
      description: 'Optional corner flag, e.g. "NEW" or "RESTOCK".',
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "sizes",
      title: "Sizes",
      type: "array",
      of: [{ type: "string" }],
      description: "Leave empty for one-size items.",
    }),
    defineField({
      name: "inStock",
      title: "In stock",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "memberDiscountPercent",
      title: "Member discount (%)",
      type: "number",
      description: "Applied at checkout for signed-in members. 0 for none.",
      initialValue: 0,
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Manual order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", price: "priceCents", media: "images.0" },
    prepare: ({ title, price, media }) => ({
      title,
      subtitle: typeof price === "number" ? `${(price / 100).toFixed(2)}` : "",
      media,
    }),
  },
});

/* -------------------------------------------------------------------------- */
/* Membership tiers                                                            */
/* -------------------------------------------------------------------------- */

export const tierType = defineType({
  name: "tier",
  title: "Membership tier",
  type: "document",
  fields: [
    defineField({
      name: "key",
      title: "Tier key",
      type: "string",
      description:
        "Must match the tier used in gating and in WHOP_TIER_MAP. Do not change once live.",
      options: { list: tierOptions, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Display name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price label",
      type: "string",
      description: 'Shown verbatim, e.g. "$29.00". Whop is the source of truth for actual billing.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cadence",
      title: "Cadence label",
      type: "string",
      initialValue: "/ MONTH",
    }),
    defineField({ name: "badge", title: "Badge", type: "string", description: 'e.g. "NEW"' }),
    defineField({
      name: "image",
      title: "Tier image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "perks",
      title: "Perks",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "whopCheckoutUrl",
      title: "Whop checkout URL",
      type: "url",
      description: "Where the JOIN button sends a visitor who is not yet a member.",
    }),
    defineField({
      name: "highlighted",
      title: "Highlight this tier",
      type: "boolean",
      description: "Draws the volt border treatment on the card.",
      initialValue: false,
    }),
    defineField({ name: "order", title: "Sort order", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Manual order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "price", media: "image" },
  },
});

/* -------------------------------------------------------------------------- */
/* Marketing content                                                           */
/* -------------------------------------------------------------------------- */

export const testimonialType = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "attribution",
      title: "Attribution",
      type: "string",
      description: 'Shown in rust caps, e.g. "ALEXANDER — PRO PLAYER"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Feature on homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "order", title: "Sort order", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Manual order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "attribution", subtitle: "quote" },
  },
});

export const partnerType = defineType({
  name: "partner",
  title: "Partner brand",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Transparent PNG or SVG. Rendered on a white card, contained.",
      options: { hotspot: false },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "url", title: "Website", type: "url" }),
    defineField({ name: "order", title: "Sort order", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Manual order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "name", media: "logo" } },
});

/* -------------------------------------------------------------------------- */
/* Operational records — written by the site, not by editors                   */
/* -------------------------------------------------------------------------- */

export const bookingEnquiryType = defineType({
  name: "bookingEnquiry",
  title: "Booking enquiry",
  type: "document",
  description: "Submitted through the Training page form. Read-only in practice.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "interest", title: "Interest", type: "string" }),
    defineField({ name: "message", title: "Message", type: "text", rows: 4 }),
    defineField({
      name: "session",
      title: "Session",
      type: "reference",
      to: [{ type: "session" }],
      description: "Set when the enquiry came from a specific session card.",
    }),
    defineField({ name: "submittedAt", title: "Submitted at", type: "datetime" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "new",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Contacted", value: "contacted" },
          { title: "Booked", value: "booked" },
          { title: "Closed", value: "closed" },
        ],
        layout: "radio",
      },
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "email", status: "status" },
    prepare: ({ title, subtitle, status }) => ({
      title: title ?? "Unnamed enquiry",
      subtitle: `${String(status ?? "new").toUpperCase()} — ${subtitle ?? ""}`,
    }),
  },
});

export const memberType = defineType({
  name: "member",
  title: "Member",
  type: "document",
  description:
    "Mirror of Whop membership state, written by the Whop webhook. Whop remains the source of truth — edits here do not change billing.",
  fields: [
    defineField({
      name: "whopUserId",
      title: "Whop user ID",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "email", title: "Email", type: "string", readOnly: true }),
    defineField({ name: "username", title: "Username", type: "string", readOnly: true }),
    defineField({
      name: "tier",
      title: "Tier",
      type: "string",
      readOnly: true,
      options: { list: tierOptions },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      readOnly: true,
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Trialing", value: "trialing" },
          { title: "Past due", value: "past_due" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Expired", value: "expired" },
        ],
      },
    }),
    defineField({
      name: "whopMembershipId",
      title: "Whop membership ID",
      type: "string",
      readOnly: true,
    }),
    defineField({ name: "joinedAt", title: "Joined at", type: "datetime", readOnly: true }),
    defineField({
      name: "renewsAt",
      title: "Renews / expires at",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "lastSyncedAt",
      title: "Last synced at",
      type: "datetime",
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "username", email: "email", tier: "tier", status: "status" },
    prepare: ({ title, email, tier, status }) => ({
      title: title || email || "Unknown member",
      subtitle: `${String(tier ?? "—").toUpperCase()} / ${status ?? "unknown"}`,
    }),
  },
});

export const collectionTypes = [
  sessionType,
  boardPostType,
  exclusiveItemType,
  productType,
  tierType,
  testimonialType,
  partnerType,
  bookingEnquiryType,
  memberType,
];
