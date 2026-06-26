"use client";

import { useCallback, useRef } from "react";

import { NEXT_PUBLIC_API_URL } from "../../../utils/env";
import type { PartPayload } from "../../Chats/parts.types";

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

// =====================================
// ⬢ Utils
// =====================================

function processLines(
  lines: string[],
  currentEvent: string,
  onToken: (chunk: string) => void,
  onPart?: (part: PartPayload) => void
): { event: string; done: boolean } {
  let event = currentEvent;
  let done = false;

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

    if (event === "part") {
      try {
        onPart?.(JSON.parse(trimmed) as PartPayload);
      } catch {
        /* skip */
      }
    } else {
      onToken(data);
    }

    event = "token";
  });

  return { event, done };
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
        let currentEvent = "token";
        let isDone = false;

        const pump = async (): Promise<void> => {
          if (isDone) return;
          const { done, value } = await reader.read();
          if (done) return;

          const chunk = decoder.decode(value, { stream: true });
          console.log("[useChatStream] raw stuffs:", chunk);
          buffer += chunk;
          const raw = buffer.split("\n");
          buffer = raw.pop() ?? "";

          const { event, done: streamDone } = processLines(
            raw,
            currentEvent,
            onToken,
            onPart
          );
          currentEvent = event;

          if (streamDone) {
            isDone = true;
            reader.cancel();
            isStreamingRef.current = false;
            onComplete();
            return;
          }

          return pump();
        };

        await pump();
        if (!isDone) {
          isStreamingRef.current = false;
          onComplete();
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
