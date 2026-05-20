/* eslint-disable react/jsx-no-useless-fragment */

"use client";

import React from "react";
import type * as Y from "yjs";

import { useMiniChat } from "../Editor/hooks/useMiniChat";

import { MiniChatInput } from "./MiniChatInput";
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

  const pendingReview = React.useMemo<PendingReviewPart | undefined>(() => {
    const lastAssistant = [...state.messages].reverse().find(m => !m.isUser);
    if (!lastAssistant?.streamParts) return undefined;
    return lastAssistant.streamParts.find(
      (p): p is PendingReviewPart => p.type === "pending_review"
    );
  }, [state.messages]);

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
              />

              <div className="pb-4 md:px-4">
                <MiniChatInput
                  onSend={handlers.inputSend}
                  disabled={state.isLoading}
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
