import Head from "next/head";

import { AxiosService } from "@/services/axios";
import type { Query } from "@/types";

import { TabsSection } from "@/components/TabsSection";

const axios = new AxiosService(process.env.NEXT_PUBLIC_API_URL!, false);

async function getQueries(): Promise<Query[]> {
  try {
    const queries = await axios.get<Query[]>("/api/query");
    return queries;
  } catch (err) {
    console.error("failed to fetch queries:", err);
    return [];
  }
}

export default async function Explore() {
  const queries = await getQueries();

  return (
    <div className="dark text-white min-h-screen">
      <Head>
        <title>Explore</title>
      </Head>
      <div className="pt-10">
        <TabsSection queries={queries} />
      </div>
    </div>
  );
}
