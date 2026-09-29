import type { Metadata, Viewport } from "next";
import { Public_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/shell/app-shell";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "NWIS — Nearby Wells Intelligence System",
    template: "%s · NWIS",
  },
  description:
    "AI-powered offset-well knowledge and decision support platform for drilling operations (SIH 2026 · PS 26121 · demo with synthetic data).",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f9" },
    { media: "(prefers-color-scheme: dark)", color: "#141a21" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${publicSans.variable} ${devanagari.variable} h-full antialiased`}
    >
      <body className="h-full">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
