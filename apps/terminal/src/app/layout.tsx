import "@/styles/globals.scss";

import type { Metadata, Viewport } from "next";

import { FontPreloads } from "@/components/FontPreloads";
import { ServiceWorker } from "@/components/ServiceWorker";
import { env } from "@/config/env";
import { baseFont } from "@/config/fonts";
import { site } from "@/config/site";
import { TITLE_TEMPLATE } from "@/lib/metadata";
import { ThemeProvider } from "@/providers/ThemeProvider";
import type { ChildrenProps } from "@/types";

export const metadata: Metadata = {
  metadataBase: new URL(env.terminalUrl),
  title: { default: site.title, template: TITLE_TEMPLATE },
  description: site.description,
  icons: { icon: site.logoPath, apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Terminal", statusBarStyle: "default" },
  openGraph: {
    siteName: site.name,
    title: site.title,
    description: site.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default function RootLayout({ children }: ChildrenProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <FontPreloads />
      </head>
      <body className={`${baseFont.className} h-full w-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
