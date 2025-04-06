import Head from "next/head";
import { notFound } from "next/navigation";

import { AxiosService } from "@/services/axios";
import { TabsSection } from "@/components/TabsSection";
import type { QueryResponse } from "@/types";

const axios = new AxiosService(process.env.NEXT_PUBLIC_API_URL!, false);

interface ExplorePageProps {
  searchParams: {
    page?: string;
  };
}

async function getQueries(page: string = "1"): Promise<QueryResponse> {
  const queries = await axios.get<QueryResponse>(
    `/api/query/?page=${page}&limit=10`
  );
  if (!queries) notFound();
  return queries;
}

export default async function Explore({ searchParams }: ExplorePageProps) {
  const page = searchParams.page ?? "1";
  const queries = await getQueries(page);

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
