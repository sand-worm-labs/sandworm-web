"use client";

import { use } from "react";

import ProfileComponent from "@/components/Profile";
import { useUser } from "@/components/Editor/hooks/useUser";
import { useSession } from "@/components/Editor/hooks/useAuth";

interface PublicProfilePageProps {
  params: Promise<{ profile: string }>;
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const resolvedParams = use(params);

  const { user, loading } = useUser({ userId: resolvedParams.profile });
  const { user: sessionUser, loading: sessionLoading } = useSession({});

  const isOwnProfile = !!sessionUser && !!user && sessionUser.id === user.id;

  return (
    <ProfileComponent
      user={user}
      isLoading={loading || sessionLoading}
      isOwnProfile={isOwnProfile}
    />
  );
}
