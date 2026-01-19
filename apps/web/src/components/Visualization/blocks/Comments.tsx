import { Transition } from "@headlessui/react";
import type { ChangeEventHandler, FormEvent } from "react";
import { useCallback, useState, useRef, useEffect } from "react";
import { UserIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import { timeAgo } from "@/lib";

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
  const [comments, { createComment }] = useComments(documentId);
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
      className="top-0 right-0 h-full absolute z-30 font-primary"
      enter="transition ease-in-out duration-300 transform"
      enterFrom="translate-x-full"
      enterTo="translate-x-0"
      leave="transition ease-in-out duration-300 transform"
      leaveFrom="translate-x-0"
      leaveTo="translate-x-full"
    >
      <button
        type="button"
        className="absolute z-10 top-7 transform rounded-full border border-gray-300 dark:border-[#262A30] text-gray-400 bg-white hover:bg-gray-100 w-6 h-6 flex justify-center items-center left-0 -translate-x-1/2"
        onClick={onHide}
      >
        <ChevronDoubleRightIcon className="w-3 h-3" />
      </button>
      <ScrollBar
        className="w-[324px] flex flex-col overflow-y-auto border-l dark:border-[#262A30] border-gray-200 h-full bg-white dark:bg-black "
        ref={ref}
      >
        <h3 className="text-lg font-medium leading-6 dark:text-white text-gray-900 px-4 pt-6 xl:px-6">
          Comments
        </h3>
        <ul className="flex-1 space-y-6 pb-6 pt-4 px-2 xl:px-6">
          {comments.map(comment => {
            return (
              <li key={comment.id} className="relative flex gap-x-4">
                <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                  <div className="flex justify-between gap-x-4">
                    <div className="flex gap-x-1 py-0.5 leading-5 text-gray-500">
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
                        <div className="flex items-center justify-center relative h-5 w-5 flex-none bg-gray-50 rounded-full">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">
                        {comment.user.name}
                      </span>{" "}
                    </div>
                    <time
                      dateTime={new Date(comment.createdAt).toISOString()}
                      className="flex-none py-0.5 text-xs leading-5 text-gray-300"
                    >
                      {timeAgo(new Date(comment.createdAt))}
                    </time>
                  </div>
                  <p className="text-sm leading-6 text-gray-600 pt-2">
                    {comment.content}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <form
          className="sticky bottom-0 bg-white dark:bg-black"
          onSubmit={onComment}
        >
          <div className="border-t dark:border-[#262A30] border-gray-200 px-4 xl:px-6">
            <div className="py-6 flex gap-x-3">
              {session.user?.avater ? (
                <Image
                  src={session.user?.avater}
                  alt=""
                  width={20}
                  height={20}
                  className="h-6 w-6 flex-none rounded-full bg-gray-50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-6 w-6 flex justify-center items-center bg-gray-50 rounded-full">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}

              <div className="relative flex-auto">
                <div className="rounded-lg  dark:ring-[#262A30] focus-within:ring-2 dark:bg-[#1A1A1A] bg-[#F1F3F4] border  dark:border-[#262A30] border-[#DEE2E6] ring-primary">
                  <label htmlFor="comment" className="sr-only">
                    Add your comment
                  </label>
                  <textarea
                    rows={2}
                    name="comment"
                    id="comment"
                    className="w-full px-3 py-1.5 pt-2 pb-12 rounded-lg dark:bg-[#1A1A1A] bg-[#F1F3F4] dark:text-white placeholder:dark:text-ink-300  placeholder-[#455768] focus:outline-none transition text-xs md:text-sm min-h-[7rem] resize-none border-0"
                    placeholder="Add your comment..."
                    value={content}
                    onKeyDown={onKeyDown}
                    onChange={onChangeContent}
                  />

                  <div className="absolute inset-x-0 bottom-0 flex justify-end py-2 pl-3 pr-2">
                    <button
                      type="submit"
                      className="gap-x-2 rounded-md bg-[#A308F0] px-3 py-1 text-sm hover:bg-primary-300 text-white"
                    >
                      Comment
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
