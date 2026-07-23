import type { PortableTextBlock } from "@portabletext/react";
import type { Image } from "sanity";

import type { Tier, Visibility } from "@/lib/tiers";

export type Stat = { value: string; label: string };
export type Cta = { label: string; href: string };
export type NumberedBlock = {
  number: string;
  title: string;
  description?: string;
  items?: string[];
  meta?: string;
};
export type Seo = { title?: string; description?: string; image?: Image };

export type SiteSettings = {
  navCta?: Cta;
  /** Header button visibility. Undefined means "shown" — omission never hides. */
  showBookNowButton?: boolean;
  showLoginButton?: boolean;
  showCartButton?: boolean;
  tickerEnabled?: boolean;
  tickerLabel?: string;
  tickerItems?: string[];
  tickerCta?: Cta;
  footerHeadline?: string;
  footerMeta?: string;
  footerCta?: Cta;
  socialLinks?: Cta[];
  copyright?: string;
};

export type SessionEvent = {
  _id: string;
  title: string;
  slug: string;
  startsAt: string;
  endsAt?: string;
  location: string;
  description?: string;
  status: "open" | "limited" | "full";
  spotsLeft?: number;
  bookingUrl?: string;
  priorityTier?: Tier;
  featured?: boolean;
};

export type BoardPost = {
  _id: string;
  title: string;
  publishedAt: string;
  visibility: Visibility;
  body: PortableTextBlock[];
  teaserParagraphs: number;
  featured?: boolean;
  likes?: number;
  commentCount?: number;
  views?: string;
};

export type ExclusiveItem = {
  _id: string;
  title: string;
  slug: string;
  media: "video" | "article" | "series";
  category: string;
  meta?: string;
  visibility: Visibility;
  thumbnail?: Image;
  videoUrl?: string;
  externalUrl?: string;
  publishedAt?: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  badge?: string;
  images?: Image[];
  sizes?: string[];
  inStock: boolean;
  memberDiscountPercent?: number;
};

export type MembershipTier = {
  _id: string;
  key: Tier;
  name: string;
  price: string;
  cadence?: string;
  badge?: string;
  image?: Image;
  perks: string[];
  whopCheckoutUrl?: string;
  highlighted?: boolean;
};

export type Testimonial = {
  _id: string;
  quote: string;
  attribution: string;
  featured?: boolean;
};

export type Partner = { _id: string; name: string; logo: Image; url?: string };

export type HomePage = {
  title?: string;
  seo?: Seo;
  heroHeadline: string;
  heroIntro?: string;
  heroStats?: Stat[];
  heroMedia?: Image;
  heroCta?: Cta;
  missionKicker?: string;
  missionHeadline?: string;
  missionBody?: string;
  missionValues?: string[];
  missionCta?: Cta;
  clubhouseKicker?: string;
  clubhouseHeadline?: string;
  clubhouseBody?: string;
  clubhouseCtas?: Cta[];
  mapHeadline?: string;
  mapTopCountries?: string;
  mapLegend?: Stat[];
  eventsHeading?: string;
  eventsCta?: Cta;
  partnersHeading?: string;
  partnersKicker?: string;
};

export type TrainingPage = {
  title?: string;
  seo?: Seo;
  kicker?: string;
  headline?: string;
  intro?: string;
  sessionTypes?: NumberedBlock[];
  calendarHeading?: string;
  bookingHeading?: string;
  bookingBody?: string;
  bookingInterests?: string[];
  bookingConfirmation?: string;
};

export type WorkPage = {
  title?: string;
  seo?: Seo;
  kicker?: string;
  headline?: string;
  intro?: string;
  services?: NumberedBlock[];
  contactHeading?: string;
  contactBody?: string;
  contactEmail?: string;
};

export type ExclusivePage = {
  title?: string;
  seo?: Seo;
  kicker?: string;
  headline?: string;
  intro?: string;
  categories?: string[];
  lockedCta?: Cta;
};

export type MembersPage = {
  title?: string;
  seo?: Seo;
  kicker?: string;
  headline?: string;
  intro?: string;
  tiersHeading?: string;
  boardHeading?: string;
  boardIntro?: string;
  boardLockedMessage?: string;
  boardLockedCta?: Cta;
};

export type ShopPage = {
  title?: string;
  seo?: Seo;
  kicker?: string;
  headline?: string;
  intro?: string;
  shippingNote?: string;
  memberPerkNote?: string;
};

export type AboutPage = {
  title?: string;
  seo?: Seo;
  kicker?: string;
  headline?: string;
  intro?: string;
  body?: PortableTextBlock[];
  values?: NumberedBlock[];
  stats?: Stat[];
  topRegionsEurope?: string[];
  topRegionsWorld?: string[];
};
