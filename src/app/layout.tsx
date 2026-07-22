import type { Metadata } from "next";
import { Archivo, Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
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
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
