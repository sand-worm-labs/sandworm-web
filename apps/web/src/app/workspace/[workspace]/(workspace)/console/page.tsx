"use client";

import { WorkSpace } from "@/components/Console/WorkSpace";
import { useSession } from "@/components/Editor/hooks/useAuth";

export default function ConsolePage() {
  const session = useSession({ redirectToLogin: true });
  const currentUserId = session?.user?.id || "";

  if (!session) return null;

  return <WorkSpace initialQuery={undefined} currentUserId={currentUserId} />;
}
