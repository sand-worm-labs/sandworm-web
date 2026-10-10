import { Suspense } from "react";

import { ProfilePageClient } from "@/components/Profile/ProfileClient";
import { ShowcaseHeader } from "@/components/Showcase/ShowcaseHeader";
import {
  GetUserPublicDocumentsDocument,
  type GetUserPublicDocumentsQuery,
} from "@/generated/graphql";
import { getServerClient } from "@/graphql/server";
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

// A person's public profile, for visitors who are not inside a workspace.
export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { profile } = await params;
  const initialDocuments = await fetchInitialDocuments(profile);

  return (
    <div className="flex flex-col h-[100dvh] bg-base-100 font-body">
      <ShowcaseHeader active="community" />
      <main className="flex-1 min-w-0 overflow-y-auto bg-page-surface dark:text-white">
        <Suspense fallback={null}>
          <ProfilePageClient
            profileId={profile}
            initialDocuments={initialDocuments}
            pageSize={PAGE_SIZE}
          />
        </Suspense>
      </main>
    </div>
  );
}
