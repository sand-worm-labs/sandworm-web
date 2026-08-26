export type ContentBlock =
  | { type: 'thinking'; thinking: string }
  | { type: 'block_action'; action: 'generating'; block_id: string; block_type: string; block_title: string }
  | { type: 'text'; text: string };

export type ContentDelta =
  | { type: 'thinking_delta'; thinking: string; duration_ms?: number }
  | { type: 'block_action_delta'; action: 'ran'; block_id: string; block_type: string; block_title: string; content?: string }
  | { type: 'text_delta'; text: string };

// The full envelope, as constructed by the AI sidecar
// (apps/ai/src/util/stream_events.py) and relayed verbatim by chat.service.ts.
export type AiStreamEvent =
  | { type: 'message_start'; message: { id: string; chat_id: string } }
  | { type: 'content_block_start'; index: number; content_block: ContentBlock }
  | { type: 'content_block_delta'; index: number; delta: ContentDelta }
  | { type: 'content_block_stop'; index: number }
  | { type: 'message_delta'; delta: { stop_reason?: string; follow_up?: { message: string; questions: unknown[] } } }
  | { type: 'message_stop' }
  | { type: 'error'; error: { type: string; message: string } };
