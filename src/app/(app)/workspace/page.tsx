import { WorkSpace } from "@/components/Console/WorkSpace";
import { auth } from "@/services/auth";

export const metadata = {
  title: "Query Workspace IDE – Sandworm",
  description:
    "Write and run real-time WQL queries in your own workspace. Analyze onchain data with ease.",
};

export default async function WorkSpacePage() {
  const session = await auth();
  const currentUserId = session?.user?.id || "";

  return <WorkSpace initialQuery={undefined} currentUserId={currentUserId} />;
}
