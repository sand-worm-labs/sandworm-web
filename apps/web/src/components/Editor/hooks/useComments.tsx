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
  setComments: (documentId: string, comments: Comment[]) => void;
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
    setComments: () => {
      throw new Error("Attempted to call setComments without CommentsProvider");
    },
  },
]);

type UseComments = [Comment[], Omit<API, "setComments">];

// Helper function to transform GraphQL/WebSocket data to Comment type
function transformComment(c: any, userData?: any): Comment {
  const user = userData || c.author;

  return {
    id: c.id,
    documentId: c.documentId,
    userId: c.authorId || c.userId,
    content: c.body || c.content,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    user: {
      name: user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : c.user?.name || "Unknown User",
      picture: user?.avater || user?.avatar || c.user?.picture || null,
    },
  };
}
export function useComments(documentId: string): UseComments {
  const [state, api] = useContext(Context);
  const socket = useWebsocket();

  useEffect(() => {
    if (socket && documentId) {
      socket.emit("fetch-document-comments", { documentId });
    }
  }, [socket, documentId]);

  const { setComments, ...publicApi } = api;

  return useMemo(
    (): UseComments => [state.get(documentId) ?? [], publicApi],
    [state, publicApi, documentId]
  );
}

interface Props {
  children: React.ReactNode;
}

export function CommentsProvider(props: Props) {
  const [state, setState] = useState<State>(Map());
  const socket = useWebsocket();
  const session = useSession({ redirectToLogin: false });

  const [createCommentMutation] = useCreateCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();

  // WebSocket listeners
  useEffect(() => {
    if (!socket) {
      return;
    }

    const onComments = (data: any) => {
      // Transform WebSocket data to match our Comment type
      const transformedComments = (data.comments || []).map(transformComment);
      setState(state => state.set(data.documentId, transformedComments));
    };
    socket.on("document-comments", onComments);

    const onComment = (data: any) => {
      const transformedComment = transformComment(data.comment, data.user);

      setState(state => {
        const comments = state.get(transformedComment.documentId) ?? [];

        if (comments.some(({ id }) => id === transformedComment.id)) {
          return state;
        }

        return state.set(transformedComment.documentId, [
          ...comments,
          transformedComment,
        ]);
      });
    };
    socket.on("document-comment", onComment);

    const onCommentDeleted = (data: any) => {
      setState(state => {
        const comments = state.get(data.documentId) ?? [];
        return state.set(
          data.documentId,
          comments.filter(c => c.id !== data.commentId)
        );
      });
    };
    socket.on("document-comment-deleted", onCommentDeleted);

    return () => {
      socket.off("document-comments", onComments);
      socket.off("document-comment", onComment);
      socket.off("document-comment-deleted", onCommentDeleted);
    };
  }, [socket]);

  const setComments = useCallback((documentId: string, comments: Comment[]) => {
    setState(state => state.set(documentId, comments));
  }, []);

  const createComment = useCallback(
    async (workspaceId: string, documentId: string, content: string) => {
      const user = session?.user;
      if (!user) {
        return;
      }

      const now = new Date().toISOString();
      const comment: Comment = {
        user: {
          name: user.firstName,
          picture: user.avater || null,
        },
        id: uuidv4(),
        content,
        documentId,
        userId: user.id,
        createdAt: now,
        updatedAt: now,
      };

      setState(state => {
        const comments = state.get(documentId) ?? [];
        return state.set(documentId, [...comments, comment]);
      });

      try {
        const result = await createCommentMutation({
          variables: {
            documentId,
            input: {
              id: comment.id,
              body: content,
            },
          },
        });

        if (!result.data?.createComment) {
          throw new Error("Failed to create comment");
        }
      } catch (error) {
        alert("Failed to create comment");
        setState(state => {
          const comments = state.get(documentId) ?? [];
          return state.set(
            documentId,
            comments.filter(c => c.id !== comment.id)
          );
        });
      }
    },
    [session, createCommentMutation]
  );

  const deleteComment = useCallback(
    async (workspaceId: string, documentId: string, commentId: string) => {
      const comment = state.get(documentId)?.find(c => c.id === commentId);
      if (!comment) {
        return;
      }

      setState(state => {
        const comments = state.get(documentId) ?? [];
        return state.set(
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
      } catch (error) {
        alert("Failed to delete comment");
        setState(state => {
          const comments = state.get(documentId) ?? [];
          return state.set(documentId, [...comments, comment]);
        });
      }
    },
    [state, deleteCommentMutation]
  );

  const value: [State, API] = useMemo(
    () => [state, { createComment, deleteComment, setComments }],
    [state, createComment, deleteComment, setComments]
  );

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}
