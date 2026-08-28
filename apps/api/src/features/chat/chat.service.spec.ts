import { ReplaySubject } from 'rxjs';

// TitleAiExecutorService and WorkspaceService transitively drag in the
// Jupyter/code-execution stack and an ESM-only SDK — stub both via an
// explicit factory so jest never loads the real modules.
jest.mock('../ai-execution/service/title-ai-executor.service', () => ({
  TitleAiExecutorService: jest.fn(),
}));
jest.mock('../workspace/service/workspace.service', () => ({
  WorkspaceService: jest.fn(),
}));

import { ChatService, SseEvent } from './chat.service';

function makeService(): ChatService {
  const configService = { getOrThrow: jest.fn(() => 'stub') } as any;
  return new ChatService(
    {} as any, // chatRepository
    {} as any, // messageRepository
    {} as any, // workspaceRepository
    {} as any, // documentRepository
    {} as any, // voteRepository
    configService,
    {} as any, // titleAiExecutorService
    { on: jest.fn(), emit: jest.fn() } as any, // eventEmitter
    {} as any, // httpService
    {} as any, // workspaceService
    {} as any, // redisService
  );
}

const CHAT_ID = 'chat-1';
const JOB_ID = 'job-1';

function attachStream(service: ChatService): ReplaySubject<SseEvent> {
  const subject = new ReplaySubject<SseEvent>(Infinity, 5 * 60 * 1000);
  (service as any).chatStreams.set(CHAT_ID, subject);
  return subject;
}

function invoke(service: ChatService, type: string, payload: Record<string, unknown> = {}): void {
  (service as any).handleAiJobEvent({ chatId: CHAT_ID, jobId: JOB_ID, type, payload });
}

describe('ChatService', () => {
  describe('handleAiJobEvent', () => {
    it('relays a content event verbatim onto the SSE subject', () => {
      const service = makeService();
      const subject = attachStream(service);
      const nextSpy = jest.spyOn(subject, 'next');

      invoke(service, 'content_block_delta', { index: 0, delta: { type: 'text_delta', text: 'hi' } });

      expect(nextSpy).toHaveBeenCalledWith({
        event: 'content_block_delta',
        data: JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'hi' } }),
      });
    });

    it('completes the subject and drops it from chatStreams on message_stop', () => {
      const service = makeService();
      const subject = attachStream(service);
      const nextSpy = jest.spyOn(subject, 'next');
      const completeSpy = jest.spyOn(subject, 'complete');

      invoke(service, 'message_stop');

      expect(nextSpy).toHaveBeenCalledWith({ event: 'message_stop', data: JSON.stringify({ type: 'message_stop' }) });
      expect(completeSpy).toHaveBeenCalledTimes(1);
      expect((service as any).chatStreams.has(CHAT_ID)).toBe(false);
    });

    it('errors the subject and drops it from chatStreams on error', () => {
      const service = makeService();
      const subject = attachStream(service);
      const errorSpy = jest.spyOn(subject, 'error');

      invoke(service, 'error', { error: { type: 'intent_error', message: 'boom' } });

      expect(errorSpy).toHaveBeenCalledWith(new Error('boom'));
      expect((service as any).chatStreams.has(CHAT_ID)).toBe(false);
    });

    it('filters out legacy status pings without touching the subject', () => {
      const service = makeService();
      const subject = attachStream(service);
      const nextSpy = jest.spyOn(subject, 'next');

      invoke(service, 'intent_classified');
      invoke(service, 'intent_parsed');

      expect(nextSpy).not.toHaveBeenCalled();
    });

    it('does nothing when there is no active stream for the chat', () => {
      const service = makeService();

      expect(() => invoke(service, 'message_stop')).not.toThrow();
    });
  });
});
