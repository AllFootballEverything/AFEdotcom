/**
 * AFE reach, as ISO 3166-1 *numeric* country codes.
 *
 * Lifted verbatim from the "AFE Interactive Map" prototype. These stay in code
 * rather than Sanity deliberately: editing a world map by typing three-digit
 * numeric codes into a CMS field is a worse experience than a pull request,
 * and a typo silently drops a country off the map with no error.
 *
 * Codes are zero-padded strings because that is how world-atlas identifies
 * features ("076", not 76).
 */

export const CORE_REGIONS = new Set([
  "840", // United States
  "752", // Sweden
  "578", // Norway
  "246", // Finland
]);

export const EXTENDED_REGIONS = new Set([
  "124", // Canada
  "304", // Greenland
  "352", // Iceland
  "076", // Brazil
  "826", // United Kingdom
  "372", // Ireland
  "250", // France
  "724", // Spain
  "620", // Portugal
  "056", // Belgium
  "528", // Netherlands
  "276", // Germany
  "756", // Switzerland
  "040", // Austria
  "380", // Italy
  "203", // Czechia
  "616", // Poland
  "703", // Slovakia
  "348", // Hungary
  "191", // Croatia
  "705", // Slovenia
  "642", // Romania
  "100", // Bulgaria
  "300", // Greece
  "688", // Serbia
  "070", // Bosnia and Herzegovina
  "008", // Albania
  "807", // North Macedonia
  "499", // Montenegro
  "804", // Ukraine
  "112", // Belarus
  "440", // Lithuania
  "428", // Latvia
  "233", // Estonia
  "498", // Moldova
  "792", // Türkiye
  "208", // Denmark
  "442", // Luxembourg
]);

export type Region = "core" | "extended";

export function regionFor(id: string): Region | null {
  if (CORE_REGIONS.has(id)) return "core";
  if (EXTENDED_REGIONS.has(id)) return "extended";
  return null;
}
