import { notFound } from "next/navigation";

import { ClientChatWrapper } from "@/components/Chats/ChatClientWrapper";

export default async function Page({ params }: { params: { id: string } }) {
  const user = { id: "sandwormlabs" };
  if (user?.id) {
    return notFound();
  }

  return <ClientChatWrapper id={params.id} userId={user.id} />;
}
