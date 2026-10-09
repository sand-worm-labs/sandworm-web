// ChatService (a constructor param type here) transitively drags in the
// Jupyter/code-execution stack and a couple of ESM-only packages — stub the
// two entry points via an explicit factory so jest never loads the real modules.
jest.mock('@/features/ai-execution/service/title-ai-executor.service', () => ({
  TitleAiExecutorService: jest.fn(),
}));
jest.mock('@/features/workspace/service/workspace.service', () => ({
  WorkspaceService: jest.fn(),
}));

import { AiJobListenerService } from '../ai-job-listener.service';
import { AiJobEventNames } from '@/core/events/ai-job.events';

function makeService() {
  const eventEmitter = { emit: jest.fn() } as any;
  const service = new AiJobListenerService({} as any, {} as any, eventEmitter);
  return { service, eventEmitter };
}

const JOB_ID = 'job-1';
const CHAT_ID = 'chat-1';
const VALID_CHAT_ID = '3f2b6c1e-8a4d-4c7b-9e21-5d6f7a8b9c0d';

function makeListening() {
  const order: string[] = [];
  const saved: unknown[][] = [];
  const eventEmitter = { emit: jest.fn(() => order.push('streamed')) } as any;
  // What the AI service has pushed onto the job's list so far.
  const list: string[] = [];
  const redisService = {
    del: jest.fn(),
    lrange: jest.fn(async (_key: string, start: number) => list.slice(start)),
  } as any;
  const push = (event: object) => list.push(JSON.stringify({ chat_id: VALID_CHAT_ID, ...event }));
  const chatService = {
    chatExists: jest.fn().mockResolvedValue(true),
    saveMessageByJobId: jest.fn(async (_chatId: string, _jobId: string, parts: unknown[]) => {
      order.push('saved');
      saved.push([...parts]);
    }),
  } as any;
  const service = new AiJobListenerService(redisService, chatService, eventEmitter);
  const receive = (event: object) =>
    (service as any).handleJobEvent(`ai:job:${JOB_ID}`, JSON.stringify({ chat_id: VALID_CHAT_ID, ...event }));
  const wake = () => (service as any).readNewEvents(JOB_ID);
  return { receive, push, wake, order, saved, chatService, redisService, eventEmitter };
}

describe('AiJobListenerService', () => {
  describe('saving an answer', () => {
    it('saves each event before it is streamed, with everything so far', async () => {
      const { receive, order, saved } = makeListening();

      await receive({ type: 'message_start' });
      await receive({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hi' } });

      expect(order).toEqual(['saved', 'streamed', 'saved', 'streamed']);
      expect(saved.map(parts => parts.length)).toEqual([1, 2]);
    });

    it('keeps what was saved when the answer never finishes', async () => {
      const { receive, chatService, redisService } = makeListening();

      await receive({ type: 'message_start' });
      await receive({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'Half an ans' } });
      // the AI service dies here: no message_stop ever arrives

      expect(chatService.saveMessageByJobId).toHaveBeenLastCalledWith(
        VALID_CHAT_ID,
        JOB_ID,
        expect.arrayContaining([expect.objectContaining({ delta: { type: 'text_delta', text: 'Half an ans' } })]),
      );
      expect(redisService.del).not.toHaveBeenCalled();
    });

    it('still streams an event it could not save', async () => {
      const { receive, chatService, eventEmitter } = makeListening();
      chatService.saveMessageByJobId.mockRejectedValueOnce(new Error('db down'));

      await receive({ type: 'message_start' });

      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('reads each event once, however many times it is told there is news', async () => {
      const { push, wake, saved, eventEmitter } = makeListening();

      push({ type: 'message_start' });
      push({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hi' } });
      // a reconnect and a live message both point at the same two events
      await wake();
      await wake();
      push({ type: 'content_block_delta', delta: { type: 'text_delta', text: ' there' } });
      await wake();

      expect(eventEmitter.emit).toHaveBeenCalledTimes(3);
      expect(saved.at(-1)).toHaveLength(3);
    });

    it('clears the job from Redis once it has finished', async () => {
      const { receive, redisService } = makeListening();

      await receive({ type: 'message_start' });
      await receive({ type: 'message_stop' });

      expect(redisService.del).toHaveBeenCalledWith(`ai:job:${JOB_ID}:events`);
    });
  });

  describe('emitJobEvent', () => {
    it('always emits the raw event as AI_JOB_EVENT', () => {
      const { service, eventEmitter } = makeService();

      (service as any).emitJobEvent(JOB_ID, { chat_id: CHAT_ID, type: 'message_start' });

      expect(eventEmitter.emit).toHaveBeenCalledWith(AiJobEventNames.AI_JOB_EVENT, {
        chatId: CHAT_ID,
        jobId: JOB_ID,
        type: 'message_start',
        payload: {},
      });
    });

    it('relays a cell card to the chat stream and does nothing else with it', () => {
      const { service, eventEmitter } = makeService();
      const card = {
        chat_id: CHAT_ID,
        type: 'content_block_delta',
        index: 2,
        delta: {
          type: 'block_action_delta',
          action: 'created',
          block_id: 'block-1',
          block_type: 'sql',
          block_title: 'Top holders',
          content: 'SELECT 1',
        },
      };

      (service as any).emitJobEvent(JOB_ID, card);

      // The cell already exists: the MCP server created it. Acting on the card
      // would insert a second copy of it into the notebook.
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(AiJobEventNames.AI_JOB_EVENT, expect.objectContaining({ chatId: CHAT_ID, type: 'content_block_delta' }));
    });
  });
});
