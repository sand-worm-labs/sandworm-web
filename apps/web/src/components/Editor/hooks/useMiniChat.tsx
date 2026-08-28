"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type * as Y from "yjs";

import type { PartPayload } from "../../Chats/parts.types";
import type { AttachedReference, BlockKind } from "../../Chats/types";
import type { UploadedFileRef } from "../../Chats/MiniChatInput";

import { useChat } from "./useChat";
import { useChatStream, deriveMessageDisplay } from "./useChatStream";
import { useNotebookBlocks } from "./useNotebookBlocks";
import { useWorkspace } from "./useWorkspaces";
import { useOpenRouterModels } from "./useOpenRouterModel";
import useSideBar from "./useSideBar";

// Surfaces the real cause in the chat itself instead of only console.error —
// the generic "Something went wrong" text alone gave no way to diagnose a
// failure without digging through server logs.
function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

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
  createdAt?: string;
}

interface UseMiniChatParams {
  visible: boolean;
  workspaceId: string;
  documentId: string;
  yDoc: Y.Doc;
}

// A follow-up "text" step routes its answer through the main chat input
// instead of an embedded box, so the input needs to know what to prompt for
// and where the typed answer should go.
export interface ActiveFollowUpStep {
  prompt: string;
  placeholder?: string;
  onAnswer: (value: string) => void;
}

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
  const defaultModel = workspace?.assistantModel ?? "";

  const {
    models,
    loading: modelsLoading,
    error: modelsError,
    selectedModelId,
    isPickerOpen: isModelPickerOpen,
    openPicker: openModelPicker,
    closePicker: closeModelPicker,
    selectModel,
  } = useOpenRouterModels(workspaceId, defaultModel);

  const currentModel = selectedModelId ?? defaultModel;

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"chat" | "threads">("chat");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeThreadTitle, setActiveThreadTitle] = useState<
    string | undefined
  >(undefined);
  const [activeFollowUpStep, setActiveFollowUpStep] =
    useState<ActiveFollowUpStep | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const promptFiredRef = useRef(false);
  // Mirrors of the in-flight request's chatId/loadingId, readable
  // synchronously from handleAbort. activeChatId (React state) lags behind
  // during a brand-new chat's first message — it's only set after
  // chatApi.createChat() resolves, but isLoading (and so the abort button)
  // is already true before that, so abort needs a value it can read right
  // away, not one that arrives on a later render.
  const currentChatIdRef = useRef<string | null>(null);
  const currentLoadingMessageIdRef = useRef<string | null>(null);

  const notebookBlocks = useNotebookBlocks(yDoc);

  const referenceSources = useMemo(
    () => [{ kind: "block" as const, label: "Blocks", items: notebookBlocks }],
    [notebookBlocks]
  );

  const { api: chatApi } = useChat(workspaceId, documentId);
  const { startStream, stopStream, abortChat } = useChatStream();

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

  // ─── Load thread ───────────────────────────────────────────

  const loadThread = useCallback(
    async (chatId: string) => {
      const chat = await chatApi.fetchChat(chatId);
      console.log(chat, "g");
      setActiveChatId(chat.id);
      setActiveThreadTitle(chat.title);
      setMessages(
        (chat.messages ?? []).map((m: any) => {
          // Assistant messages store their raw envelope events in `parts` —
          // replay them the same way the live stream did, rather than
          // showing `content` (which may just be internal clarify-detection
          // JSON) directly as the message text.
          const { text, parts: streamParts } =
            m.role === "assistant" && Array.isArray(m.parts)
              ? deriveMessageDisplay(m.parts)
              : { text: m.content ?? "", parts: [] as PartPayload[] };

          return {
            id: crypto.randomUUID(),
            messageId: m.id,
            text,
            isUser: m.role === "user",
            role: m.role,
            model: m.model ?? undefined,
            finishReason: m.finishReason ?? null,
            parts: m.parts ?? null,
            streamParts: streamParts.length > 0 ? streamParts : undefined,
            attachments: m.attachments ?? null,
            usage: m.usage ?? null,
            createdAt: m.createdAt ?? undefined,
            fileRefs: (m.fileRefs ?? []) satisfies UploadedFileRef[],
            references: (m.focusedBlocks ?? []).map(
              (b: { id: string; title: string; type: string }) => ({
                id: b.id,
                label: b.title,
                sourceKind: "block" as const,
                blockKind: b.type as BlockKind,
              })
            ),
          };
        })
      );
    },
    [chatApi]
  );

  const streamMessage = useCallback(
    async (chatId: string, msgId: string, loadingId: string) => {
      currentChatIdRef.current = chatId;
      currentLoadingMessageIdRef.current = loadingId;

      await startStream({
        chatId,
        messageId: msgId,
        onToken: chunk => appendToMessage(loadingId, chunk),
        onPart: part => appendPartToMessage(loadingId, part),
        onComplete: () => {
          replaceMessage(loadingId, { isLoading: false });
          setIsLoading(false);
          currentChatIdRef.current = null;
          currentLoadingMessageIdRef.current = null;
        },
        onError: err => {
          replaceMessage(loadingId, {
            text: `Something went wrong. Please try again.\n\n\`${errorMessage(err)}\``,
            isLoading: false,
          });
          console.error("[MiniChat] stream error:", err);
          setIsLoading(false);
          currentChatIdRef.current = null;
          currentLoadingMessageIdRef.current = null;
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

      addMessage({
        text,
        isUser: true,
        references,
        fileRefs,
        createdAt: new Date().toISOString(),
      });
      setIsLoading(true);

      const loadingId = addMessage({
        text: "",
        isUser: false,
        isLoading: true,
        fileRefs: [],
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
          text: `Something went wrong. Please try again.\n\n\`${errorMessage(err)}\``,
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
      if (activeFollowUpStep) {
        if (!data.message.trim()) return;
        activeFollowUpStep.onAnswer(data.message);
        return;
      }
      handleSendSafe(data.message, data.references, data.fileRefs);
    },
    [handleSendSafe, activeFollowUpStep]
  );

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

  const handleFollowUpSubmit = useCallback(
    (summary: string) => {
      handleSendSafe(summary);
    },
    [handleSendSafe]
  );

  const handleAcceptAll = useCallback((_messageId: string) => {
    console.log("[MiniChat] accept all blocks for message:", _messageId);
  }, []);

  const handleRejectAll = useCallback((_messageId: string) => {
    console.log("[MiniChat] reject all blocks for message:", _messageId);
  }, []);

  const handleAbort = useCallback(() => {
    const chatId = currentChatIdRef.current ?? activeChatId;
    const loadingId = currentLoadingMessageIdRef.current;

    setIsLoading(false);
    if (loadingId) {
      replaceMessage(loadingId, { text: "Stopped.", isLoading: false });
    }
    currentChatIdRef.current = null;
    currentLoadingMessageIdRef.current = null;

    if (chatId) void abortChat(chatId);
  }, [activeChatId, abortChat, replaceMessage]);

  const handleNewThread = useCallback(() => {
    stopStream();
    setIsLoading(false);
    currentChatIdRef.current = null;
    currentLoadingMessageIdRef.current = null;
    setMessages([]);
    setActiveChatId(null);
    setActiveThreadTitle(undefined);
    setView("chat");
  }, [stopStream]);

  const handleSelectThread = useCallback(
    async (id: string) => {
      try {
        stopStream();
        setIsLoading(false);
        currentChatIdRef.current = null;
        currentLoadingMessageIdRef.current = null;
        await loadThread(id);
        setView("chat");
      } catch (err) {
        console.error("[MiniChat] failed to load thread:", err);
      }
    },
    [loadThread, stopStream]
  );

  useEffect(() => {
    if (promptFiredRef.current) return;
    const prompt = searchParams.get("prompt");
    if (!prompt) return;
    // The workspace's default model loads asynchronously — firing before it
    // resolves sends model: "" and fails validation server-side. Wait for a
    // real model rather than racing it.
    if (!currentModel) return;
    const updateDocumentTitle = searchParams.get("updateTitle") === "true";
    promptFiredRef.current = true;
    handleSendSafe(prompt, [], [], updateDocumentTitle);
  }, [searchParams, currentModel]);

  useEffect(() => {
    const chatId = sidebarState.rightPanelMeta?.chatId;
    if (!chatId || !visible) return;
    loadThread(chatId).catch(console.error);
  }, [sidebarState.rightPanelMeta, visible]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return {
    state: {
      messages,
      isLoading,
      view,
      activeChatId,
      activeThreadTitle,
      referenceSources,
      bottomRef,
      models,
      modelsLoading,
      modelsError,
      selectedModelId,
      isModelPickerOpen,
      activeFollowUpStep,
    },
    handlers: {
      setView,
      newThread: handleNewThread,
      selectThread: handleSelectThread,
      sendSafe: handleSendSafe,
      inputSend: handleInputSend,
      abort: handleAbort,
      vote: handleVote,
      removeVote: handleRemoveVote,
      followUpSubmit: handleFollowUpSubmit,
      acceptAll: handleAcceptAll,
      rejectAll: handleRejectAll,
      selectModel,
      openModelPicker,
      closeModelPicker,
      setActiveFollowUpStep,
    },
  };
}
