import WorkSpace from "@/components/WorkSpace/WorkSpace";
import { fetchQueryById } from "@/services/axios/queryService";
import { notFound } from "next/navigation";
import { auth } from "@/services/auth";

export default async function WorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const currentUserId = session?.user?.id || "";

  let initialQuery = null;

  try {
    initialQuery = await fetchQueryById(params.id);
  } catch (err) {
    console.warn("Query fetch failed, might be local tab:", err);
  }

  return (
    <WorkSpace
      initialQuery={initialQuery || undefined}
      currentUserId={currentUserId}
    />
  );
}
