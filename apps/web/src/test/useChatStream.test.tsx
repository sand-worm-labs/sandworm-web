import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useChatStream } from "@/components/Editor/hooks/useChatStream";
import type { PartPayload } from "@/components/Chats/parts.types";

vi.mock("@/utils/env", () => ({
  NEXT_PUBLIC_API_URL: () => "http://api.test",
}));

function sseStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

function mockFetchWith(text: string) {
  (global.fetch as any) = vi.fn().mockResolvedValue({
    ok: true,
    body: sseStream(text),
  });
}

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${typeof data === "string" ? data : JSON.stringify(data)}\n\n`;
}

async function runStream(text: string) {
  mockFetchWith(text);
  const { result } = renderHook(() => useChatStream());

  const onToken = vi.fn();
  const onPart = vi.fn();
  const onComplete = vi.fn();
  const onError = vi.fn();

  await result.current.startStream({
    chatId: "chat-1",
    messageId: "msg-1",
    onToken,
    onPart,
    onComplete,
    onError,
  });

  return { onToken, onPart, onComplete, onError };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useChatStream", () => {
  it("turns a thinking block into a single onPart call", async () => {
    const text =
      sse("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "" } }) +
      sse("content_block_delta", {
        type: "content_block_delta",
        index: 0,
        delta: { type: "thinking_delta", thinking: "Planning 2 blocks", duration_ms: 120 },
      }) +
      sse("content_block_stop", { type: "content_block_stop", index: 0 }) +
      "data: [DONE]\n\n";

    const { onPart, onComplete, onError } = await runStream(text);

    expect(onPart).toHaveBeenCalledWith({ type: "thinking", thinking: "Planning 2 blocks", duration_ms: 120 } satisfies PartPayload);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("turns block_action start/delta into generating then ran onPart calls", async () => {
    const text =
      sse("content_block_start", {
        type: "content_block_start",
        index: 0,
        content_block: { type: "block_action", action: "generating", block_id: "b1", block_type: "sql", block_title: "Top holders" },
      }) +
      sse("content_block_delta", {
        type: "content_block_delta",
        index: 0,
        delta: { type: "block_action_delta", action: "ran", block_id: "b1", block_type: "sql", block_title: "Top holders" },
      }) +
      sse("content_block_stop", { type: "content_block_stop", index: 0 }) +
      "data: [DONE]\n\n";

    const { onPart } = await runStream(text);

    expect(onPart).toHaveBeenNthCalledWith(1, {
      type: "block_action",
      action: "generating",
      blockId: "b1",
      blockType: "sql",
      blockTitle: "Top holders",
    });
    expect(onPart).toHaveBeenNthCalledWith(2, {
      type: "block_action",
      action: "ran",
      blockId: "b1",
      blockType: "sql",
      blockTitle: "Top holders",
    });
  });

  it("streams text_delta chunks through onToken in order", async () => {
    const text =
      sse("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }) +
      sse("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Hel" } }) +
      sse("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "lo" } }) +
      sse("content_block_stop", { type: "content_block_stop", index: 0 }) +
      "data: [DONE]\n\n";

    const { onToken } = await runStream(text);

    expect(onToken.mock.calls.map(c => c[0])).toEqual(["Hel", "lo"]);
  });

  it("surfaces follow_up carried on message_delta", async () => {
    const questions = [{ id: "q1", text: "Which chain?", inputType: "text" as const }];
    const text =
      sse("message_delta", {
        type: "message_delta",
        delta: { follow_up: { message: "Need more info", questions } },
      }) + "data: [DONE]\n\n";

    const { onPart } = await runStream(text);

    expect(onPart).toHaveBeenCalledWith({ type: "follow_up", message: "Need more info", questions });
  });

  it("calls onError (not onComplete) when the server sends a structured error event", async () => {
    const text =
      sse("error", { type: "error", error: { type: "intent_error", message: "Intent parsing failed" } }) +
      "data: [ERROR]\n\n";

    const { onComplete, onError } = await runStream(text);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe("Intent parsing failed");
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("calls onComplete on a plain [DONE] with no error", async () => {
    const text = "data: [DONE]\n\n";

    const { onComplete, onError } = await runStream(text);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });
});
