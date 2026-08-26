// ChatService (a constructor param type here) transitively drags in the
// Jupyter/code-execution stack and a couple of ESM-only packages — stub the
// two entry points via an explicit factory so jest never loads the real modules.
jest.mock('@/features/ai-execution/service/title-ai-executor.service', () => ({
  TitleAiExecutorService: jest.fn(),
}));
jest.mock('@/features/workspace/service/workspace.service', () => ({
  WorkspaceService: jest.fn(),
}));

import { AiJobListenerService } from './ai-job-listener.service';
import { AiJobEventNames } from '@/core/events/ai-job.events';
import { BlockActionEventNames } from '@/core/events/block-action.events';

function makeService() {
  const eventEmitter = { emit: jest.fn() } as any;
  const service = new AiJobListenerService({} as any, {} as any, eventEmitter);
  return { service, eventEmitter };
}

const JOB_ID = 'job-1';
const CHAT_ID = 'chat-1';

describe('AiJobListenerService', () => {
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

    it('emits BLOCK_ACTION when a content_block_delta carries a ran block_action_delta', () => {
      const { service, eventEmitter } = makeService();

      (service as any).emitJobEvent(JOB_ID, {
        chat_id: CHAT_ID,
        type: 'content_block_delta',
        index: 2,
        delta: {
          type: 'block_action_delta',
          action: 'ran',
          block_id: 'block-1',
          block_type: 'sql',
          block_title: 'Top holders',
          content: 'SELECT 1',
        },
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(BlockActionEventNames.BLOCK_ACTION, {
        action: 'created',
        blockId: 'block-1',
        blockType: 'sql',
        blockTitle: 'Top holders',
        content: 'SELECT 1',
        chatId: CHAT_ID,
      });
    });

    it('does not emit BLOCK_ACTION for a text_delta content_block_delta', () => {
      const { service, eventEmitter } = makeService();

      (service as any).emitJobEvent(JOB_ID, {
        chat_id: CHAT_ID,
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text_delta', text: 'hi' },
      });

      expect(eventEmitter.emit).not.toHaveBeenCalledWith(BlockActionEventNames.BLOCK_ACTION, expect.anything());
    });

    it('does not emit BLOCK_ACTION for a "generating" block_action content_block_start', () => {
      const { service, eventEmitter } = makeService();

      (service as any).emitJobEvent(JOB_ID, {
        chat_id: CHAT_ID,
        type: 'content_block_start',
        index: 1,
        content_block: {
          type: 'block_action',
          action: 'generating',
          block_id: 'block-1',
          block_type: 'sql',
          block_title: 'Top holders',
        },
      });

      expect(eventEmitter.emit).not.toHaveBeenCalledWith(BlockActionEventNames.BLOCK_ACTION, expect.anything());
    });
  });
});
