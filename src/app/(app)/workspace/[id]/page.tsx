import { WorkSpace } from "@/components/WorkSpace/WorkSpace";
import { fetchQueryById } from "@/services/axios/queryService";
import { auth } from "@/services/auth";
import type { Query } from "@/types";

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
