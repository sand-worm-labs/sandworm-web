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
import { PiX, PiPlus, PiClockCounterClockwise } from "react-icons/pi";

import { useChat } from "../Editor/hooks/useChat";
import { AIChatIcon } from "../Assets/AIChatIcon";
import { useNotebookBlocks } from "../Editor/hooks/useNotebookBlocks";

import { MiniChatInput } from "./MiniChatInput";
import { ChatBubble } from "./ChatBubble";
import type { AttachedReference } from "./types";
import { ThreadList } from "./ThreadList";

// =====================================
// ⬢  Types
// =====================================

interface LocalMessage {
  id: string;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
  references?: AttachedReference[];
  files?: File[];
}

// =====================================
// ⬢  Header
// =====================================

interface MiniChatHeaderProps {
  onCancel?: () => void;
  onOpenThreads: () => void;
  onNewThread: () => void;
  activeThreadTitle?: string;
}

export const MiniChatHeader: React.FC<MiniChatHeaderProps> = ({
  onCancel,
  onOpenThreads,
  onNewThread,
  activeThreadTitle,
}) => (
  <header className="flex items-center gap-2 px-3 pt-3 pb-2.5 bg-white dark:bg-base-100 border-b border-border-secondary dark:border-border-secondary">
    <div
      className="flex-shrink-0 flex items-center justify-center w-7 h-7
      rounded-lg border border-[#DEE2E6] dark:border-[#3A3A38]
      bg-white dark:bg-[#252523]"
    >
      <AIChatIcon size={14} />
    </div>

    <div className="flex-1 min-w-0">
      {activeThreadTitle ? (
        <h3 className="text-[13px] font-medium text-ink-100 dark:text-white truncate leading-tight">
          {activeThreadTitle}
        </h3>
      ) : (
        <>
          <h3 className="text-[13px] font-medium text-ink-100 dark:text-white leading-tight">
            Sandworm agent
          </h3>
          <p className="text-[11px] text-ink-400 dark:text-ink-500 leading-tight mt-0.5">
            Create deep and insightful analysis
          </p>
        </>
      )}
    </div>

    <div className="flex items-center gap-0.5 flex-shrink-0">
      <button
        type="button"
        aria-label="New thread"
        onClick={onNewThread}
        className="flex items-center justify-center w-7 h-7 rounded-lg
          text-ink-400 hover:text-ink-500 hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
          transition-colors"
      >
        <PiPlus size={15} />
      </button>
      <button
        type="button"
        aria-label="Threads"
        onClick={onOpenThreads}
        className="flex items-center justify-center w-7 h-7 rounded-lg
          text-ink-400 hover:text-ink-500 hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
          transition-colors"
      >
        <PiClockCounterClockwise size={15} />
      </button>
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="flex items-center justify-center w-7 h-7 rounded-lg
          text-ink-400 hover:text-ink-500 hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
          transition-colors"
      >
        <PiX size={15} />
      </button>
    </div>
  </header>
);

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

// =====================================
// ⬢  MiniChat
// =====================================

interface MiniChatProps {
  visible: boolean;
  onClose?: () => void;
  yDoc: Y.Doc;
  workspaceId: string;
  documentId: string;
}

export const MiniChat: React.FC<MiniChatProps> = ({
  visible,
  onClose,
  yDoc,
  workspaceId,
  documentId,
}) => {
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"chat" | "threads">("chat");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeThreadTitle, setActiveThreadTitle] = useState<
    string | undefined
  >(undefined);

  const bottomRef = useRef<HTMLDivElement>(null);

  const notebookBlocks = useNotebookBlocks(yDoc);

  const referenceSources = useMemo(
    () => [{ kind: "block" as const, label: "Blocks", items: notebookBlocks }],
    [notebookBlocks]
  );

  const { api: chatApi } = useChat(workspaceId, documentId);

  const addMessage = useCallback((msg: Omit<LocalMessage, "id">) => {
    const id = crypto.randomUUID();
    setMessages(prev => [...prev, { ...msg, id }]);
    return id;
  }, []);

  const replaceMessage = useCallback(
    (id: string, updated: Partial<LocalMessage>) => {
      setMessages(prev =>
        prev.map(m => (m.id === id ? { ...m, ...updated } : m))
      );
    },
    []
  );

  const handleSend = useCallback(
    async (
      text: string,
      references: AttachedReference[] = [],
      files: File[] = []
    ) => {
      if (!text.trim() || isLoading) return;

      addMessage({ text, isUser: true, references, files });
      setIsLoading(true);

      const loadingId = addMessage({
        text: "",
        isUser: false,
        isLoading: true,
      });

      try {
        if (!activeChatId) {
          const chat = await chatApi.createChat({
            workspaceId,
            documentId,
            message: text,
          });

          setActiveChatId(chat.id);
          setActiveThreadTitle(chat.title);
        }

        // ⬢ NOTE — LLM reply not wired yet; remove loading bubble for now.
        replaceMessage(loadingId, {
          text: "Something went wrong. Please try again.",
          isLoading: false,
        });
      } catch (err) {
        replaceMessage(loadingId, {
          text: "Something went wrong. Please try again.",
          isLoading: false,
        });
        console.error("[MiniChat] createChat error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      activeChatId,
      workspaceId,
      documentId,
      addMessage,
      replaceMessage,
      chatApi,
    ]
  );

  const handleSendSafe = useCallback(
    (text: string, references?: AttachedReference[], files?: File[]) => {
      handleSend(text, references, files).catch(console.error);
    },
    [handleSend]
  );

  const handleInputSend = useCallback(
    (data: {
      message: string;
      files: File[];
      references: AttachedReference[];
    }) => {
      handleSendSafe(data.message, data.references, data.files);
    },
    [handleSendSafe]
  );

  const handleNewThread = useCallback(() => {
    setMessages([]);
    setActiveChatId(null);
    setActiveThreadTitle(undefined);
    setView("chat");
  }, []);

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
        <div className="relative w-full flex flex-col h-full bg-white dark:bg-base-100 overflow-hidden">
          {view === "threads" ? (
            <ThreadList
              workspaceId={workspaceId}
              documentId={documentId}
              onSelectThread={id => {
                console.log("[MiniChat] open thread:", id);
                setView("chat");
              }}
              onBack={() => setView("chat")}
            />
          ) : (
            <>
              <MiniChatHeader
                onCancel={onClose}
                onOpenThreads={() => setView("threads")}
                onNewThread={handleNewThread}
                activeThreadTitle={activeThreadTitle}
              />

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
                          references={msg.references}
                          files={msg.files}
                          onRate={rating => console.log(msg.id, rating)}
                        />
                      )
                    )}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <div className="pb-4 md:px-4">
                <MiniChatInput
                  onSend={handleInputSend}
                  disabled={isLoading}
                  referenceSources={referenceSources}
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
