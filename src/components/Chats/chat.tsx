"use client";

import type { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

import { MultimodalInput } from "./multimodal-input";
import { ExamplePrompts } from "./example-prompts";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, input, setInput, append, isLoading, stop, handleSubmit } =
    useChat({
      id,
      body: { id },
      initialMessages,
      api: "/api/chat",
      streamMode: "text",
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
      onError: error => {
        console.error("🔴 [FRONTEND] useChat onError:", error);
      },
    });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-dvh bg-background">
      <div className="flex flex-col mt-32 items-center gap-4">
        <h1 className="text-3xl xl:text-4xl font-medium text-center tracking-tighter text-pretty">
          What do you want to explore onchain today?
        </h1>

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
        <ExamplePrompts onPromptSelect={() => {}} />
      </div>
    </div>
  );
}
