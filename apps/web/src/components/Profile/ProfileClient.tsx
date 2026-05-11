"use client";

import ProfileComponent from "@/components/Profile";
import { useUser } from "@/components/Editor/hooks/useUser";
import { useSession } from "@/components/Editor/hooks/useAuth";
import type { ApiDocument } from "@/types";

interface ProfilePageClientProps {
  profileId: string;
  initialDocuments: ApiDocument[];
  pageSize: number;
}

export function ProfilePageClient({
  profileId,
  initialDocuments,
  pageSize,
}: ProfilePageClientProps) {
  const { user, isFollowing, loading } = useUser({ userId: profileId });
  const { user: sessionUser, loading: sessionLoading } = useSession({});

  const isOwnProfile = !!sessionUser && !!user && sessionUser.id === user.id;

  return (
    <ProfileComponent
      user={user}
      isLoading={loading || sessionLoading}
      isOwnProfile={isOwnProfile}
      initialDocuments={initialDocuments}
      pageSize={pageSize}
      isFollowing={isFollowing}
    />
  );
}
