"use client"
import React from "react";

import ProfileComponent from "@/components/Profile";
import { useCurrentUser } from "@/components/Editor/hooks/useCurrentUser";

export default function ProfilePage() {
  const { currentUser, loading } = useCurrentUser();

  return (
    <div>
      <ProfileComponent
        user={currentUser}
        isLoading={loading}
        isOwnProfile={true}
      />
    </div>
  );
}
