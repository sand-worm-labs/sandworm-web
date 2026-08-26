"use client";

import { useCallback, useRef } from "react";

import { NEXT_PUBLIC_API_URL } from "../../../utils/env";
import type { PartPayload, FollowUpQuestion } from "../../Chats/parts.types";

// =====================================
// ⬢ Types
// =====================================

interface StreamCallbacks {
  onToken: (chunk: string) => void;
  onComplete: () => void;
  onError: (err: Error) => void;
}

interface StartStreamParams extends StreamCallbacks {
  chatId: string;
  messageId: string;
  onPart?: (part: PartPayload) => void;
}

type UseChatStream = {
  startStream: (params: StartStreamParams) => Promise<void>;
  stopStream: () => void;
  isStreaming: boolean;
};

// Wire shapes emitted by the backend — mirrors the Claude Messages API
// streaming envelope (message_start / content_block_* / message_delta / message_stop).
interface ContentBlock {
  type: "thinking" | "block_action" | "text";
  block_id?: string;
  block_type?: string;
  block_title?: string;
}

interface ContentDelta {
  type: "thinking_delta" | "block_action_delta" | "text_delta";
  thinking?: string;
  duration_ms?: number;
  text?: string;
  block_id?: string;
  block_type?: string;
  block_title?: string;
}

type AiStreamEvent =
  | { type: "message_start" }
  | { type: "content_block_start"; index: number; content_block: ContentBlock }
  | { type: "content_block_delta"; index: number; delta: ContentDelta }
  | { type: "content_block_stop"; index: number }
  | {
      type: "message_delta";
      delta: { stop_reason?: string; follow_up?: { message: string; questions: FollowUpQuestion[] } };
    }
  | { type: "message_stop" }
  | { type: "error"; error: { type: string; message: string } };

// =====================================
// ⬢ Utils
// =====================================

function handleStreamEvent(
  streamEvent: AiStreamEvent,
  onToken: (chunk: string) => void,
  onPart?: (part: PartPayload) => void
): Error | null {
  switch (streamEvent.type) {
    case "content_block_start":
      if (streamEvent.content_block.type === "block_action") {
        onPart?.({
          type: "block_action",
          action: "generating",
          blockId: streamEvent.content_block.block_id ?? "",
          blockType: streamEvent.content_block.block_type ?? "",
          blockTitle: streamEvent.content_block.block_title ?? "",
        });
      }
      return null;

    case "content_block_delta":
      switch (streamEvent.delta.type) {
        case "thinking_delta":
          onPart?.({
            type: "thinking",
            thinking: streamEvent.delta.thinking ?? "",
            duration_ms: streamEvent.delta.duration_ms ?? 0,
          });
          break;
        case "block_action_delta":
          onPart?.({
            type: "block_action",
            action: "ran",
            blockId: streamEvent.delta.block_id ?? "",
            blockType: streamEvent.delta.block_type ?? "",
            blockTitle: streamEvent.delta.block_title ?? "",
          });
          break;
        case "text_delta":
          onToken(streamEvent.delta.text ?? "");
          break;
      }
      return null;

    case "message_delta":
      if (streamEvent.delta.follow_up) {
        onPart?.({
          type: "follow_up",
          message: streamEvent.delta.follow_up.message,
          questions: streamEvent.delta.follow_up.questions,
        });
      }
      return null;

    case "error":
      return new Error(streamEvent.error.message);

    case "message_start":
    case "content_block_stop":
    case "message_stop":
      return null;
  }
}

function processLines(
  lines: string[],
  currentEvent: string,
  onToken: (chunk: string) => void,
  onPart?: (part: PartPayload) => void
): { event: string; done: boolean; error: Error | null } {
  let event = currentEvent;
  let done = false;
  let error: Error | null = null;

  lines.forEach(line => {
    if (done) return;

    if (line.startsWith("event: ")) {
      event = line.slice(7).trim();
      return;
    }

    if (!line.startsWith("data: ")) return;

    // ⬢ CRITICAL — no trim here. Backend sends "data: word " with trailing
    // space as word separator. trimEnd only for sentinel comparison.
    const data = line.slice(6);
    const trimmed = data.trimEnd();

    if (trimmed === "[DONE]") {
      done = true;
      return;
    }
    if (trimmed === "[ERROR]") {
      done = true;
      return;
    }
    if (!trimmed) return;

    if (event === "token") {
      onToken(data);
    } else {
      try {
        const streamEvent = JSON.parse(trimmed) as AiStreamEvent;
        const streamError = handleStreamEvent(streamEvent, onToken, onPart);
        if (streamError) error = streamError;
      } catch {
        /* skip */
      }
    }
  });

  return { event, done, error };
}

// =====================================
// ⬢ useChatStream
// =====================================

export function useChatStream(): UseChatStream {
  const abortControllerRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    isStreamingRef.current = false;
  }, []);

  const startStream = useCallback(
    async ({
      chatId,
      messageId,
      onToken,
      onPart,
      onComplete,
      onError,
    }: StartStreamParams) => {
      stopStream();

      const controller = new AbortController();
      abortControllerRef.current = controller;
      isStreamingRef.current = true;

      try {
        const response = await fetch(
          `${NEXT_PUBLIC_API_URL()}/chat/${chatId}/${messageId}/stream`,
          {
            method: "POST",
            signal: controller.signal,
            credentials: "include",
            headers: {
              Accept: "text/event-stream",
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response.ok)
          throw new Error(
            `Stream failed: ${response.status} ${response.statusText}`
          );
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = "message_start";
        let isDone = false;
        let streamError: Error | null = null;

        const pump = async (): Promise<void> => {
          if (isDone) return;
          const { done, value } = await reader.read();
          if (done) return;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const raw = buffer.split("\n");
          buffer = raw.pop() ?? "";

          const result = processLines(raw, currentEvent, onToken, onPart);
          currentEvent = result.event;
          if (result.error) streamError = result.error;

          if (result.done) {
            isDone = true;
            reader.cancel();
            isStreamingRef.current = false;
            if (streamError) onError(streamError);
            else onComplete();
            return;
          }

          return pump();
        };

        await pump();
        if (!isDone) {
          isStreamingRef.current = false;
          if (streamError) onError(streamError);
          else onComplete();
        }
      } catch (err) {
        isStreamingRef.current = false;
        if (err instanceof Error && err.name === "AbortError") return;
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [stopStream]
  );

  return { startStream, stopStream, isStreaming: isStreamingRef.current };
}
