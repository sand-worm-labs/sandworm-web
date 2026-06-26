export type AiJobEventType =
  | 'started'
  | 'intent_classified'
  | 'intent_parsed'
  | 'follow_up'
  | 'fetching_notebook_context'
  | 'context_fetched'
  | 'plan_ready'
  | 'generating_block'
  | 'block_ready'
  | 'generating_response'
  | 'completed'
  | 'error'
  | 'intent_error';

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
