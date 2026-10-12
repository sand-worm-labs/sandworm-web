import type { Metadata } from "next";
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
const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://localhost:8003";

interface PublicProfilePageProps {
  params: Promise<{ profile: string }>;
}

// Not GetUserProfile: that one also asks isFollowing, which needs a signed-in user.
const RESOLVE_PROFILE_USER = `
  query ResolveProfileUser($userId: String!) {
    getUser(userId: $userId) {
      id
      username
      fullName
    }
  }
`;

type ProfileUser = { id: string; username?: string; fullName?: string };

// The URL segment is a username (from search and share links) or a user id.
// A plain fetch, not getServerClient: generateMetadata and the page both call
// this at once, and getServerClient resets the shared store, cancelling the other.
async function resolveUser(idOrUsername: string) {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/api/graphql`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: RESOLVE_PROFILE_USER,
        variables: { userId: idOrUsername },
      }),
      cache: "no-store",
    });
    const { data } = (await res.json()) as {
      data?: { getUser: ProfileUser | null };
    };
    return data?.getUser ?? null;
  } catch (err) {
    console.error("[profile] user lookup failed:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const user = await resolveUser((await params).profile);
  const name = user?.fullName || user?.username;
  if (!name) return { title: "Profile" };
  return {
    title: name,
    description: `${name}'s notebooks and dashboards on Sand Worm.`,
  };
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
  const userId = (await resolveUser(profile))?.id ?? profile;
  const initialDocuments = await fetchInitialDocuments(userId);

  return (
    <div className="flex flex-col h-[100dvh] bg-base-100 font-body">
      <ShowcaseHeader active="community" />
      <main className="flex-1 min-w-0 overflow-y-auto bg-page-surface dark:text-white">
        <Suspense fallback={null}>
          <ProfilePageClient
            profileId={userId}
            initialDocuments={initialDocuments}
            pageSize={PAGE_SIZE}
          />
        </Suspense>
      </main>
    </div>
  );
}
