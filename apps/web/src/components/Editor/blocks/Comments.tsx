import { Transition } from "@headlessui/react";
import type { ChangeEventHandler, FormEvent } from "react";
import { useCallback, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { timeAgo } from "@/lib";
import { Trash } from "@/components/Assets/Trash";
import { CommentIcon } from "@/components/Assets/CommentIcon";
import { PaperPlaneTilt } from "@/components/Assets/PaperPlaneTilt";

import { useComments } from "../hooks/useComments";
import { useSession } from "../hooks/useAuth";

import ScrollBar from "./ScrollBar";

interface Props {
  workspaceId: string;
  documentId: string;
  visible: boolean;
  onHide: () => void;
}
export default function Comments({
  workspaceId,
  documentId,
  visible,
  onHide,
}: Props) {
  const session = useSession({ redirectToLogin: true });
  const [comments, { createComment, deleteComment }] = useComments(documentId);
  const [content, setContent] = useState("");

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [comments.length, visible]);

  const onComment = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      createComment(workspaceId, documentId, content);
      setContent("");
    },
    [createComment, content, documentId]
  );

  const onDeleteComment = useCallback(
    (commentId: string) => {
      deleteComment(workspaceId, documentId, commentId);
    },
    [deleteComment, workspaceId, documentId]
  );

  const onChangeContent: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    e => {
      setContent(e.target.value);
    },
    [setContent]
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

  return (
    <Transition
      show={visible}
      as="div"
      className="h-full overflow-hidden flex-shrink-0 font-body "
      enter="transition-[width] duration-300 ease-in-out"
      enterFrom="w-0"
      enterTo="w-[354px]"
      leave="transition-[width] duration-300 ease-in-out"
      leaveFrom="w-[354px]"
      leaveTo="w-0"
    >
      <ScrollBar
        className="relative w-[354px] flex flex-col overflow-y-auto border-l dark:border-border-tertiary border-border-secondary h-full bg-white dark:bg-base-100  dark:border-t  "
        ref={ref}
      >
        <h3 className="text-lg font-medium leading-6 dark:text-white text-ink-100 px-4 pt-6 xl:px-6">
          Comments
          <span className="ml-3 text-ink-400 ">{comments?.length}</span>
        </h3>
        <p className="text-sm text-ink-400 px-4 mb-4  xl:px-6">
          Make comments to teammates
        </p>
        <button
          type="button"
          className="absolute z-10 top-7 transform rounded-full  text-ink-400 bg-base-100 hover:bg-gray-100 w-6 h-6 flex justify-center items-center right-3 -translate-x-1/2 dark:border-border-tertiary "
          onClick={onHide}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="border-t border-dashed border-border-secondary dark:border-border-tertiary" />

        <ul className="flex-1 space-y-6 pb-6 pt-4 px-2 xl:px-6">
          {comments.map(comment => {
            return (
              <li key={comment.id} className="relative flex gap-x-4">
                <div className="flex-auto rounded-xl p-3 border border-border dark:border-border-tertiary bg-base-500 ">
                  <div className="flex justify-between gap-x-4">
                    <div className="flex gap-x-1 py-0.5 leading-5 text-ink-400">
                      {comment.user.picture ? (
                        <Image
                          src={comment.user.picture}
                          alt=""
                          width={20}
                          height={20}
                          className="relative h-5 w-5 flex-none rounded-full bg-gray-50"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Image
                          src="/img/avatar/avatar2.svg"
                          alt=""
                          width={20}
                          height={20}
                          className="relative h-5 w-5 flex-none rounded-full bg-gray-50"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <span className="text-xs font-medium text-ink-100">
                        {comment.user.name}
                      </span>{" "}
                    </div>
                    <div className="flex items-center gap-x-2">
                      <time
                        dateTime={new Date(comment.createdAt).toISOString()}
                        className="flex-none py-0.5 text-xs leading-5 text-ink-400"
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
                  <p className="text-sm leading-6 text-ink-400 dark:text-ink-100 pt-2">
                    {comment.content}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <form className="sticky bottom-0 " onSubmit={onComment}>
          <div className=" px-2 xl:px-4">
            <div className="py-6 flex gap-x-3">
              <CommentIcon />

              <div className="relative flex-auto">
                <div className="rounded-xl  dark:ring-border-tertiary focus-within:ring-2 dark:bg-base-400  dark:border-border-tertiary border-[#E6E0F1] border-[2px] ring-primary">
                  <label htmlFor="comment" className="sr-only">
                    Add your comment
                  </label>
                  <textarea
                    rows={2}
                    name="comment"
                    id="comment"
                    className="w-full px-3 py-1.5 pt-2 pb-12 rounded-xl dark:bg-base-400  dark:text-white placeholder:dark:text-ink-400  placeholder-[#455768] border-0  focus:outline-none transition text-xs md:text-sm min-h-[4rem] resize-none  "
                    placeholder="Add your comment..."
                    value={content}
                    onKeyDown={onKeyDown}
                    onChange={onChangeContent}
                  />

                  <div className="absolute inset-x-0 bottom-0 flex justify-end py-2 pl-3 pr-2">
                    <button
                      type="submit"
                      className="gap-x-2 rounded-full bg-[#A308F0] p-2.5 text-sm hover:bg-primary-300 "
                    >
                      <PaperPlaneTilt />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </ScrollBar>
    </Transition>
  );
}
