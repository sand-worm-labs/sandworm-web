/* eslint-disable react/jsx-no-useless-fragment */

"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import type * as Y from "yjs";
import { PiX } from "react-icons/pi";

import { AIChatIcon } from "../Assets/AIChatIcon";
import { useNotebookAI } from "../Editor/hooks/useNotebookAI";
import type { APIDataSources } from "../Editor/hooks/useDataSources";
import { useNotebookBlocks } from "../Editor/hooks/useNotebookBlocks";

import { MiniChatInput } from "./MiniChatInput";
import { ChatBubble } from "./ChatBubble";

// =====================================
// ⬢  Types
// =====================================
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
}

// =====================================
// ⬢  Header
// =====================================
interface MiniChatHeaderProps {
  onCancel?: () => void;
}

export const MiniChatHeader: React.FC<MiniChatHeaderProps> = ({ onCancel }) => {
  return (
    <header className="flex items-center justify-between bg-white dark:bg-base-100 border-b border-border-secondary dark:border-border-secondary">
      <div className="flex-col flex">
        <h3 className="text-base font-medium leading-6 dark:text-white text-ink-100 px-4 pt-3 xl:px-6">
          Sandworm agent
        </h3>
        <p className="text-sm text-ink-400 px-4 mb-2 xl:px-6">
          Create deep and insightful analysis
        </p>
      </div>
      <button
        type="button"
        aria-label="Cancel chat"
        onClick={() => onCancel?.()}
        className="absolute z-10 top-7 transform rounded-full  text-ink-400 bg-base-100 hover:bg-gray-100 w-6 h-6 flex justify-center items-center right-3 -translate-x-1/2 dark:border-border-tertiary"
      >
        <PiX className="w-4 h-4 text-menu-ink" />
      </button>
    </header>
  );
};

// =====================================
// ⬢  Example Prompts
// =====================================
const EXAMPLE_PROMPTS = [
  {
    label: "Token analytics",
    prompt:
      "Show me the top 20 holders of USDC on Base, including their balance changes over the past 30 days",
  },
  {
    label: "Python analysis",
    prompt:
      "Use Python to cluster wallets on Base by their transaction behaviour and flag any that look like bots",
  },
  {
    label: "Visualize",
    prompt:
      "Create a chart showing daily DEX trading volume on Base broken down by protocol over the last 60 days",
  },
];

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onSelect }) => (
  <div className="flex flex-col gap-2 w-full mt-6">
    {EXAMPLE_PROMPTS.map(item => (
      <button
        key={item.label}
        type="button"
        onClick={() => onSelect(item.prompt)}
        className="group flex items-start gap-3 w-full text-left px-4 py-2.5 rounded-xl border border-border-secondary dark:border-border-tertiary bg-white dark:bg-base-200 hover:border-primary/40 dark:hover:border-primary/40 hover:bg-primary/[0.03] dark:hover:bg-primary/[0.06] transition-all duration-150"
      >
        <span className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-ink-100 mb-0.5">
            {item.label}
          </span>
          <span className="text-[12.5px] text-ink-400 dark:text-ink-400 leading-snug line-clamp-2 group-hover:text-ink-200 dark:group-hover:text-ink-300 transition-colors duration-150">
            {item.prompt}
          </span>
        </span>
      </button>
    ))}
  </div>
);

interface MiniChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const MiniChatEmptyState: React.FC<MiniChatEmptyStateProps> = ({
  onSelectPrompt,
}) => (
  <div className="flex flex-col items-center py-8 font-body justify-end h-full">
    <div className="flex flex-col items-center">
      <AIChatIcon />
      <p className="font-body text-sm text-ink-300 dark:text-ink-400 text-center max-w-[12rem] mt-5">
        Search any data type across multiple blockchains
      </p>
    </div>
    <ExamplePrompts onSelect={onSelectPrompt} />
  </div>
);

const LoadingBubble: React.FC = () => (
  <div className="flex justify-start">
    <div className="bg-[#F1F3F4] dark:bg-[#121417] text-ink-500 dark:text-ink-400 px-4 py-3 rounded-2xl text-sm flex gap-1 items-center">
      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
);

interface MiniChatProps {
  visible: boolean;
  onClose?: () => void;
  yDoc: Y.Doc;
  dataSources?: APIDataSources;
  dataframes?: string[];
}

export const MiniChat: React.FC<MiniChatProps> = ({
  visible,
  onClose,
  yDoc,
  dataSources,
  dataframes,
}) => {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const notebookBlocks = useNotebookBlocks(yDoc);

  const referenceSources = useMemo(
    () => [{ kind: "block" as const, label: "Blocks", items: notebookBlocks }],
    [notebookBlocks]
  );

  console.log(referenceSources, "ref")

  const normalizedSources = dataSources
    ? Object.values(dataSources).map(ds => ({
        id: ds.data.id,
        name: ds.data.name,
        type: ds.data.type,
      }))
    : [];

  const { generate } = useNotebookAI({
    yDoc,
    dataSources: normalizedSources,
    dataframes,
  });

  const addMessage = useCallback((msg: Omit<Message, "id">) => {
    const id = crypto.randomUUID();
    setMessages(prev => [...prev, { ...msg, id }]);
    return id;
  }, []);

  const replaceMessage = useCallback(
    (id: string, updatedFields: Partial<Message>) => {
      setMessages(prev =>
        prev.map(m => (m.id === id ? { ...m, ...updatedFields } : m))
      );
    },
    []
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      addMessage({ text, isUser: true });
      setIsLoading(true);

      const loadingId = addMessage({
        text: "",
        isUser: false,
        isLoading: true,
      });

      try {
        const { reply } = await generate(text);
        replaceMessage(loadingId, { text: reply, isLoading: false });
      } catch (err) {
        replaceMessage(loadingId, {
          text: "Something went wrong. Please try again.",
          isLoading: false,
        });
        console.error("[MiniChat] AI error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, addMessage, replaceMessage, generate]
  );

  const handleSendSafe = useCallback(
    (text: string) => {
      handleSend(text).catch(console.error);
    },
    [handleSend]
  );

  const handleInputSend = useCallback(
    (data: { message: string; files: File[] }) => {
      handleSendSafe(data.message);
    },
    [handleSendSafe]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && messages.length === 0) {
      handleSendSafe(prompt);
    }
  }, [searchParams]);

  return (
    <>
      {visible && (
        <div className="relative w-full flex flex-col overflow-y-auto  h-full bg-white dark:bg-base-100">
          <MiniChatHeader onCancel={onClose} />

          <div className="flex-1 overflow-y-auto py-6 px-4">
            {messages.length === 0 ? (
              <MiniChatEmptyState onSelectPrompt={handleSendSafe} />
            ) : (
              <div className="flex flex-col w-full gap-4">
                {messages.map(msg =>
                  msg.isLoading ? (
                    <LoadingBubble key={msg.id} />
                  ) : (
                    <ChatBubble
                      key={msg.id}
                      text={msg.text}
                      isUser={msg.isUser}
                      onRate={rating => console.log(msg.id, rating)}
                    />
                  )
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="pb-4 md:px-4">
            {/*  <ChangesPanel /> */}
            <MiniChatInput
              onSend={handleInputSend}
              disabled={isLoading}
              referenceSources={referenceSources}
            />
          </div>
        </div>
      )}
    </>
  );
};
