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
  const queryRes = await fetchQueryById(params.id).catch(() => null);

  console.log("Query response:", queryRes);

  if (!queryRes) return notFound();

  const query = queryRes;
  const currentUserId = session?.user?.id || "";

  return <WorkSpace initialQuery={query} currentUserId={currentUserId} />;
}
