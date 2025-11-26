"use client";

import { useState } from "react";

import { MultimodalInput } from "./multimodal-input";
import { ExamplePrompts } from "./example-prompts";

type Attachment = {
  url: string;
  name: string;
  contentType: string;
};

type Message = {
  id: string;
  role: string;
  content: string;
};

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages?: Array<Message>;
}) {
  const [messages, setMessages] = useState<Array<Message>>(
    initialMessages || []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  const handleSubmit = (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: any
  ) => {
    if (event?.preventDefault) event.preventDefault();
    if (!input.trim()) return;

    console.log("Chat submit:", { id, input, chatRequestOptions });
    // TODO: Implement chat functionality once AI package is available
    setInput("");
  };

  const append = async (
    message: any,
    chatRequestOptions?: any
  ): Promise<string | null | undefined> => {
    console.log("Append message:", message, chatRequestOptions);
    // TODO: Implement message append functionality
    return null;
  };

  const stop = () => {
    console.log("Stop generation");
    setIsLoading(false);
  };

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-dvh bg-[#F9FAFD] dark:bg-black ">
      <div className="flex flex-col mt-32 items-center gap-2">
        <h1 className="text-3xl lg:text-3xl font-medium text-center tracking-tighter text-pretty font-primary">
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
