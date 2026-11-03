import "@/styles/globals.scss";

import { Azeret_Mono as AzeretMono } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_DESCRIPTION =
  "The Sandworm terminal: a fast, keyboard-first view of onchain data, built on Sandworm.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_TERMINAL_URL || "https://terminal.sandwormlab.xyz"
  ),
  title: "Sandworm Terminal",
  description: SITE_DESCRIPTION,
  icons: { icon: "/logo.svg" },
  openGraph: {
    siteName: "Sandworm",
    title: "Sandworm Terminal",
    description: SITE_DESCRIPTION,
    type: "website",
  },
};

const azeretMono = AzeretMono({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  weight: ["300", "400", "500"],
});

// The body text is Moderat, declared in globals.scss. Preloading starts the download with the
// HTML instead of after the CSS is parsed, so the text does not flash in a fallback font.
const PRELOADED_FONTS = [
  "/fonts/moderat/Moderat-Regular.woff2",
  "/fonts/moderat/Moderat-Medium.woff2",
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {PRELOADED_FONTS.map(href => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body className={`${azeretMono.className} h-full w-screen`}>
        {children}
      </body>
    </html>
  );
}
