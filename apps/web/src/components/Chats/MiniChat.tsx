/* eslint-disable react/jsx-no-useless-fragment */

"use client";

import React, { useCallback } from "react";
import type * as Y from "yjs";
import axios from "axios";
import { toast } from "sonner";

import { NEXT_PUBLIC_API_URL } from "@/utils/env";

import { useMiniChat } from "../Editor/hooks/useMiniChat";

import { MiniChatInput } from "./MiniChatInput";
import type { UploadedFileRef } from "./MiniChatInput";
import { MiniChatHeader } from "./MiniChatHeader";
import { MiniChatMessages } from "./MiniChatMessages";
import { ThreadList } from "./ThreadList";
import type { PendingReviewPart } from "./parts.types";

// =====================================
// ⬢ Props
// =====================================

interface MiniChatProps {
  visible: boolean;
  onClose?: () => void;
  yDoc: Y.Doc;
  workspaceId: string;
  documentId: string;
}

// =====================================
// ⬢ MiniChat
// =====================================

export const MiniChat: React.FC<MiniChatProps> = ({
  visible,
  onClose,
  yDoc,
  workspaceId,
  documentId,
}) => {
  const { state, handlers } = useMiniChat({
    visible,
    workspaceId,
    documentId,
    yDoc,
  });

  // =====================================
  // ⬢ File Upload
  // =====================================

  const handleUploadFile = useCallback(
    async (file: File): Promise<UploadedFileRef> => {
      const response = await axios.post<{ name: string; path: string }>(
        `${NEXT_PUBLIC_API_URL()}/workspaces/${workspaceId}/files?replace=false`,
        file,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/octet-stream",
            "X-File-Name": file.name,
            "X-File-Size": file.size.toString(),
          },
        }
      );

      console.log("[upload] response.data:", response, response.data);

      toast.success(`${file.name} uploaded`, {
        description: "You can find it in your workspace files.",
        duration: 4000,
      });

      console.log(file);

      return {
        name: file.name,
        path: `./data/${file.name}`,
        size: file.size,
      };
    },
    [workspaceId]
  );

  // =====================================
  // ⬢ Pending Review
  // =====================================

  const pendingReview = React.useMemo<PendingReviewPart | undefined>(() => {
    const lastAssistant = [...state.messages].reverse().find(m => !m.isUser);
    if (!lastAssistant?.streamParts) return undefined;
    return lastAssistant.streamParts.find(
      (p): p is PendingReviewPart => p.type === "pending_review"
    );
  }, [state.messages]);

  console.log(pendingReview, "prd", state.messages);

  // =====================================
  // ⬢ Render
  // =====================================

  return (
    <>
      {visible && (
        <div className="relative w-full flex flex-col h-full bg-white dark:bg-base-100 overflow-hidden">
          {state.view === "threads" ? (
            <ThreadList
              workspaceId={workspaceId}
              documentId={documentId}
              onSelectThread={handlers.selectThread}
              onBack={() => handlers.setView("chat")}
            />
          ) : (
            <>
              <MiniChatHeader
                onCancel={onClose}
                onOpenThreads={() => handlers.setView("threads")}
                onNewThread={handlers.newThread}
                activeThreadTitle={state.activeThreadTitle}
              />

              <MiniChatMessages
                messages={state.messages}
                bottomRef={state.bottomRef}
                onSelectPrompt={handlers.sendSafe}
                onVote={handlers.vote}
                onRemoveVote={handlers.removeVote}
                onFollowUpSubmit={() => {}}
              />

              <div className="pb-4 md:px-4">
                <MiniChatInput
                  onSend={handlers.inputSend}
                  onUploadFile={handleUploadFile}
                  disabled={false}
                  isGenerating={state.isLoading}
                  referenceSources={state.referenceSources}
                  pendingReview={pendingReview}
                  onAcceptAll={() => handlers.acceptAll("")}
                  onRejectAll={() => handlers.rejectAll("")}
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
