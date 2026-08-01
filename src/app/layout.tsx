import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Official AFE Brand ID 2025 typefaces.
 *
 * SCHABO Condensed — all headlines/display, single weight, always uppercase.
 * PP Neue Montreal — everything else (body, UI labels, and the old mono role).
 * Both are self-hosted .otf files under src/fonts. Bolder Neue Montreal weights
 * (the 700/900 button styles) synthesize from Book until the client supplies
 * more — accepted in the handoff.
 */
const schabo = localFont({
  src: "../fonts/SCHABO-Condensed.otf",
  weight: "400",
  display: "swap",
  variable: "--font-schabo",
});

const neueMontreal = localFont({
  src: [
    { path: "../fonts/PPNeueMontreal-Book.otf", weight: "400", style: "normal" },
    {
      path: "../fonts/PPNeueMontreal-SemiBolditalic.otf",
      weight: "600",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-neue-montreal",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://allfootballeverything.com",
  ),
  title: {
    default: "All Football Everything",
    template: "%s — All Football Everything",
  },
  description:
    "Expert training, mentorship and community — a platform that supports your journey in the sport and beyond. Designed for those who live football, not just play it.",
  openGraph: {
    type: "website",
    siteName: "All Football Everything",
    locale: "en_GB",
  },
  icons: {
    icon: "/assets/afe-logo-orange.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${schabo.variable} ${neueMontreal.variable}`}>
      <body>{children}</body>
    </html>
  );
}
