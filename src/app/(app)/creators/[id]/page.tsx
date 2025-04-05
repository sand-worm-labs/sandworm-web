import { notFound } from "next/navigation";

import { Creators } from "@/components/Creators";
import type { QueryResponse, User } from "@/types";
import { AxiosService } from "@/services/axios";

const axios = new AxiosService(process.env.NEXT_PUBLIC_API_URL!, false);

interface ExplorePageProps {
  params: {
    id: string;
  };
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

export default async function CreatorsPage({ params }: ExplorePageProps) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  const { user, queries } = await getUserQueries(id);

  return <Creators user={user} queries={queries} />;
}
