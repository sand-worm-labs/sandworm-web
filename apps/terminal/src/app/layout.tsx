import "@/styles/globals.scss";

import type { Metadata } from "next";

import { FontPreloads } from "@/components/FontPreloads";
import { env } from "@/config/env";
import { baseFont } from "@/config/fonts";
import { site } from "@/config/site";
import { ThemeProvider } from "@/providers/ThemeProvider";
import type { ChildrenProps } from "@/types";

export const metadata: Metadata = {
  metadataBase: new URL(env.terminalUrl),
  title: site.title,
  description: site.description,
  icons: { icon: site.logoPath },
  openGraph: {
    siteName: site.name,
    title: site.title,
    description: site.description,
    type: "website",
  },
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
      </body>
    </html>
  );
}
