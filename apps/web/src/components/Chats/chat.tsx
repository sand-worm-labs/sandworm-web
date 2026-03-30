"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { useStringQuery } from "../Editor/hooks/useQueryArgs";
import { useDocuments } from "../Editor/hooks/useDocuments";

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
  initialMessages,
}: {
  initialMessages?: Array<Message>;
}) {
  const router = useRouter();
  const workspaceId = useStringQuery("workspace");
  const [documentsState, { createDocument }] = useDocuments(workspaceId);
  const [messages] = useState<Array<Message>>(initialMessages || []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // ⬢ Handle Chat submission and create new Project
  // =====================================
  const handleSubmit = useCallback(
    async (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();
      const text = input.trim();
      if (!text) return;
      if (documentsState.loading) return;

      try {
        const doc = await createDocument({ parentId: null, version: 2 });
        router.push(
          `/workspace/${workspaceId}/documents/${doc.id}/notebook/edit?prompt=${encodeURIComponent(text)}`
        );
      } catch (err) {
        console.error(err);
      }
    },
    [input, documentsState, createDocument, router, workspaceId]
  );

  // ⬢ Handle Prompt click and create new Project
  // =====================================
  const handlePromptSelect = useCallback(
    async (prompt: string, parentId: string | null = null) => {
      if (documentsState.loading) return;

      try {
        const doc = await createDocument({ parentId, version: 2 });
        router.push(
          `/workspace/${workspaceId}/documents/${doc.id}/notebook/edit?prompt=${encodeURIComponent(prompt)}`
        );
      } catch (err) {
        console.error(err);
      }
    },
    [documentsState, createDocument, router, workspaceId]
  );

  const append = async () => {
    return null;
  };

  const stop = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-full bg-base-100">
      <div className="flex flex-col mt-[8%] items-center gap-2">
        <h1 className="text-3xl lg:text-3xl font-medium text-center tracking-tighter font-body ">
          What do you want to explore onchain today?
        </h1>

        <p className="text-ink-400">Search the blockchain for information</p>

        <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[800px] max-w-[calc(100dvw-32px)] px-4 md:px-0 min-w-[760px]">
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
            workspaceId={workspaceId}
          />
        </form>

        <div className="mt-6">
          <h3 className="mb-4 px-6 text-sm font-body font-medium text-ink-100">
            Test Queries
          </h3>
          <ExamplePrompts onPromptSelect={handlePromptSelect} />
        </div>
      </div>
    </div>
  );
}
