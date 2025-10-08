"use client";

import type { Attachment } from "ai";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";

export const Message = ({
  role,
  content,
  attachments,
}: {
  role: string;
  content: string | ReactNode;
  attachments?: Array<Attachment>;
}) => {
  const isUser = role === "user";

  console.log("🟢 [FRONTEND] Message:", { role, content, attachments });

  return (
    <motion.div
      className={`flex w-full md:max-w-3xl px-4 pt-12 md:px-0 gap-4 mb-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div
        className={`flex flex-col gap-2 max-w-[80%] ${
          isUser ? "items-end text-right" : "items-start text-left"
        }`}
      >
        {content && typeof content === "string" && (
          <div
            className={`rounded-xl px-4 py-2 text-sm whitespace-pre-wrap ${
              isUser ? "bg-[#303030] text-white" : "text-white"
            }`}
          >
            <Markdown>{content}</Markdown>
          </div>
        )}

        {/* Attachments */}
        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
