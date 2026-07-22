import { defineField, defineType } from "sanity";

/** A single figure in the homepage hero stat bar (e.g. "1.5M+ / FANS"). */
export const statType = defineType({
  name: "stat",
  title: "Stat",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      description: 'The big volt number, e.g. "1.5M+"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'The small caption beneath, e.g. "FANS"',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "value", subtitle: "label" },
  },
});

/** A button. `href` may be an internal path or an absolute URL. */
export const ctaType = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: 'Internal path like "/training", or a full https:// URL.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});

/** A numbered editorial block — the "T.01 / S.02" cards on Training and Work. */
export const numberedBlockType = defineType({
  name: "numberedBlock",
  title: "Numbered block",
  type: "object",
  fields: [
    defineField({
      name: "number",
      title: "Number",
      type: "string",
      description: 'The index label, e.g. "T.01" or "S.02"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "items",
      title: "Bullet items",
      type: "array",
      of: [{ type: "string" }],
      description: "Used by the Work With AFE service cards.",
    }),
    defineField({
      name: "meta",
      title: "Meta line",
      type: "string",
      description: 'Trailing detail, e.g. "FROM €120 / SESSION"',
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "number" },
  },
});

export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Meta title",
      type: "string",
      description: "Falls back to the page title if empty.",
      validation: (rule) => rule.max(60).warning("Keep under 60 characters."),
    }),
    defineField({
      name: "description",
      title: "Meta description",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(160).warning("Keep under 160 characters."),
    }),
    defineField({
      name: "image",
      title: "Social share image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});

export const objectTypes = [
  statType,
  ctaType,
  numberedBlockType,
  seoType,
];
