import { Fragment } from "react";

/**
 * Renders an editorial headline from the studio's mini-markup:
 *
 *   "|"  forces a line break
 *   "*"  wraps the volt-coloured run, e.g. "every*thing.*"
 *
 * The design breaks its big headlines at deliberate points and colours part of
 * the last word, which no amount of CSS wrapping reproduces — hence the markup
 * rather than a plain string.
 */

type Props = {
  text: string;
  className?: string;
  /** Renders as this element. Defaults to a div so callers pick their own heading level. */
  as?: "h1" | "h2" | "h3" | "div" | "p";
  /** Colour applied to the starred run. */
  accent?: "volt" | "rust";
};

function renderLine(line: string, accentClass: string) {
  // Odd indices are the runs that were wrapped in "*".
  return line.split("*").map((chunk, index) =>
    index % 2 === 1 ? (
      <span key={index} className={accentClass}>
        {chunk}
      </span>
    ) : (
      <Fragment key={index}>{chunk}</Fragment>
    ),
  );
}

export function Headline({
  text,
  className = "",
  as: Tag = "div",
  accent = "volt",
}: Props) {
  const accentClass = accent === "volt" ? "text-volt" : "text-rust";
  const lines = text.split("|");

  return (
    <Tag className={className}>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {renderLine(line, accentClass)}
        </Fragment>
      ))}
    </Tag>
  );
}

/**
 * Variant used inside the light mission band, where the highlighted run gets a
 * volt block behind it instead of coloured type.
 */
export function MarkerHeadline({ text, className = "", as: Tag = "p" }: Omit<Props, "accent">) {
  return (
    <Tag className={className}>
      {text.split("|").map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {line.split("*").map((chunk, index) =>
            index % 2 === 1 ? (
              <span key={index} className="bg-volt px-2">
                {chunk}
              </span>
            ) : (
              <Fragment key={index}>{chunk}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </Tag>
  );
}
