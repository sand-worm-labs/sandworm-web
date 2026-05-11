import { Suspense } from "react";

import {
  GetUserPublicDocumentsDocument,
  type GetUserPublicDocumentsQuery,
} from "@/generated/graphql";
import { getServerClient } from "@/graphql/server";
import { ProfilePageClient } from "@/components/Profile/ProfileClient";
import type { ApiDocument } from "@/types";

const PAGE_SIZE = 20;

interface PublicProfilePageProps {
  params: Promise<{ profile: string }>;
}

async function fetchInitialDocuments(userId: string) {
  const client = await getServerClient();
  try {
    const { data } = await client.query<GetUserPublicDocumentsQuery>({
      query: GetUserPublicDocumentsDocument,
      variables: { userId, limit: PAGE_SIZE, offset: 0 },
    });
    return (data?.getUserPublicDocuments ?? []) as ApiDocument[];
  } catch (err) {
    console.error("[profile] SSR document fetch failed:", err);
    return [] as ApiDocument[];
  }
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { profile } = await params;
  const initialDocuments = await fetchInitialDocuments(profile);

  return (
    <Suspense fallback={null}>
      <ProfilePageClient
        profileId={profile}
        initialDocuments={initialDocuments}
        pageSize={PAGE_SIZE}
      />
    </Suspense>
  );
}
