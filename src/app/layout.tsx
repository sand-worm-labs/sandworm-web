import "@/styles/globals.css";

import { Plus_Jakarta_Sans as PlusJakartaSans } from "next/font/google";

import MainFooter from "@/components/Footer";
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

const plusJakartaSans = PlusJakartaSans({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  weight: ["300", "400", "500", "600", "700"],
});

export default async function RootLayout({ children }: ChildrenProps) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.className} h-full flex flex-col justify-between`}
      >
        <Header />
        <section className="flex-1 bg-[#F8FAFC]">
          <QueryProvider>{children}</QueryProvider>
        </section>
        <MainFooter />
      </body>
    </html>
  );
}
