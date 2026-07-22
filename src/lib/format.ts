/**
 * Formatting helpers.
 *
 * Everything is pinned to UTC. Dates are rendered on the server and hydrated
 * on the client, so using the local timezone would produce a mismatch and a
 * hydration warning for anyone west of Greenwich.
 */

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
] as const;

/** "2026-07-18T10:00:00Z" -> "JUL 18" */
export function formatEventDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTHS[date.getUTCMonth()]} ${String(date.getUTCDate()).padStart(2, "0")}`;
}

/** "2026-07-18T10:00:00Z" -> "JUL 18, 2026" */
export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatEventDate(iso)}, ${date.getUTCFullYear()}`;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  eur: "€",
  gbp: "£",
  usd: "$",
};

/** (3900, "eur") -> "€39" — whole amounts drop the decimals, as in the design. */
export function formatPrice(cents: number, currency = "eur"): string {
  const symbol = CURRENCY_SYMBOLS[currency.toLowerCase()] ?? "";
  const amount = cents / 100;
  const formatted =
    Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${symbol}${formatted}`;
}

/** Applies a whole-percent discount, rounding to the nearest cent. */
export function applyDiscount(cents: number, percent: number): number {
  if (!percent) return cents;
  const clamped = Math.min(Math.max(percent, 0), 100);
  return Math.round(cents * (1 - clamped / 100));
}
