import "@/styles/globals.css";

import { DM_Mono as DMMono } from "next/font/google";

import { QueryProvider } from "@/providers/query";
import type { ChildrenProps } from "@/types";
import Header from "@/components/Header";

export const metadata = {
  description:
    "A highly opinionated and complete starter for Next.js projects ready to production. Includes Typescript, Styled Components, Prettier, ESLint, Husky, SEO, and more.",
  keywords:
    "next, starter, typescript, tailwind css, prettier, eslint, husky, seo",
  title: "Sand Word",
};

const dmMono = DMMono({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  weight: ["300", "400", "500"],
});

export default async function RootLayout({ children }: ChildrenProps) {
  return (
    <html lang="en">
      <body
        className={`${dmMono.className} h-full flex flex-col justify-between`}
      >
        <section className="flex-1 bg-background">
          <QueryProvider>{children}</QueryProvider>
        </section>
      </body>
    </html>
  );
}
