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

import { NEXT_PUBLIC_API_URL } from "../utils/env";

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
  ) => void;
  deleteComment: (
    workspaceI: string,
    documentId: string,
    commentId: string
  ) => void;
};

type State = Map<string, Comment[]>;

const Context = createContext<[State, API]>([
  Map(),
  {
    createComment: () => {
      throw new Error(
        "Attempted to call createComment without CommentsProvider"
      );
    },
    deleteComment: () => {
      throw new Error(
        "Attempted to call deleteComment without CommentsProvider"
      );
    },
  },
]);

type UseComments = [Comment[], API];

export function useComments(documentId: string): UseComments {
  const [state, api] = useContext(Context);
  const socket = useWebsocket();

  useEffect(() => {
    socket?.emit("fetch-document-comments", { documentId });
  }, [socket, documentId]);

  return useMemo(
    (): UseComments => [state.get(documentId) ?? [], api],
    [state, api, documentId]
  );
}

interface Props {
  children: React.ReactNode;
}

export function CommentsProvider({ children }: Props) {
  const [state, setState] = useState<State>(Map());
  const socket = useWebsocket();
  const session = useSession({ redirectToLogin: false });

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
      socket.off("document-comment-created", onComment);
      socket.off("document-comment-deleted", onCommentDeleted);
    };
  }, [socket]);

  const createComment = useCallback(
    async (workspaceId: string, documentId: string, content: string) => {
      const user = session.data;
      if (!user) return;

      const now = new Date().toISOString();
      const comment: Comment = {
        user: { name: user.name, picture: user.picture },
        id: uuidv4(),
        content,
        documentId,
        userId: user.id,
        createdAt: now,
        updatedAt: now,
      };

      setState(prev => {
        const comments = prev.get(documentId) ?? [];
        return prev.set(documentId, [...comments, comment]);
      });

      const res = await fetch(
        `${NEXT_PUBLIC_API_URL()}/v1/workspaces/${workspaceId}/documents/${documentId}/comments`,
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(comment),
        }
      );

      if (!res.ok) {
        alert("Failed to create comment");
        setState(prev => {
          const comments = prev.get(documentId) ?? [];
          return prev.set(
            documentId,
            comments.filter(c => c.id !== comment.id)
          );
        });
      }
    },
    [session]
  );

  const deleteComment = useCallback(
    async (workspaceId: string, documentId: string, commentId: string) => {
      const existing = state.get(documentId)?.find(c => c.id === commentId);
      if (!existing) return;

      setState(prev => {
        const comments = prev.get(documentId) ?? [];
        return prev.set(
          documentId,
          comments.filter(c => c.id !== commentId)
        );
      });

      const res = await fetch(
        `${NEXT_PUBLIC_API_URL()}/v1/workspaces/${workspaceId}/documents/${documentId}/comments/${commentId}`,
        { credentials: "include", method: "DELETE" }
      );

      if (!res.ok) {
        alert("Failed to delete comment");
        setState(prev => {
          const comments = prev.get(documentId) ?? [];
          return prev.set(documentId, [...comments, existing]);
        });
      }
    },
    [state]
  );

  const value = useMemo(
    () => [state, { createComment, deleteComment }] as [State, API],
    [state, createComment, deleteComment]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
