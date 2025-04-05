import { Creators } from "@/components/Creators";
import { notFound } from "next/navigation";
import type { QueryResponse } from "@/types";
import { AxiosService } from "@/services/axios";

const axios = new AxiosService(process.env.NEXT_PUBLIC_API_URL!, false);

interface ExplorePageProps {
  searchParams: {
    page?: string;
  };
}

async function getQueries(page: string = "1"): Promise<QueryResponse> {
  const queries = await axios.get<QueryResponse>(
    `/api/query/?page=${page}&limit=100`
  );
  if (!queries) notFound();
  return queries;
}

export default async function CreatorsPage({ searchParams }: ExplorePageProps) {
  const page = searchParams.page ?? "1";
  const queries = await getQueries(page);

  return <Creators queries={queries} />;
}
