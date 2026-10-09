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
  // How many of the answer's events are already on screen, when picking up
  // an answer that was loaded half-written. The stream carries on from there.
  after?: number;
  // The server confirmed a job is still answering this message.
  onRunning?: () => void;
}

type UseChatStream = {
  startStream: (params: StartStreamParams) => Promise<void>;
  stopStream: () => void;
  abortChat: (chatId: string) => Promise<void>;
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
  action?: "created" | "edited" | "ran" | "deleted";
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
      delta: {
        stop_reason?: string;
        follow_up?: { message: string; questions: FollowUpQuestion[] };
      };
    }
  | { type: "message_stop" }
  | { type: "error"; error: { type: string; message: string } };

// The saved events that also travel on the stream. The rest are status pings
// the server keeps to itself, so they don't count towards a stream position.
export function countStreamEvents(rawEvents: unknown[]): number {
  return rawEvents.filter(raw => {
    const type = (raw as { type?: string } | null)?.type;
    return !!type && type !== "intent_classified" && type !== "intent_parsed";
  }).length;
}

// A dropped connection is retried this many times in a row before giving up.
// Any event that arrives starts the count again.
const MAX_RECONNECTS = 8;

function reconnectDelay(failures: number): number {
  return Math.min(1000 * 2 ** (failures - 1), 10_000);
}

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
            action: streamEvent.delta.action ?? "ran",
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

// Reconstructs a message's display text + parts from its persisted raw
// envelope events (MessageEntity.parts) — used when loading a historical
// thread, so a follow-up/thinking/block-action message renders the same way
// it did live instead of falling back to raw internal JSON. The stored
// events also include a few event types outside AiStreamEvent (e.g.
// intent_classified) — handleStreamEvent's switch simply ignores those.
export function deriveMessageDisplay(rawEvents: unknown[]): {
  text: string;
  parts: PartPayload[];
} {
  let text = "";
  const parts: PartPayload[] = [];

  for (const raw of rawEvents) {
    if (!raw || typeof raw !== "object" || !("type" in raw)) continue;
    handleStreamEvent(
      raw as AiStreamEvent,
      chunk => {
        text += chunk;
      },
      part => {
        parts.push(part);
      }
    );
  }

  return { text, parts };
}

function processLines(
  lines: string[],
  currentEvent: string,
  onToken: (chunk: string) => void,
  onPart?: (part: PartPayload) => void,
  onRunning?: () => void
): { event: string; done: boolean; error: Error | null; received: number } {
  let event = currentEvent;
  let done = false;
  let error: Error | null = null;
  // Events of the answer taken in, which is where a reconnect carries on from.
  let received = 0;

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

    // Not part of the answer: the server saying a job is running.
    if (event === "turn") {
      onRunning?.();
      return;
    }

    received += 1;

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

  return { event, done, error, received };
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
      after = 0,
      onToken,
      onPart,
      onRunning,
      onComplete,
      onError,
    }: StartStreamParams) => {
      stopStream();

      const controller = new AbortController();
      abortControllerRef.current = controller;
      isStreamingRef.current = true;

      // Where the answer stands: every event taken in so far. A connection
      // that drops is opened again from here, so the answer carries on with
      // nothing missing and nothing repeated.
      let position = after;
      let failures = 0;

      const finish = (error: Error | null) => {
        isStreamingRef.current = false;
        if (error) onError(error);
        else onComplete();
      };

      // Reads one connection to its end. Resolves to true once the server
      // said the answer is over, false when the connection just went away.
      const read = async (): Promise<boolean> => {
        const response = await fetch(
          `${NEXT_PUBLIC_API_URL()}/chat/${chatId}/${messageId}/stream?after=${position}`,
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

        // The server is restarting or unreachable behind its proxy: try again.
        if (response.status >= 500) return false;
        if (!response.ok) {
          finish(
            new Error(
              `Stream failed: ${response.status} ${response.statusText}`
            )
          );
          return true;
        }
        if (!response.body) return false;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = "message_start";
        let streamError: Error | null = null;

        const pump = async (): Promise<boolean> => {
          const { done, value } = await reader.read();
          if (done) return false;

          buffer += decoder.decode(value, { stream: true });
          const raw = buffer.split("\n");
          buffer = raw.pop() ?? "";

          const result = processLines(
            raw,
            currentEvent,
            onToken,
            onPart,
            onRunning
          );
          currentEvent = result.event;
          if (result.error) streamError = result.error;
          if (result.received > 0) {
            position += result.received;
            failures = 0;
          }

          if (result.done) {
            reader.cancel();
            finish(streamError);
            return true;
          }

          return pump();
        };

        return pump();
      };

      const run = async (): Promise<void> => {
        let over = false;
        try {
          over = await read();
        } catch (err) {
          if (controller.signal.aborted) return;
          if (err instanceof Error && err.name === "AbortError") return;
        }
        if (over || controller.signal.aborted) return;

        failures += 1;
        if (failures > MAX_RECONNECTS) {
          finish(
            new Error(
              "Lost the connection to the server. Reopen this thread to see the rest of the answer."
            )
          );
          return;
        }

        await new Promise(resolve => {
          setTimeout(resolve, reconnectDelay(failures));
        });
        if (controller.signal.aborted) return;
        await run();
      };

      await run();
    },
    [stopStream]
  );

  // Stops the local stream read immediately (for responsive UI) and tells
  // the backend to cancel the whole in-flight pipeline — not just this
  // connection. Without the server-side call, the sidecar and Node's
  // per-block auto-fix loops keep running (and keep mutating the notebook)
  // even after the frontend stops watching.
  const abortChat = useCallback(
    async (chatId: string) => {
      stopStream();
      try {
        await fetch(`${NEXT_PUBLIC_API_URL()}/chat/${chatId}/abort`, {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("[useChatStream] failed to abort chat:", err);
      }
    },
    [stopStream]
  );

  return {
    startStream,
    stopStream,
    abortChat,
    isStreaming: isStreamingRef.current,
  };
}
