import { v4 as uuidv4 } from "uuid";
import { Map } from "immutable";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
function transformComment(c: any): Comment {
  return {
    id: c.id,
    documentId: c.documentId,
    userId: c.authorId || c.userId,
    content: c.body || c.content,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    user: {
      name: c.author?.firstName
        ? `${c.author.firstName} ${c.author.lastName || ""}`.trim()
        : c.user?.name || "Unknown User",
      picture: c.author?.avatar || c.user?.picture || null,
    },
  };
}

export function useComments(documentId: string): UseComments {
  const [state, api] = useContext(Context);
  const socket = useWebsocket();
  const hasLoadedRef = useRef(false);

  // Fetch initial comments from GraphQL
  const { data } = useGetDocumentCommentsQuery({
    variables: { documentId },
    skip: !documentId,
  });

  // When GraphQL data arrives, transform and store it
  useEffect(() => {
    if (data?.comments && documentId && !hasLoadedRef.current) {
      console.log("📥 Loading comments from GraphQL:", data.comments.length);
      const transformedComments = data.comments.map(transformComment);
      api.setComments(documentId, transformedComments);
      hasLoadedRef.current = true;
    }
  }, [data, documentId, api]);

  // Reset ref when documentId changes
  useEffect(() => {
    hasLoadedRef.current = false;
  }, [documentId]);

  // Request comments via WebSocket for real-time sync
  useEffect(() => {
    if (socket) {
      console.log("📤 Emitting fetch-document-comments:", documentId);
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
      console.log("❌ No socket in CommentsProvider");
      return;
    }

    console.log("✅ Socket exists, ID:", socket.id);
    console.log("✅ Setting up WebSocket listeners...");

    const onComments = (data: any) => {
      console.log("🎯 LISTENER FIRED: document-comments");
      console.log("🎯 Raw data:", data);

      // Transform WebSocket data to match our Comment type
      const transformedComments = (data.comments || []).map(transformComment);
      setState(state => state.set(data.documentId, transformedComments));
    };
    socket.on("document-comments", onComments);

    const onComment = (data: any) => {
      console.log("🎯 LISTENER FIRED: document-comment");
      console.log("🎯 Raw data:", data);

      const transformedComment = transformComment(data.comment);

      setState(state => {
        const comments = state.get(transformedComment.documentId) ?? [];

        if (comments.some(({ id }) => id === transformedComment.id)) {
          console.log("⚠️ Comment already exists");
          return state;
        }

        console.log("✅ Adding new comment");
        return state.set(transformedComment.documentId, [
          ...comments,
          transformedComment,
        ]);
      });
    };
    socket.on("document-comment", onComment);

    const onCommentDeleted = (data: any) => {
      console.log("🎯 LISTENER FIRED: document-comment-deleted");
      console.log("🎯 Raw data:", data);

      setState(state => {
        const comments = state.get(data.documentId) ?? [];
        return state.set(
          data.documentId,
          comments.filter(c => c.id !== data.commentId)
        );
      });
    };
    socket.on("document-comment-deleted", onCommentDeleted);

    console.log("👂 WebSocket listeners registered");

    return () => {
      console.log("🧹 Cleaning up WebSocket listeners");
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
