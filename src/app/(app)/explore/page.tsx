import Head from "next/head";

import TabsSection from "@/components/TabsSection";

export default async function Explore() {
  return (
    <div className="dark text-white min-h-screen">
      <Head>
        <title>Explore</title>
      </Head>
      <div className="pt-10">
        <TabsSection />
      </div>
    </div>
  );
}
