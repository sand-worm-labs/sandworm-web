// Mirrors the Claude-Messages-API-style envelope now constructed by the AI
// sidecar (apps/ai/src/util/stream_events.py) — Node just relays these.
// 'intent_classified' / 'intent_parsed' are legacy status pings the sidecar
// still publishes raw; they're not part of the envelope and stay unhandled here.
export type AiJobEventType =
  | 'message_start'
  | 'content_block_start'
  | 'content_block_delta'
  | 'content_block_stop'
  | 'message_delta'
  | 'message_stop'
  | 'error'
  | 'intent_classified'
  | 'intent_parsed';

export class AiJobEvent {
  chatId: string;
  jobId: string;
  type: AiJobEventType;
  payload: Record<string, unknown>;
}

export const AiJobEventNames = {
  AI_JOB_EVENT: 'ai.job.event',
  AI_BLOCK_READY: 'ai.block.ready',
} as const;
