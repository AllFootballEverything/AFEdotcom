import type { StructureResolver } from "sanity/structure";

/**
 * Desk structure.
 *
 * Top level mirrors the site: an editor picks the page they want to change.
 * Content that appears on several pages (sessions, board posts, products…)
 * sits under "Library", and machine-written records sit under "Records".
 */

type Singleton = { id: string; title: string; icon?: string };

const singleton = (S: Parameters<StructureResolver>[0], { id, title }: Singleton) =>
  S.listItem()
    .title(title)
    .id(id)
    .child(S.document().schemaType(id).documentId(id).title(title));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("AFE")
    .items([
      singleton(S, { id: "homePage", title: "Home" }),
      singleton(S, { id: "trainingPage", title: "Training" }),
      singleton(S, { id: "workPage", title: "Work With AFE" }),
      singleton(S, { id: "exclusivePage", title: "Exclusive" }),
      singleton(S, { id: "membersPage", title: "Members" }),
      singleton(S, { id: "shopPage", title: "Shop" }),
      singleton(S, { id: "aboutPage", title: "About" }),

      S.divider(),

      S.listItem()
        .title("Library")
        .child(
          S.list()
            .title("Library")
            .items([
              S.documentTypeListItem("session").title("Sessions & events"),
              S.documentTypeListItem("boardPost").title("Board posts"),
              S.documentTypeListItem("exclusiveItem").title("Exclusive items"),
              S.documentTypeListItem("product").title("Products"),
              S.documentTypeListItem("tier").title("Membership tiers"),
              S.documentTypeListItem("testimonial").title("Testimonials"),
              S.documentTypeListItem("partner").title("Partner brands"),
            ]),
        ),

      S.divider(),

      S.listItem()
        .title("Records")
        .child(
          S.list()
            .title("Records")
            .items([
              S.documentTypeListItem("bookingEnquiry").title("Booking enquiries"),
              S.documentTypeListItem("member").title("Members (Whop sync)"),
            ]),
        ),

      S.divider(),

      singleton(S, { id: "siteSettings", title: "Site settings" }),
    ]);
