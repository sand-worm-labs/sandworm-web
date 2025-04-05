import Head from "next/head";
import { notFound } from "next/navigation";

import { AxiosService } from "@/services/axios";
import { TabsSection } from "@/components/TabsSection";
import type { Query } from "@/types";

const axios = new AxiosService(process.env.NEXT_PUBLIC_API_URL!, false);

interface ExplorePageProps {
  searchParams: {
    page?: string;
  };
}

async function getQueries(page: string = "1"): Promise<Query[]> {
  const queries = await axios.get<Query[]>(
    `/api/query/?page=${page}&limit=100`
  );
  if (!queries) notFound();
  return queries;
}

export default async function Explore({ searchParams }: ExplorePageProps) {
  const page = searchParams.page ?? "1";
  const queries = await getQueries(page);

  console.log(queries, "queries");

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
