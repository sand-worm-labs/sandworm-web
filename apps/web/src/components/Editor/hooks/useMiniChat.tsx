"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type * as Y from "yjs";

import type { AttachedReference } from "../../Chats/types";

import { useChat } from "./useChat";
import { useNotebookBlocks } from "./useNotebookBlocks";
import { useWorkspace } from "./useWorkspaces";
import useSideBar from "./useSideBar";

// =====================================
// ⬢ Types
// =====================================

export interface LocalMessage {
  id: string;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
  messageId?: string;
  references?: AttachedReference[];
  files?: File[];
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
        }))
      );
    },
    [chatApi]
  );

  // ─── Send ───────────────────────────────────────────────────

  const handleSend = useCallback(
    async (
      text: string,
      references: AttachedReference[] = [],
      files: File[] = [],
      updateDocumentTitle = false
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
        let chatId = activeChatId;

        // ─── First message — create chat ───────────────────
        if (!chatId) {
          const chat = await chatApi.createChat({
            workspaceId,
            documentId,
            message: text,
            model: currentModel,
            updateDocumentTitle,
          });

          chatId = chat.id;
          setActiveChatId(chat.id);
          setActiveThreadTitle(chat.title);
        } else {
          // ─── Subsequent messages — send to existing chat ──
          const message = await chatApi.sendMessage({
            chatId,
            content: text,
            model: currentModel,
          });

          replaceMessage(loadingId, {
            text: message.content,
            isUser: false,
            isLoading: false,
            messageId: message.id,
          });
          return;
        }

        // ⬢ NOTE — LLM reply streamed in future; placeholder for now
        replaceMessage(loadingId, { text: "", isLoading: false });
      } catch (err) {
        replaceMessage(loadingId, {
          text: "Something went wrong. Please try again.",
          isLoading: false,
        });
        console.error("[MiniChat] handleSend error:", err);
      } finally {
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
    ]
  );

  const handleSendSafe = useCallback(
    (
      text: string,
      references?: AttachedReference[],
      files?: File[],
      updateDocumentTitle = false
    ) => {
      handleSend(text, references, files, updateDocumentTitle).catch(
        console.error
      );
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

  // ─── Thread management ─────────────────────────────────────

  const handleNewThread = useCallback(() => {
    setMessages([]);
    setActiveChatId(null);
    setActiveThreadTitle(undefined);
    setView("chat");
  }, []);

  const handleSelectThread = useCallback(
    async (id: string) => {
      try {
        await loadThread(id);
        setView("chat");
      } catch (err) {
        console.error("[MiniChat] failed to load thread:", err);
      }
    },
    [loadThread]
  );

  // ─── Scroll ─────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── URL prompt ─────────────────────────────────────────────

  useEffect(() => {
    if (promptFiredRef.current) return;
    const prompt = searchParams.get("prompt");
    const updateDocumentTitle = searchParams.get("updateTitle") === "true";
    if (prompt) {
      promptFiredRef.current = true;
      handleSendSafe(prompt, [], [], updateDocumentTitle);
    }
  }, [searchParams]);

  // ─── Sidebar meta (fix-with-AI open) ───────────────────────

  useEffect(() => {
    const chatId = sidebarState.rightPanelMeta?.chatId;
    if (!chatId || !visible) return;

    loadThread(chatId).catch(console.error);
  }, [sidebarState.rightPanelMeta, visible]);

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
    },
  };
}
