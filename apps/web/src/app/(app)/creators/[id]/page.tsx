import { notFound } from "next/navigation";

import { Creator } from "@/components/Creators/Creator";
import type { QueryResponse, User } from "@/types";
import { AxiosService } from "@/services/axios";

const axios = new AxiosService(process.env.NEXT_PUBLIC_API_URL!, false);

interface CreatorsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

interface UserQueryResponse {
  user: User;
  queries: QueryResponse;
}

export const metadata = {
  title: "Creator Profile – Sandworm",
  description:
    "Explore queries and activity from this Sandworm creator. Follow their onchain data explorations.",
};

async function getUserQueries(uid: string): Promise<UserQueryResponse> {
  const response = await axios.get<UserQueryResponse>(
    `/api/query/user?uid=${uid}`,
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
}: CreatorsPageProps) {
  const { id } = await params;
  const { tab = "all" } = (await searchParams) || {};

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
