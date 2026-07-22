# Brand assets

Everything in `public/` is served publicly and ships in every deploy, so this
folder holds only the web-ready files the code references by path. The raw
masters live in [`brand-source/logos/`](../../brand-source/logos), outside the
public tree.

## Present

| File                  | Derived from                      | Used by                     |
| --------------------- | --------------------------------- | --------------------------- |
| `afe-logo-white.png`  | `IMG_0090.PNG` — white wordmark   | Nav logo (on ink)           |
| `afe-logo-gray.png`   | `IMG_0088.PNG` — dark wordmark    | Light/bone backgrounds      |
| `afe-logo-orange.png` | `IMG_0099.PNG` — rust monogram    | Board avatars, favicon      |

Derivation: trimmed of transparent margin, capped at 1200px wide (wordmarks) or
centred on a 512×512 transparent canvas (monogram — the site renders it in a
square box at 26–36px, and the 1.6:1 source would otherwise be squashed).

## Still needed

These are referenced in code but not yet supplied. Each has a graceful
fallback, so the site builds and renders without them — the hero and map show
empty frames, and tier cards fall back to whatever is uploaded in Sanity.

| File                   | Used by                                              |
| ---------------------- | ---------------------------------------------------- |
| `afe-shooting.gif`     | Homepage hero (when Sanity `heroMedia` is unset)     |
| `afe-world-map-v2.png` | Homepage world map (when Sanity `mapImage` is unset) |
| `tier-scout.png`       | Members page — Scout card fallback                   |
| `tier-access.png`      | Members page — Access card fallback                  |
| `tier-elite.png`       | Members page — Elite card fallback                   |

They are in the Claude Design project under `assets/`. Anything uploaded
through Sanity Studio takes precedence over these files — they are only the
defaults used before the dataset is populated.

The hero GIF is rendered with `unoptimized` so it keeps animating; the Next
image pipeline would otherwise flatten it to a single frame.
