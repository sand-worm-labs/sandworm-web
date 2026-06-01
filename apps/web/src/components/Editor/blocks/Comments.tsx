/* eslint-disable react/jsx-no-useless-fragment */
import { useCallback, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CloseIconButton } from "@/components/CloseIconButton";
import { PiPaperPlaneRight, PiChatCenteredTextLight } from "react-icons/pi";

import { timeAgo } from "@/lib";
import { Trash } from "@/components/Assets/Trash";
import { CommentIcon } from "@/components/Assets/CommentIcon";

import { useComments } from "../hooks/useComments";
import { useSession } from "../hooks/useAuth";

import ScrollBar from "./ScrollBar";

// =====================================
// ⬢ Types
// =====================================

interface Props {
  workspaceId: string;
  documentId: string;
  visible: boolean;
  onHide: () => void;
}

// =====================================
// ⬢ Main
// =====================================

export default function Comments({
  workspaceId,
  documentId,
  visible,
  onHide,
}: Props) {
  const session = useSession({ redirectToLogin: true });
  const [comments, { createComment, deleteComment }] = useComments(documentId);
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length, visible]);

  const onComment = useCallback(async () => {
    if (!content.trim()) return;
    createComment(workspaceId, documentId, content);
    setContent("");
  }, [createComment, content, documentId, workspaceId]);

  const onDeleteComment = useCallback(
    (commentId: string) => {
      deleteComment(workspaceId, documentId, commentId);
    },
    [deleteComment, workspaceId, documentId]
  );

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> =
    useCallback(
      e => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onComment();
        }
      },
      [onComment]
    );

  if (!visible) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-base-100">
      <div className="flex-shrink-0 px-4 xl:px-6 pt-5 pb-3 dark:border-border-tertiary border-border-secondary border-b">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-x-1.5 text-base font-medium leading-6 dark:text-white text-ink-100">
              <PiChatCenteredTextLight size={18} className="flex-shrink-0" />
              Comments
              <span className="ml-1 text-ink-400 font-normal text-sm">
                {comments?.length}
              </span>
            </h3>
            <p className="text-[12.5px] text-ink-400 mt-0.5">
              Make comments to teammates
            </p>
          </div>
          <CloseIconButton
            size="sm"
            round
            onClick={onHide}
            aria-label="Close comments"
          />
        </div>
      </div>

      <ScrollBar
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-2 xl:px-4"
      >
        <ul className="space-y-3 py-3">
          {comments.map(comment => (
            <li key={comment.id}>
              <div className="rounded-xl p-3 border border-border dark:border-border-tertiary bg-transparent">
                <div className="flex justify-between items-center gap-x-4 mb-2">
                  <div className="flex items-center gap-x-2">
                    <Image
                      src={comment.user.picture ?? "/img/avatar/avatar2.svg"}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 flex-none rounded-full bg-gray-50"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-sm font-medium text-ink-100">
                      {comment.user.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <time
                      dateTime={new Date(comment.createdAt).toISOString()}
                      className="text-xs leading-5 text-ink-400"
                    >
                      {timeAgo(new Date(comment.createdAt))}
                    </time>
                    {session?.user?.id === comment.userId && (
                      <button
                        type="button"
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-ink-400 hover:text-red-600 transition-colors"
                        aria-label="Delete comment"
                      >
                        <Trash />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[13px] leading-5 text-[#6C757D] dark:text-ink-100">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </ScrollBar>

      <div className="flex-shrink-0 px-3 xl:px-4 py-3  dark:border-border-tertiary">
        <div className="flex items-center gap-x-2">
          <div className="flex-shrink-0">
            <CommentIcon />
          </div>

          <div className="flex flex-1 items-center rounded-xl border-[1.5px] border-[#E6E0F1] dark:border-border-tertiary bg-white dark:bg-base-400 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-shadow px-3 py-1.5 gap-x-2">
            <label htmlFor="comment" className="sr-only">
              Add your comment
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={1}
              className="flex-1 bg-transparent dark:text-white placeholder:text-[#9CA3AF] placeholder:dark:text-ink-400 border-0 focus:outline-none text-sm leading-5 resize-none"
              placeholder="Add a comment..."
              value={content}
              onKeyDown={onKeyDown}
              onChange={e => setContent(e.target.value)}
            />
            <button
              type="button"
              onClick={onComment}
              disabled={!content.trim()}
              className="flex-shrink-0 rounded-lg bg-[#A308F0] p-2 text-white hover:bg-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-[#7104A8]"
              aria-label="Send comment"
            >
              <PiPaperPlaneRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
