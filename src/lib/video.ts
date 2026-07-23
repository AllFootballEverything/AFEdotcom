/**
 * Turn a pasted video URL into an embeddable player URL.
 *
 * Returns null when the URL is not a single embeddable video — a channel,
 * playlist, or the bare youtube.com homepage, or an unknown host. The caller
 * MUST treat null as "don't put this in an iframe" and link out instead:
 * framing a non-embed YouTube URL is refused by the browser
 * (X-Frame-Options: sameorigin), which is the whole bug this guards against.
 *
 * YouTube is normalised to the privacy-friendly youtube-nocookie host. Vimeo is
 * handled too.
 */
export function toEmbedUrl(url: string | undefined): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const segments = parsed.pathname.split("/").filter(Boolean);

  // --- YouTube -------------------------------------------------------------
  const youtubeEmbed = (id: string | null | undefined) =>
    id ? `https://www.youtube-nocookie.com/embed/${id}` : null;

  if (host === "youtu.be") {
    return youtubeEmbed(segments[0]);
  }
  if (host.endsWith("youtube.com")) {
    if (parsed.pathname === "/watch") return youtubeEmbed(parsed.searchParams.get("v"));
    // /embed/ID, /shorts/ID, /live/ID all carry the id as the second segment.
    if (["embed", "shorts", "live"].includes(segments[0] ?? "")) {
      return youtubeEmbed(segments[1]);
    }
    // Anything else (homepage, /channel, /playlist, /@handle) is not a single
    // embeddable video.
    return null;
  }

  // --- Vimeo ---------------------------------------------------------------
  if (host === "player.vimeo.com") return url; // already an embed URL
  if (host === "vimeo.com") {
    const id = segments.find((s) => /^\d+$/.test(s));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  // Unknown host — refuse to frame it.
  return null;
}
