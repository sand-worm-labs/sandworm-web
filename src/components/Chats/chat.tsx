"use client";

import type { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

/* import { Message as PreviewMessage } from "@/components/Chats/message";
 */
import { MultimodalInput } from "./multimodal-input";
import { ExamplePrompts } from "./example-prompts";
/* import { useScrollToBottom } from "./use-scroll-to-bottom";
 */
export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  console.log("id", id);
  const { messages, input, setInput, append, isLoading, stop, handleSubmit } =
    useChat({
      id,
      body: { id },
      initialMessages,
      api: "/api/chat",
      streamMode: "text",
      onFinish: () => {
        console.log("body", { id }, "finished chat");
        window.history.replaceState({}, "", `/chat/${id}`);
      },
      onError: error => {
        console.error("🔴 [FRONTEND] useChat onError:", error);
      },
    });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  /*   const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>(); */

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-dvh ">
      <div className="flex flex-col mt-32 items-center gap-4">
        {/*   <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages.map(message => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
            />
          ))}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div> */}
        <h1 className="text-3xl xl:text-4xl font-medium text-center tracking-tighter text-pretty roobert">
          What do you want to explore onchain today?
        </h1>

        <p className="text-[#6C757D]"> Search the blockchain for information</p>

        <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[800px] max-w-[calc(100dvw-32px) px-4 md:px-0">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
          />
        </form>
        <div className="mt-6">
          <h3 className="mb-4 text-sm">Test Queries</h3>
          <ExamplePrompts onPromptSelect={() => {}} />
        </div>
      </div>
    </div>
  );
}
