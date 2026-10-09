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
