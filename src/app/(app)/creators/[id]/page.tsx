import { Creators } from "@/components/Creators";
import { notFound } from "next/navigation";
import type { QueryResponse } from "@/types";
import { AxiosService } from "@/services/axios";

const axios = new AxiosService(process.env.NEXT_PUBLIC_API_URL!, false);

interface ExplorePageProps {
  params: {
    id: string;
  };
}

async function getUserQueries(uid: string): Promise<QueryResponse> {
  const queries = await axios.get<QueryResponse>(`/api/query/user?uid=${uid}`);
  if (!queries) notFound();
  return queries;
}

export default async function CreatorsPage({ params }: ExplorePageProps) {
  const { id } = params;

  if (!id) {
    console.log(id, "uii");
  }

  const queries = await getUserQueries(id);

  return <Creators queries={queries} />;
}
