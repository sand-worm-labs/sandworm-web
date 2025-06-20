/* import { notFound } from "next/navigation";

import { Chat as PreviewChat } from "@/components/Chats/chat";
import { getChatById } from "@/db/queries";
import type { Chat } from "@/services/firebase/db";
import type { CoreMessage } from "ai";
import { auth } from "@/services/auth";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page({ params }: { params: any }) {
  const { id } = params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    notFound();
  }

  // type casting and converting messages to UI messages
  const chat: Chat = {
    ...chatFromDb,
    messages: convertToUIMessages(chatFromDb.messages as Array<CoreMessage>),
  };

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  return <PreviewChat id={chat.id} initialMessages={chat.messages} />;
}
 */

// app/chat/[id]/page.tsx (still a server component)
import { ClientChatWrapper } from "@/components/Chats/ChatClientWrapper";
import { notFound } from "next/navigation";
import { auth } from "@/services/auth";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  return <ClientChatWrapper id={params.id} userId={session.user.id} />;
}
