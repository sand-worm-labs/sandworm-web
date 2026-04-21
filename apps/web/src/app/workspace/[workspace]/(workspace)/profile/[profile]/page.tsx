"use client"; // Required because you are using hooks

import { use } from "react"; // Import the use hook from React
import ProfileComponent from "@/components/Profile";
import { useUser } from "@/components/Editor/hooks/useUser";
// import { useCurrentUser } from "@/components/Editor/hooks/useCurrentUser";

// Type the params as a Promise
interface PublicProfilePageProps {
  params: Promise<{ profile: string }>;
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  // 1. Unwrap the params Promise using React's `use` hook
  const resolvedParams = use(params);

  console.log(resolvedParams, "res")

  // 2. Pass the unwrapped ID to your custom hook
  const { user, loading } = useUser({ userId: resolvedParams.profile });

  // Optional: Check if the logged-in user is viewing their own public link
  // const { currentUser } = useCurrentUser();
  // const isMe = currentUser?.id === user?.id;

  return (
    <ProfileComponent
      user={user}
      isLoading={loading}
      isOwnProfile={false} // Switch to `isMe` if using the optional check
    />
  );
}