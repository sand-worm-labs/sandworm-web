import { Azeret_Mono as AzeretMono } from "next/font/google";

export const baseFont = AzeretMono({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  weight: ["300", "400", "500"],
});

export const preloadedFontPaths = [
  "/fonts/moderat/Moderat-Regular.woff2",
  "/fonts/moderat/Moderat-Medium.woff2",
] as const;
