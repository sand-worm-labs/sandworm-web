import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "@/styles/globals.scss";

import { Azeret_Mono as AzeretMono } from "next/font/google";
import Script from "next/script";
import type { Metadata } from "next";

import type { ChildrenProps } from "@/types";
import { RootProvider } from "@/providers/RootProvider";

// ⬢ Constants
// =====================================
export const metadata: Metadata = {
  description:
    "Explore, query, and visualize blockchain data on Base, EVM, and other chains with Sandworm, your open-source, SQL-powered data IDE for Web3",
  keywords: "data, web3, blockchain, analytics, sui, base, etherium, indexer",
  title: "Sand Worm",
  icons: {
    icon: "/logo.svg",
  },
};

const azeretMono = AzeretMono({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  weight: ["300", "400", "500"],
});

const GTAG_ID = "G-GQB5QS1LHQ";

console.log(azeretMono.style.fontFamily);

// ⬢ Root Layout
// =====================================
export default async function RootLayout({ children }: ChildrenProps) {
  console.log(azeretMono.style.fontFamily);

  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', "G-GQB5QS1LHQ")`}
      </Script>
      <body
        className={`${azeretMono.className} h-full w-screen `}
      >
        <RootProvider>
            {children}
        </RootProvider>
      </body>
    </html>
  );
}
