"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type * as Y from "yjs";

import type { PartPayload } from "../../Chats/parts.types";
import type { AttachedReference, BlockKind } from "../../Chats/types";
import type { UploadedFileRef } from "../../Chats/MiniChatInput";

import { useChat } from "./useChat";
import { useChatStream } from "./useChatStream";
import { useNotebookBlocks } from "./useNotebookBlocks";
import { useWorkspace } from "./useWorkspaces";
import useSideBar from "./useSideBar";

// =====================================
// ⬢ Types
// =====================================

export interface LocalMessage {
  id: string;
  messageId?: string;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
  role?: string;
  model?: string;
  finishReason?: string | null;
  parts?: unknown;
  attachments?: unknown;
  usage?: unknown;
  focusedBlocks?: Array<{ id: string; title: string; type: string }>;
  references?: AttachedReference[];
  fileRefs: UploadedFileRef[];
  streamParts?: PartPayload[];
}

interface UseMiniChatParams {
  visible: boolean;
  workspaceId: string;
  documentId: string;
  yDoc: Y.Doc;
}

// =====================================
// ⬢ Mock Parts
// =====================================

const MOCK_PARTS: PartPayload[] = [
  {
    type: "thinking",
    thinking:
      "The user wants a DAO treasury analysis. I need to fetch balances using the DAO Treasury PowerToolbox, then flatten with SQL, cluster with Python, visualise, and write a markdown summary.",
    duration_ms: 5800,
    contextUsed: [
      { blockId: "b1", blockTitle: "SQL Block #1", blockType: "SQL" },
      { blockId: "b2", blockTitle: "Python Block #2", blockType: "PYTHON" },
    ],
  },
  {
    type: "tool_call",
    toolName: "DAO Treasury Balances",
    category: "defi",
    params: { daos: "top-8", chain: "Ethereum" },
  },
  {
    type: "block_action",
    action: "created",
    blockType: "PowerToolbox",
    blockTitle: "DAO treasury balances",
    blockId: "ptb-001",
  },
  {
    type: "block_action",
    action: "ran",
    blockType: "PowerToolbox",
    blockTitle: "DAO treasury balances",
    blockId: "ptb-001",
    previewResult: { rowCount: 8, hasError: false },
  },
  {
    type: "tool_result",
    summary: "Fetched 8 DAOs · $1.08B nominal value",
    rowCount: 8,
  },
  {
    type: "block_action",
    action: "created",
    blockType: "SQL",
    blockTitle: "Flatten token holdings",
    blockId: "sql-001",
  },
  {
    type: "block_action",
    action: "ran",
    blockType: "SQL",
    blockTitle: "Flatten token holdings",
    blockId: "sql-001",
    previewResult: { rowCount: 214, hasError: false },
  },
  {
    type: "block_action",
    action: "created",
    blockType: "Python",
    blockTitle: "Cluster by asset type",
    blockId: "py-001",
  },
  {
    type: "block_action",
    action: "ran",
    blockType: "Python",
    blockTitle: "Cluster by asset type",
    blockId: "py-001",
    previewResult: { rowCount: 214, hasError: false },
  },
  {
    type: "block_action",
    action: "created",
    blockType: "Visualization",
    blockTitle: "Treasury breakdown chart",
    blockId: "viz-001",
  },
  {
    type: "block_action",
    action: "ran",
    blockType: "Visualization",
    blockTitle: "Treasury breakdown chart",
    blockId: "viz-001",
  },
  {
    type: "block_action",
    action: "created",
    blockType: "Markdown",
    blockTitle: "Analysis summary",
    blockId: "md-001",
  },
  {
    type: "block_action",
    action: "edited",
    blockType: "Markdown",
    blockTitle: "Analysis summary",
    blockId: "md-001",
  },
  {
    type: "pending_review",
    blocks: [
      {
        blockId: "sql-001",
        blockType: "SQL",
        blockTitle: "Flatten token holdings",
        action: "created",
      },
      {
        blockId: "py-001",
        blockType: "Python",
        blockTitle: "Cluster by asset type",
        action: "created",
      },
      {
        blockId: "md-001",
        blockType: "Markdown",
        blockTitle: "Analysis summary",
        action: "edited",
      },
    ],
  },
  {
    type: "follow_up",
    message: "Before I proceed, a couple of questions:",
    questions: [
      {
        id: "scope",
        text: "Should I replace the entire notebook or keep existing cells?",
        inputType: "radio",
        options: [
          { value: "all", label: "Replace entire notebook" },
          { value: "append", label: "Append below existing cells" },
        ],
      },
      {
        id: "notes",
        text: "Anything else to note?",
        inputType: "text",
        placeholder: "Optional...",
        required: false,
      },
    ],
  },
];

// =====================================
// ⬢ useMiniChat
// =====================================

export function useMiniChat({
  visible,
  workspaceId,
  documentId,
  yDoc,
}: UseMiniChatParams) {
  const searchParams = useSearchParams();
  const { workspace } = useWorkspace(workspaceId);
  const { state: sidebarState } = useSideBar();
  const currentModel = workspace?.assistantModel ?? "";

  // ─── State ─────────────────────────────────────────────────

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"chat" | "threads">("chat");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeThreadTitle, setActiveThreadTitle] = useState<
    string | undefined
  >(undefined);

  const bottomRef = useRef<HTMLDivElement>(null);
  const promptFiredRef = useRef(false);

  // ─── Derived ───────────────────────────────────────────────

  const notebookBlocks = useNotebookBlocks(yDoc);

  const referenceSources = useMemo(
    () => [{ kind: "block" as const, label: "Blocks", items: notebookBlocks }],
    [notebookBlocks]
  );

  const { api: chatApi } = useChat(workspaceId, documentId);
  const { startStream, stopStream } = useChatStream();

  // ─── Message helpers ───────────────────────────────────────

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

  const appendToMessage = useCallback((id: string, chunk: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, text: (m.text ?? "") + chunk, isLoading: false }
          : m
      )
    );
  }, []);

  const appendPartToMessage = useCallback((id: string, part: PartPayload) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, streamParts: [...(m.streamParts ?? []), part] }
          : m
      )
    );
  }, []);

  const injectMockParts = useCallback(
    (id: string) => {
      MOCK_PARTS.forEach(part => appendPartToMessage(id, part));
    },
    [appendPartToMessage]
  );

  // ─── Load thread ───────────────────────────────────────────

  const loadThread = useCallback(
    async (chatId: string) => {
      const chat = await chatApi.fetchChat(chatId);
      setActiveChatId(chat.id);
      setActiveThreadTitle(chat.title);
      setMessages(
        (chat.messages ?? []).map(m => ({
          id: crypto.randomUUID(),
          messageId: m.id,
          text: m.content,
          isUser: m.role === "user",
          role: m.role,
          model: m.model ?? undefined,
          finishReason: m.finishReason ?? null,
          parts: m.parts ?? null,
          attachments: m.attachments ?? null,
          usage: m.usage ?? null,
          references: (m.focusedBlocks ?? []).map(b => ({
            id: b.id,
            label: b.title,
            sourceKind: "block" as const,
            blockKind: b.type as BlockKind,
          })),
        }))
      );
    },
    [chatApi]
  );

  // ─── Stream helper ─────────────────────────────────────────

  const streamMessage = useCallback(
    async (chatId: string, msgId: string, loadingId: string) => {
      await startStream({
        chatId,
        messageId: msgId,
        onToken: chunk => appendToMessage(loadingId, chunk),
        onPart: part => appendPartToMessage(loadingId, part),
        onComplete: () => {
          // injectMockParts(loadingId);
          setIsLoading(false);
        },
        onError: err => {
          replaceMessage(loadingId, {
            text: "Something went wrong. Please try again.",
            isLoading: false,
          });
          console.error("[MiniChat] stream error:", err);
          setIsLoading(false);
        },
      });
    },
    [startStream, appendToMessage, appendPartToMessage, replaceMessage]
  );

  const handleSend = useCallback(
    async (
      text: string,
      references: AttachedReference[] = [],
      fileRefs: UploadedFileRef[] = [],
      updateDocumentTitle = false
    ) => {
      if (!text.trim() || isLoading) return;

      console.log("[MiniChat] sending fileRefs:", fileRefs);

      addMessage({ text, isUser: true, references, fileRefs });
      setIsLoading(true);

      const loadingId = addMessage({
        text: "",
        isUser: false,
        isLoading: true,
      });

      try {
        const focusedBlocks = references
          .filter(r => r.sourceKind === "block")
          .map(r => ({
            id: r.id,
            title: r.label,
            type: r.blockKind ?? r.sourceKind,
          }));

        let chatId = activeChatId;

        if (!chatId) {
          const chat = await chatApi.createChat({
            workspaceId,
            documentId,
            message: text,
            model: currentModel,
            updateDocumentTitle,
            focusedBlocks: focusedBlocks.length > 0 ? focusedBlocks : undefined,
          });

          chatId = chat.id;
          setActiveChatId(chat.id);
          setActiveThreadTitle(chat.title);

          const [firstMessage] = await chatApi.fetchChatMessages(chat.id);

          if (firstMessage?.id) {
            await streamMessage(chat.id, firstMessage.id, loadingId);
          } else {
            replaceMessage(loadingId, { text: "", isLoading: false });
            setIsLoading(false);
          }
          return;
        }

        const message = await chatApi.sendMessage({
          chatId,
          content: text,
          model: currentModel,
          focusedBlocks: focusedBlocks.length > 0 ? focusedBlocks : undefined,
        });

        await streamMessage(chatId, message.id, loadingId);
      } catch (err) {
        replaceMessage(loadingId, {
          text: "Something went wrong. Please try again.",
          isLoading: false,
        });
        console.error("[MiniChat] handleSend error:", err);
        setIsLoading(false);
      }
    },
    [
      isLoading,
      activeChatId,
      workspaceId,
      documentId,
      currentModel,
      addMessage,
      replaceMessage,
      chatApi,
      streamMessage,
    ]
  );

  const handleSendSafe = useCallback(
    (
      text: string,
      references?: AttachedReference[],
      fileRefs?: UploadedFileRef[],
      updateDocumentTitle = false
    ) => {
      handleSend(text, references, fileRefs, updateDocumentTitle).catch(
        console.error
      );
    },
    [handleSend]
  );

  const handleInputSend = useCallback(
    (data: {
      message: string;
      fileRefs?: UploadedFileRef[];
      references: AttachedReference[];
    }) => {
      handleSendSafe(data.message, data.references, data.fileRefs);
    },
    [handleSendSafe]
  );

  // ─── Vote ──────────────────────────────────────────────────

  const handleVote = useCallback(
    async (messageId: string, isUpvoted: boolean) => {
      await chatApi.voteMessage({ messageId, isUpvoted });
    },
    [chatApi]
  );

  const handleRemoveVote = useCallback(
    async (messageId: string) => {
      await chatApi.removeVote(messageId);
    },
    [chatApi]
  );

  // ─── Follow-up / review ────────────────────────────────────

  const handleFollowUpSubmit = useCallback(
    (answers: Record<string, string>) => {
      const text = Object.entries(answers)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      handleSendSafe(text);
    },
    [handleSendSafe]
  );

  const handleAcceptAll = useCallback((_messageId: string) => {
    console.log("[MiniChat] accept all blocks for message:", _messageId);
  }, []);

  const handleRejectAll = useCallback((_messageId: string) => {
    console.log("[MiniChat] reject all blocks for message:", _messageId);
  }, []);

  // ─── Thread management ─────────────────────────────────────

  const handleNewThread = useCallback(() => {
    stopStream();
    setMessages([]);
    setActiveChatId(null);
    setActiveThreadTitle(undefined);
    setView("chat");
  }, [stopStream]);

  const handleSelectThread = useCallback(
    async (id: string) => {
      try {
        stopStream();
        await loadThread(id);
        setView("chat");
      } catch (err) {
        console.error("[MiniChat] failed to load thread:", err);
      }
    },
    [loadThread, stopStream]
  );

  // ─── Scroll ─────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (promptFiredRef.current) return;
    const prompt = searchParams.get("prompt");
    const updateDocumentTitle = searchParams.get("updateTitle") === "true";
    if (prompt) {
      promptFiredRef.current = true;
      handleSendSafe(prompt, [], [], updateDocumentTitle);
    }
  }, [searchParams]);

  useEffect(() => {
    const chatId = sidebarState.rightPanelMeta?.chatId;
    if (!chatId || !visible) return;
    loadThread(chatId).catch(console.error);
  }, [sidebarState.rightPanelMeta, visible]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  // ─── Return ────────────────────────────────────────────────

  return {
    state: {
      messages,
      isLoading,
      view,
      activeChatId,
      activeThreadTitle,
      referenceSources,
      bottomRef,
    },
    handlers: {
      setView,
      newThread: handleNewThread,
      selectThread: handleSelectThread,
      sendSafe: handleSendSafe,
      inputSend: handleInputSend,
      vote: handleVote,
      removeVote: handleRemoveVote,
      followUpSubmit: handleFollowUpSubmit,
      acceptAll: handleAcceptAll,
      rejectAll: handleRejectAll,
    },
  };
}
