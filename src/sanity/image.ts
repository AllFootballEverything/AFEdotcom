import createImageUrlBuilder from "@sanity/image-url";
import type { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import type { Image } from "sanity";

import { dataset, isSanityConfigured, projectId } from "./env";

/**
 * Built lazily for the same reason as the clients — a module-scope builder
 * turns an unconfigured environment into a build failure. See `client.ts`.
 */
let builder: ImageUrlBuilder | null = null;

function getBuilder(): ImageUrlBuilder | null {
  if (!isSanityConfigured) return null;
  if (!builder) builder = createImageUrlBuilder({ projectId, dataset });
  return builder;
}

export function urlForImage(source: Image | undefined) {
  if (!source?.asset?._ref) return undefined;
  return getBuilder()?.image(source).auto("format").fit("max");
}

/** Convenience for the common "give me a width-capped src string" case. */
export function imageSrc(source: Image | undefined, width = 1200) {
  return urlForImage(source)?.width(width).url();
}
