/**
 * Turn a pasted video URL into something that works in an <iframe>.
 *
 * Editors paste whatever YouTube hands them — a watch link, a youtu.be share
 * link, a shorts link — none of which load inside an iframe. This normalises
 * them to the /embed/ form. Vimeo is handled too; anything unrecognised is
 * returned unchanged so a direct embed URL still works.
 */
export function toEmbedUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  // YouTube
  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (host.endsWith("youtube.com")) {
    if (parsed.pathname.startsWith("/embed/")) return url;
    if (parsed.pathname === "/watch") {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.pathname.startsWith("/shorts/")) {
      const id = parsed.pathname.split("/")[2];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
  }

  // Vimeo
  if (host === "vimeo.com") {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    return id ? `https://player.vimeo.com/video/${id}` : url;
  }

  return url;
}
