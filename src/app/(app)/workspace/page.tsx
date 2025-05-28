import { WorkSpace } from "@/components/WorkSpace/WorkSpace";
import { auth } from "@/services/auth";

export default async function WorkSpacePage() {
  const session = await auth();
  const currentUserId = session?.user?.id || "";

  return <WorkSpace initialQuery={undefined} currentUserId={currentUserId} />;
}
