import { preloadedFontPaths } from "@/config/fonts";

export function FontPreloads() {
  return preloadedFontPaths.map(href => (
    <link
      key={href}
      rel="preload"
      href={href}
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
  ));
}
