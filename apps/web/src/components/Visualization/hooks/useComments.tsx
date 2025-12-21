import { v4 as uuidv4 } from "uuid";
import { Map } from "immutable";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useGetDocumentCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from "@/generated/graphql";

import { useSession } from "./useAuth";
import { useWebsocket } from "./useWebSocket";

export type Comment = {
  user: {
    name: string;
    picture: string | null;
  };
  id: string;
  content: string;
  documentId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type API = {
  createComment: (
    workspaceId: string,
    documentId: string,
    content: string
  ) => Promise<void>;
  deleteComment: (
    workspaceId: string,
    documentId: string,
    commentId: string
  ) => Promise<void>;
};

type State = Map<string, Comment[]>;

const Context = createContext<[State, API]>([
  Map(),
  {
    createComment: async () => {
      throw new Error(
        "Attempted to call createComment without CommentsProvider"
      );
    },
    deleteComment: async () => {
      throw new Error(
        "Attempted to call deleteComment without CommentsProvider"
      );
    },
  },
]);

type UseComments = [Comment[], API, { loading: boolean }];

export function useComments(documentId: string): UseComments {
  const [state, api] = useContext(Context);
  const socket = useWebsocket();

  // Fetch comments via GraphQL on mount (without websocket data, won't have user details)
  const { loading } = useGetDocumentCommentsQuery({
    variables: { documentId },
    skip: !documentId,
  });

  useEffect(() => {
    // Emit websocket event for real-time sync with user details
    socket?.emit("fetch-document-comments", { documentId });
  }, [socket, documentId]);

  return useMemo(
    (): UseComments => [state.get(documentId) ?? [], api, { loading }],
    [state, api, documentId, loading]
  );
}

interface Props {
  children: React.ReactNode;
}

export function CommentsProvider({ children }: Props) {
  const [state, setState] = useState<State>(Map());
  const socket = useWebsocket();
  const session = useSession({ redirectToLogin: false });

  const [createCommentMutation] = useCreateCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();

  // Websocket listeners for real-time sync (these provide full Comment with user data)
  useEffect(() => {
    if (!socket) return () => {};

    const onComments = (data: { documentId: string; comments: Comment[] }) => {
      setState(prev => prev.set(data.documentId, data.comments));
    };

    const onComment = (data: { documentId: string; comment: Comment }) => {
      setState(prev => {
        const comments = prev.get(data.comment.documentId) ?? [];

        if (comments.some(c => c.id === data.comment.id)) {
          return prev;
        }

        return prev.set(data.comment.documentId, [...comments, data.comment]);
      });
    };

    const onCommentDeleted = (data: {
      documentId: string;
      commentId: string;
    }) => {
      setState(prev => {
        const comments = prev.get(data.documentId) ?? [];
        return prev.set(
          data.documentId,
          comments.filter(c => c.id !== data.commentId)
        );
      });
    };

    socket.on("document-comments", onComments);
    socket.on("document-comment", onComment);
    socket.on("document-comment-deleted", onCommentDeleted);

    return () => {
      socket.off("document-comments", onComments);
      socket.off("document-comment", onComment);
      socket.off("document-comment-deleted", onCommentDeleted);
    };
  }, [socket]);

  const createComment = useCallback(
    async (workspaceId: string, documentId: string, content: string) => {
      const user = session?.user;
      if (!user) return;

      const commentId = uuidv4();
      const now = new Date().toISOString();

      // Optimistic update with current user data
      const optimisticComment: Comment = {
        user: { name: user.firstName, picture: user.avatar || null },
        id: commentId,
        content,
        documentId,
        userId: user.id,
        createdAt: now,
        updatedAt: now,
      };

      setState(prev => {
        const comments = prev.get(documentId) ?? [];
        return prev.set(documentId, [...comments, optimisticComment]);
      });

      try {
        const result = await createCommentMutation({
          variables: {
            documentId,
            input: {
              id: commentId,
              body: content, // GraphQL uses 'body' not 'content'
            },
          },
        });

        if (!result.data?.createComment) {
          throw new Error("Failed to create comment");
        }

        // Websocket will sync the actual comment with user details populated by backend
      } catch (error) {
        console.error("Failed to create comment:", error);
        alert("Failed to create comment");

        // Rollback optimistic update
        setState(prev => {
          const comments = prev.get(documentId) ?? [];
          return prev.set(
            documentId,
            comments.filter(c => c.id !== commentId)
          );
        });
      }
    },
    [session, createCommentMutation]
  );

  const deleteComment = useCallback(
    async (workspaceId: string, documentId: string, commentId: string) => {
      const existing = state.get(documentId)?.find(c => c.id === commentId);
      if (!existing) return;

      // Optimistic update
      setState(prev => {
        const comments = prev.get(documentId) ?? [];
        return prev.set(
          documentId,
          comments.filter(c => c.id !== commentId)
        );
      });

      try {
        const result = await deleteCommentMutation({
          variables: {
            input: {
              workspaceId,
              documentId,
              commentId,
            },
          },
        });

        if (!result.data?.deleteComment) {
          throw new Error("Failed to delete comment");
        }

        // Websocket will confirm deletion
      } catch (error) {
        console.error("Failed to delete comment:", error);
        alert("Failed to delete comment");

        // Rollback optimistic update
        setState(prev => {
          const comments = prev.get(documentId) ?? [];
          return prev.set(documentId, [...comments, existing]);
        });
      }
    },
    [state, deleteCommentMutation]
  );

  const value = useMemo(
    () => [state, { createComment, deleteComment }] as [State, API],
    [state, createComment, deleteComment]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
