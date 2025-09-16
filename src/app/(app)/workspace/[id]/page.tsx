import { WorkSpace } from "@/components/Console/WorkSpace";
import { fetchQueryById } from "@/services/axios/queryService";
import { auth } from "@/services/auth";
import type { Query } from "@/types";

export const metadata = {
  title: "Query Editor – Sandworm",
  description:
    "View and edit your saved WQL query. Fork, test, and visualize results in real time.",
};

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const currentUserId = session?.user?.id || "";
  const { id } = await params;
  let initialQuery: Query | undefined;

  try {
    initialQuery = (await fetchQueryById(id)) as Query;
  } catch (err) {
    console.warn("Query fetch failed, might be local tab:", err);
  }

  return (
    <WorkSpace initialQuery={initialQuery} currentUserId={currentUserId} />
  );
}
