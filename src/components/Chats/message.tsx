"use client";

import type { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import QueryResultsTable from "../WorkSpace/ResultTab/index";
import { BarChart } from "../WorkSpace/ResultTab/Charts/BarChart";

import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { WormQLPreview } from "./CodePreview";

export const Message = ({
  role,
  content,
  toolInvocations,
  attachments,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  const isUser = role === "user";

  // early return works in this case but might want to make this cleaner
  const renderToolResult = (toolName: string, result: any) => {
    if (toolName === "getWeather") {
      return <Weather weatherAtLocation={result} />;
    }

    if (toolName === "generateWormQL") {
      return <WormQLPreview query={result.query} />;
    }

    if (
      toolName === " runVitalikBalanceChartQuery" &&
      Array.isArray(result?.data)
    ) {
      return (
        <div className="max-w-[900px] max-h-[500px] border rounded-xl border-white/20 bg-zinc-950 p-4 overflow-auto">
          <BarChart
            result={result}
            title={result.title ?? "Chart"}
            xKey={result.xKey}
            yKey={result.yKey}
          />
        </div>
      );
    }

    if (
      result?.columns &&
      result?.data &&
      Array.isArray(result.data) &&
      Array.isArray(result.columns)
    ) {
      return (
        <div className="max-w-[900px] max-h-[300px] border rounded-xl border-white/20 overflow-x-auto">
          <QueryResultsTable
            result={result}
            title="AI Query Result"
            query="Generated via Worm AI Tool"
            viewMode="Table"
          />
        </div>
      );
    }

    return (
      <div className="rounded-md bg-zinc-900 p-4 text-sm font-mono text-white whitespace-pre-wrap">
        {JSON.stringify(result, null, 2)}
      </div>
    );
  };

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
        {/* Message bubble */}
        {content && typeof content === "string" && (
          <div
            className={`rounded-xl px-4 py-2 text-sm whitespace-pre-wrap ${
              isUser ? "bg-[#303030] text-white" : "text-white"
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
                  <div key={toolCallId} className="dark">
                    {renderToolResult(toolName, result)}
                  </div>
                );
              }

              // Show loading skeleton while tool is executing
              return (
                <div
                  key={toolCallId}
                  className="w-full max-w-[900px] h-[120px] rounded-xl overflow-hidden bg-zinc-800 relative animate-pulse min-w-[250px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 opacity-40 animate-[pulse_1.5s_infinite] min-w-[250px]" />
                  <div className="p-4 text-white text-sm font-mono" />
                </div>
              );
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
    </motion.div>
  );
};
