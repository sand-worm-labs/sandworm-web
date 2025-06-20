"use client";

import type { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  const isUser = role === "user";

  return (
    <motion.div
      className={`flex w-full md:max-w-3xl px-4  pt-12 md:px-0 gap-4 mb-6  ${
        isUser ? "justify-end" : "justify-start"
      }`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {/*   {!isUser && (
        <div className="size-6 border rounded-sm p-1 flex justify-center items-center shrink-0 text-zinc-500">
          <BotIcon />
        </div>
      )}
 */}
      <div
        className={`flex flex-col gap-2 max-w-[80%] ${
          isUser ? "items-end text-right" : "items-start text-left"
        }`}
      >
        {/* Message bubble */}
        {content && typeof content === "string" && (
          <div
            className={`rounded-xl px-4 py-2 text-sm whitespace-pre-wrap ${
              isUser ? "bg-[#303030] text-white" : " text-white"
            }`}
          >
            <Markdown>{content}</Markdown>
          </div>
        )}

        {/* Tool results */}
        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map(toolInvocation => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {toolName === "getWeather" ? (
                      <Weather weatherAtLocation={result} />
                    ) : (
                      <div>{JSON.stringify(result, null, 2)}</div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? <Weather /> : null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Attachments */}
        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map(attachment => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>

      {/* User icon */}
      {/*     {isUser && (
        <div className="size-6 border rounded-sm p-1 flex justify-center items-center shrink-0 text-zinc-500">
          <UserIcon />
        </div>
      )} */}
    </motion.div>
  );
};
