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
import { useOpenRouterModels } from "./useOpenRouterModel";
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
  createdAt?: string;
}

interface UseMiniChatParams {
  visible: boolean;
  workspaceId: string;
  documentId: string;
  yDoc: Y.Doc;
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

  const bottomRef = useRef<HTMLDivElement>(null);
  const promptFiredRef = useRef(false);

  const notebookBlocks = useNotebookBlocks(yDoc);

  const referenceSources = useMemo(
    () => [{ kind: "block" as const, label: "Blocks", items: notebookBlocks }],
    [notebookBlocks]
  );

  const { api: chatApi } = useChat(workspaceId, documentId);
  const { startStream, stopStream } = useChatStream();

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
      console.log(chat, "g")
      setActiveChatId(chat.id);
      setActiveThreadTitle(chat.title);
      setMessages(
        (chat.messages ?? []).map((m: any) => ({
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
        }))
      );
    },
    [chatApi]
  );

  const streamMessage = useCallback(
    async (chatId: string, msgId: string, loadingId: string) => {
      await startStream({
        chatId,
        messageId: msgId,
        onToken: chunk => appendToMessage(loadingId, chunk),
        onPart: part => appendPartToMessage(loadingId, part),
        onComplete: () => {
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

      addMessage({ text, isUser: true, references, fileRefs, createdAt: new Date().toISOString() });
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
      selectModel,
      openModelPicker,
      closeModelPicker,
    },
  };
}
