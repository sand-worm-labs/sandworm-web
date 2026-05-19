import { useCallback, useMemo } from "react";
import type { Reference } from "@apollo/client";

import {
  useGetChatsQuery,
  useGetChatLazyQuery,
  useGetChatMessagesLazyQuery,
  useCreateChatMutation,
  useUpdateChatMutation,
  useDeleteChatMutation,
  usePinChatMutation,
  useSendMessageMutation,
  useVoteMessageMutation,
  useRemoveVoteMutation,
} from "@/generated/graphql";
import type {
  Chat,
  Message,
  Vote,
  CreateChatInput,
  UpdateChatInput,
  SendMessageInput,
  VoteMessageInput,
} from "@/generated/graphql";

// =====================================
// ⬢ Types
// =====================================

type CreateChatPayload = CreateChatInput;
type UpdateChatPayload = UpdateChatInput;
type SendMessagePayload = SendMessageInput;
type VoteMessagePayload = VoteMessageInput;

type API = {
  createChat: (payload: CreateChatPayload) => Promise<Chat>;
  updateChat: (payload: UpdateChatPayload) => Promise<Chat>;
  deleteChat: (chatId: string) => Promise<boolean>;
  pinChat: (chatId: string) => Promise<Chat>;
  fetchChat: (chatId: string) => Promise<Chat>;
  fetchChatMessages: (chatId: string) => Promise<Message[]>;
  sendMessage: (payload: SendMessagePayload) => Promise<Message>;
  voteMessage: (payload: VoteMessagePayload) => Promise<Vote>;
  removeVote: (messageId: string) => Promise<boolean>;
};

type UseChat = {
  chats: Chat[];
  loading: boolean;
  error: Error | undefined;
  api: API;
};

// =====================================
// ⬢ Utils
// =====================================

function buildOptimisticChat(input: CreateChatPayload): Chat {
  return {
    __typename: "Chat",
    id: `temp-${Date.now()}`,
    userId: "",
    workspaceId: input.workspaceId,
    documentId: input.documentId,
    title: input.title ?? "New Chat",
    isPrivate: false,
    pin: false,
    lastContext: null,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// =====================================
// ⬢ useChat
// =====================================

export const useChat = (workspaceId: string, documentId: string): UseChat => {
  const { data, loading, error } = useGetChatsQuery({
    variables: { workspaceId, documentId },
    skip: !workspaceId || !documentId,
  });

  const chats = useMemo(() => (data?.chats ?? []) as Chat[], [data?.chats]);

  // ─── Queries ───────────────────────────────────────────────

  const [fetchChatQuery] = useGetChatLazyQuery();
  const [fetchChatMessagesQuery] = useGetChatMessagesLazyQuery();

  // ─── Mutations ─────────────────────────────────────────────

  const [createChatMutation] = useCreateChatMutation();
  const [updateChatMutation] = useUpdateChatMutation();
  const [deleteChatMutation] = useDeleteChatMutation();
  const [pinChatMutation] = usePinChatMutation();
  const [sendMessageMutation] = useSendMessageMutation();
  const [voteMessageMutation] = useVoteMessageMutation();
  const [removeVoteMutation] = useRemoveVoteMutation();

  // ─── API ───────────────────────────────────────────────────

  const createChat = useCallback(
    async (payload: CreateChatPayload): Promise<Chat> => {
      const result = await createChatMutation({
        variables: { input: payload },
        optimisticResponse: {
          __typename: "Mutation",
          createChat: buildOptimisticChat(payload),
        },
        update: (cache, { data: mutationData }) => {
          if (!mutationData?.createChat) return;
          cache.modify({
            fields: {
              chats(existing, { toReference }) {
                const current = existing ?? [];
                const ref = toReference(mutationData.createChat);
                if (!ref) return current;
                return [...current, ref];
              },
            },
          });
        },
      });

      const chat = result.data?.createChat;
      if (!chat) throw new Error("Failed to create chat");
      return chat as Chat;
    },
    [createChatMutation]
  );

  const updateChat = useCallback(
    async (payload: UpdateChatPayload): Promise<Chat> => {
      const result = await updateChatMutation({
        variables: { input: payload },
      });

      const chat = result.data?.updateChat;
      if (!chat) throw new Error("Failed to update chat");
      return chat as Chat;
    },
    [updateChatMutation]
  );

  const deleteChat = useCallback(
    async (chatId: string): Promise<boolean> => {
      const result = await deleteChatMutation({
        variables: { chatId },
        optimisticResponse: { __typename: "Mutation", deleteChat: true },
        update: (cache, { data: mutationData }) => {
          if (!mutationData?.deleteChat) return;
          cache.modify({
            fields: {
              chats(existing, { readField }) {
                const current = (existing ?? []) as Reference[];
                return current.filter(
                  (ref: Reference) => readField("id", ref) !== chatId
                );
              },
            },
          });
        },
      });

      if (!result.data?.deleteChat) throw new Error("Failed to delete chat");
      return result.data.deleteChat;
    },
    [deleteChatMutation]
  );

  const pinChat = useCallback(
    async (chatId: string): Promise<Chat> => {
      const result = await pinChatMutation({ variables: { chatId } });
      const chat = result.data?.pinChat;
      if (!chat) throw new Error("Failed to pin/unpin chat");
      return chat as Chat;
    },
    [pinChatMutation]
  );

  const fetchChat = useCallback(
    async (chatId: string): Promise<Chat> => {
      const result = await fetchChatQuery({ variables: { chatId } });
      const chat = result.data?.chat;
      if (!chat) throw new Error(`Chat ${chatId} not found`);
      return chat as Chat;
    },
    [fetchChatQuery]
  );

  const fetchChatMessages = useCallback(
    async (chatId: string): Promise<Message[]> => {
      const result = await fetchChatMessagesQuery({ variables: { chatId } });
      return (result.data?.chatMessages ?? []) as Message[];
    },
    [fetchChatMessagesQuery]
  );

  const sendMessage = useCallback(
    async (payload: SendMessagePayload): Promise<Message> => {
      const result = await sendMessageMutation({
        variables: { input: payload },
        update: (cache, { data: mutationData }) => {
          if (!mutationData?.sendMessage) return;

          cache.modify({
            id: cache.identify({ __typename: "Chat", id: payload.chatId }),
            fields: {
              messages(existing, { toReference }) {
                const current = existing ?? [];
                const ref = toReference(mutationData.sendMessage);
                if (!ref) return current;
                return [...current, ref];
              },
            },
          });
        },
      });

      const message = result.data?.sendMessage;
      console.log("message res", message);
      if (!message) throw new Error("Failed to send message");
      return message as Message;
    },
    [sendMessageMutation]
  );

  const voteMessage = useCallback(
    async (payload: VoteMessagePayload): Promise<Vote> => {
      const result = await voteMessageMutation({
        variables: { input: payload },
      });

      const vote = result.data?.voteMessage;
      if (!vote) throw new Error("Failed to vote on message");
      return vote as Vote;
    },
    [voteMessageMutation]
  );

  const removeVote = useCallback(
    async (messageId: string): Promise<boolean> => {
      const result = await removeVoteMutation({ variables: { messageId } });
      if (!result.data?.removeVote) throw new Error("Failed to remove vote");
      return result.data.removeVote;
    },
    [removeVoteMutation]
  );

  return useMemo(
    () => ({
      chats,
      loading,
      error,
      api: {
        createChat,
        updateChat,
        deleteChat,
        pinChat,
        fetchChat,
        fetchChatMessages,
        sendMessage,
        voteMessage,
        removeVote,
      },
    }),
    [
      chats,
      loading,
      error,
      createChat,
      updateChat,
      deleteChat,
      pinChat,
      fetchChat,
      fetchChatMessages,
      sendMessage,
      voteMessage,
      removeVote,
    ]
  );
};
