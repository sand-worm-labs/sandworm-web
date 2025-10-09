import { notFound } from "next/navigation";

import { ClientChatWrapper } from "@/components/Chats/ChatClientWrapper";
import { auth } from "@/services/auth";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  return <ClientChatWrapper id={params.id} userId={session.user.id} />;
}
