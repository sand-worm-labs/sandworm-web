import { notFound } from "next/navigation";

import { Creator } from "@/components/Creators/Creator";
import type { QueryResponse, User } from "@/types";
import { AxiosService } from "@/services/axios";

const axios = new AxiosService(process.env.NEXT_PUBLIC_API_URL!, false);

interface ExplorePageProps {
  params: { id: string };
  searchParams?: { tab?: string };
}

interface UserQueryResponse {
  user: User;
  queries: QueryResponse;
}

async function getUserQueries(uid: string): Promise<UserQueryResponse> {
  const response = await axios.get<UserQueryResponse>(
    `/api/query/user?uid=${uid}`
  );
  if (!response) notFound();
  return response;
}

async function getUserStarredQueries(uid: string): Promise<QueryResponse> {
  const response = await axios.get<QueryResponse>(`/api/query/star?uid=${uid}`);
  return response;
}

export default async function CreatorsPage({
  params,
  searchParams,
}: ExplorePageProps) {
  const { id } = params;
  const tab = searchParams?.tab || "all";

  if (!id) {
    notFound();
  }

  const [{ user, queries }, starred] = await Promise.all([
    getUserQueries(id),
    getUserStarredQueries(id),
  ]);

  return (
    <Creator
      user={user}
      queries={queries}
      starredQueries={starred}
      defaultTab={tab}
    />
  );
}
