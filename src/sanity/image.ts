import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlForImage(source: Image | undefined) {
  if (!source?.asset?._ref) return undefined;
  return builder.image(source).auto("format").fit("max");
}

/** Convenience for the common "give me a width-capped src string" case. */
export function imageSrc(source: Image | undefined, width = 1200) {
  return urlForImage(source)?.width(width).url();
}
