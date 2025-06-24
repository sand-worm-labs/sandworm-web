"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CoreMessage } from "ai";

import type { Chat } from "@/services/firebase/db";
import { convertToUIMessages } from "@/lib/utils";

import { Chat as PreviewChat } from "./chat";

export function ClientChatWrapper({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const [chat, setChat] = useState<Chat | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadChat() {
      try {
        const res = await fetch(`/api/chat/${id}`, {
          method: "GET",
        });

        if (!res.ok) {
          router.replace("/404"); // or notFound equivalent
          return;
        }

        const chatData: Chat = await res.json();

        if (chatData.userId !== userId) {
          router.replace("/unauthorized"); // or show custom message
          return;
        }

        chatData.messages = convertToUIMessages(
          chatData.messages as Array<CoreMessage>
        );

        setChat(chatData);
      } catch (err) {
        console.error("Failed to fetch chat:", err);
        router.replace("/error");
      }
    }

    loadChat();
  }, [id, userId]);

  if (!chat) return <div className="p-4">Loading chat...</div>;

  return <PreviewChat id={chat.id} initialMessages={chat.messages} />;
}
