import "@/styles/globals.css";

import { Azeret_Mono as AzeretMono } from "next/font/google";
import Script from "next/script";
import type { ChildrenProps } from "@/types";
import { RootProvider } from "@/providers/RootProvider";

export const metadata = {
  description:
    "Explore, query, and visualize blockchain data on Sui, EVM, and other chains with Sandworm, your open-source, SQL-powered data IDE for Web3",
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

export default async function RootLayout({ children }: ChildrenProps) {
  return (
    <html lang="en">
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
      <RootProvider>
        <body
          className={`${azeretMono.className} h-full flex flex-col justify-between`}
        >
          {/*      <BannerAlert
          id="wql-downtime"
          message="Sandworm’s WQL is momentarily offline for upgrades. We’re working to restore access as soon as possible. Thanks for bearing with us."
        /> */}
          <section className="flex-1">{children}</section>
        </body>
      </RootProvider>
    </html>
  );
}
