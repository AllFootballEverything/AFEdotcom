# Brand assets

Drop the files from the Claude Design project (`assets/` folder) in here, with
these exact filenames — the code references them by path:

| File                    | Used by                                        |
| ----------------------- | ---------------------------------------------- |
| `afe-logo-white.png`    | Nav logo                                       |
| `afe-logo-orange.png`   | Board post avatars, favicon                    |
| `afe-logo-gray.png`     | Spare — not currently referenced               |
| `afe-shooting.gif`      | Homepage hero (fallback when no Sanity `heroMedia`) |
| `afe-world-map-v2.png`  | Homepage world map (fallback when no Sanity `mapImage`) |
| `tier-scout.png`        | Members page — Scout card (fallback)           |
| `tier-access.png`       | Members page — Access card (fallback)          |
| `tier-elite.png`        | Members page — Elite card (fallback)           |

Anything uploaded through Sanity Studio takes precedence over these — they are
the defaults used before the dataset is populated.

The hero GIF is rendered with `unoptimized` so it keeps animating; the Next
image pipeline would otherwise flatten it to a single frame.
