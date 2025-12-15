import type { Metadata } from "next";

import { WorkSpace } from "@/components/Console/WorkSpace";
import { useSession } from "@/components/Visualization/hooks/useAuth";

export const metadata: Metadata = {
  title: "Query Workspace IDE – Sandworm",
  description:
    "Write and run real-time WQL queries in your own workspace. Analyze onchain data with ease.",
};

export default async function ConsolePage() {
  const session = await useSession({ redirectToLogin: true });
  const currentUserId = session?.user?.id || "";

  return <WorkSpace initialQuery={undefined} currentUserId={currentUserId} />;
}
