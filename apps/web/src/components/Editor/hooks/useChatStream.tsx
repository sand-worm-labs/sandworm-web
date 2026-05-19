"use client";

import { useCallback, useRef } from "react";

import { NEXT_PUBLIC_API_URL } from "../../../utils/env";

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
}

type UseChatStream = {
  startStream: (params: StartStreamParams) => Promise<void>;
  stopStream: () => void;
  isStreaming: boolean;
};

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
      onComplete,
      onError,
    }: StartStreamParams) => {
      // ─── Abort any existing stream ──────────────────────
      stopStream();

      const controller = new AbortController();
      abortControllerRef.current = controller;
      isStreamingRef.current = true;

      try {
        console.log(chatId, messageId);
        const response = await fetch(
          `${NEXT_PUBLIC_API_URL()}/chat/${chatId}/${messageId}/stream`,
          {
            method: "POST",
            signal: controller.signal,
            credentials: "include", // sends cookies for auth
            headers: {
              Accept: "text/event-stream",
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Stream failed: ${response.status} ${response.statusText}`
          );
        }

        if (!response.body) {
          throw new Error("No response body");
        }
        console.log("res", response.body);
        // ─── Read the SSE stream ─────────────────────────
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // ─── Parse SSE lines ──────────────────────────
          // SSE format: "data: <content>\n\n"
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // keep incomplete last line

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const token = line.slice(6); // strip "data: "
              if (token) onToken(token);
            }
            // ignore comment lines (": ...") and event lines ("event: ...")
          }
        }

        // ─── Flush any remaining buffer ──────────────────
        if (buffer.startsWith("data: ")) {
          const token = buffer.slice(6);
          if (token) onToken(token);
        }

        isStreamingRef.current = false;
        onComplete();
      } catch (err) {
        isStreamingRef.current = false;

        // ─── Ignore intentional aborts ───────────────────
        if (err instanceof Error && err.name === "AbortError") return;

        onError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [stopStream]
  );

  return {
    startStream,
    stopStream,
    isStreaming: isStreamingRef.current,
  };
}
