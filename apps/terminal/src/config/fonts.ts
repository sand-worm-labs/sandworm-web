import localFont from "next/font/local";

// Azeret Mono (OFL), latin, weights 300 to 500 in one variable file. Self-
// hosted because Turbopack can't load the URLs Google Fonts now serves it from.
export const baseFont = localFont({
  src: "../../public/fonts/azeret-mono/AzeretMono-Latin-Variable.woff2",
  weight: "300 500",
  display: "swap",
  adjustFontFallback: false,
});

export const preloadedFontPaths = [
  "/fonts/moderat/Moderat-Regular.woff2",
  "/fonts/moderat/Moderat-Medium.woff2",
] as const;
