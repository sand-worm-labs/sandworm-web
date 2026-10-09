import { ReplaySubject } from 'rxjs';

// TitleAiExecutorService and WorkspaceService transitively drag in the
// Jupyter/code-execution stack and an ESM-only SDK — stub both via an
// explicit factory so jest never loads the real modules.
jest.mock('../../ai-execution/service/title-ai-executor.service', () => ({
  TitleAiExecutorService: jest.fn(),
}));
jest.mock('../../workspace/service/workspace.service', () => ({
  WorkspaceService: jest.fn(),
}));

jest.mock('@/infrastructure/datasource/chain-sql.service', () => ({
  ChainSqlService: jest.fn(),
}));

import { ChatService, SseEvent } from '../chat.service';

function makeService(): ChatService {
  const configService = { getOrThrow: jest.fn(() => 'stub') } as any;
  return new ChatService(
    {} as any, // chatRepository
    { update: jest.fn().mockResolvedValue(undefined) } as any, // messageRepository
    {} as any, // workspaceRepository
    {} as any, // documentRepository
    {} as any, // voteRepository
    configService,
    {} as any, // titleAiExecutorService
    { on: jest.fn(), emit: jest.fn() } as any, // eventEmitter
    {} as any, // httpService
    {} as any, // workspaceService
    {} as any, // redisService
    {} as any, // chainSqlService
    {} as any, // authService
  );
}

const CHAT_ID = 'chat-1';
const JOB_ID = 'job-1';
const MESSAGE_ID = 'message-1';

// Opens the turn for one user message, as sending it does.
function attachStream(service: ChatService, jobId = JOB_ID, messageId = MESSAGE_ID): ReplaySubject<SseEvent> {
  (service as any).openTurn(jobId, CHAT_ID, messageId);
  return (service as any).turns.get(jobId).stream;
}

function invoke(service: ChatService, type: string, payload: Record<string, unknown> = {}, jobId = JOB_ID): void {
  (service as any).handleAiJobEvent({ chatId: CHAT_ID, jobId, type, payload });
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

    it('completes the stream and closes the turn on message_stop', () => {
      const service = makeService();
      const subject = attachStream(service);
      const nextSpy = jest.spyOn(subject, 'next');
      const completeSpy = jest.spyOn(subject, 'complete');

      invoke(service, 'message_stop');

      expect(nextSpy).toHaveBeenCalledWith({ event: 'message_stop', data: JSON.stringify({ type: 'message_stop' }) });
      expect(completeSpy).toHaveBeenCalledTimes(1);
      expect((service as any).turns.has(JOB_ID)).toBe(false);
    });

    it('errors the stream and closes the turn on error', () => {
      const service = makeService();
      const subject = attachStream(service);
      const errorSpy = jest.spyOn(subject, 'error');

      invoke(service, 'error', { error: { type: 'intent_error', message: 'boom' } });

      expect(errorSpy).toHaveBeenCalledWith(new Error('boom'));
      expect((service as any).turns.has(JOB_ID)).toBe(false);
    });

    it('filters out legacy status pings without touching the subject', () => {
      const service = makeService();
      const subject = attachStream(service);
      const nextSpy = jest.spyOn(subject, 'next');

      invoke(service, 'intent_classified');
      invoke(service, 'intent_parsed');

      expect(nextSpy).not.toHaveBeenCalled();
    });

    it('does nothing when there is no turn for the job', () => {
      const service = makeService();

      expect(() => invoke(service, 'message_stop')).not.toThrow();
    });

    it('keeps two messages in one chat apart: each stream gets only its own job', () => {
      const service = makeService();
      const first = jest.spyOn(attachStream(service, 'job-a', 'message-a'), 'next');
      const second = attachStream(service, 'job-b', 'message-b');
      const secondNext = jest.spyOn(second, 'next');
      const secondComplete = jest.spyOn(second, 'complete');

      // The first job is still writing, and then finishes, after the second message was sent.
      invoke(service, 'content_block_delta', { index: 0, delta: { type: 'text_delta', text: 'late' } }, 'job-a');
      invoke(service, 'message_stop', {}, 'job-a');

      expect(first).toHaveBeenCalledTimes(2);
      expect(secondNext).not.toHaveBeenCalled();
      expect(secondComplete).not.toHaveBeenCalled();
      expect((service as any).turns.has('job-b')).toBe(true);
    });
  });

  describe('streamResponse', () => {
    const delta = (text: string) => ({ index: 0, delta: { type: 'text_delta', text } });

    function listening(service: ChatService, { isAnswered = false } = {}) {
      (service as any).chatRepository = { findOne: jest.fn().mockResolvedValue({ id: CHAT_ID }) };
      (service as any).messageRepository.findOne = jest.fn().mockResolvedValue({ id: MESSAGE_ID, isAnswered });
    }

    const collect = async (service: ChatService, after?: number) => {
      const events: SseEvent[] = [];
      let completed = false;
      service.streamResponse('user-1', CHAT_ID, MESSAGE_ID, after).subscribe({
        next: event => events.push(event),
        complete: () => { completed = true; },
      });
      await new Promise(resolve => setImmediate(resolve));
      const texts = () => events.filter(e => e.event !== 'turn').map(e => JSON.parse(e.data).delta?.text);
      return { texts, events, completed: () => completed };
    };

    it('says the job is running before any of its output', async () => {
      const service = makeService();
      listening(service);
      attachStream(service);

      const { events, completed } = await collect(service);

      expect(events).toEqual([{ event: 'turn', data: 'running' }]);
      expect(completed()).toBe(false);
    });

    it('gives a client that connects late the whole answer so far', async () => {
      const service = makeService();
      listening(service);
      attachStream(service);
      invoke(service, 'content_block_delta', delta('one'));
      invoke(service, 'content_block_delta', delta('two'));

      const { texts } = await collect(service);

      expect(texts()).toEqual(['one', 'two']);
    });

    it('sends a reconnecting client only what it does not have yet', async () => {
      const service = makeService();
      listening(service);
      attachStream(service);
      invoke(service, 'content_block_delta', delta('one'));
      invoke(service, 'content_block_delta', delta('two'));

      const { texts } = await collect(service, 1);
      invoke(service, 'content_block_delta', delta('three'));

      expect(texts()).toEqual(['two', 'three']);
    });

    it('ends at once, without saying running, when no job is answering', async () => {
      const service = makeService();
      listening(service);

      const { events, completed } = await collect(service);

      expect(events).toEqual([]);
      expect(completed()).toBe(true);
    });
  });

  describe('after a restart', () => {
    const QUESTION_AT = new Date('2026-01-01T00:00:00.000Z');

    function restarted({ answerAt = new Date(QUESTION_AT.getTime() + 1), isAnswered = false } = {}) {
      const service = makeService();
      (service as any).messageRepository.findOne = jest.fn(async ({ where }: any) =>
        where.jobId
          ? { id: 'answer-1', createdAt: answerAt }
          : { id: MESSAGE_ID, createdAt: QUESTION_AT, isAnswered },
      );
      return service;
    }

    const arrive = (service: ChatService, type: string) =>
      (service as any).handleAiJobEvent({ chatId: CHAT_ID, jobId: JOB_ID, type, payload: {} });

    it('opens the turn of a job that is still running again, and relays to it', async () => {
      const service = restarted();

      await arrive(service, 'message_start');

      expect((service as any).jobOfMessage.get(MESSAGE_ID)).toBe(JOB_ID);
      const seen: SseEvent[] = [];
      (service as any).turns.get(JOB_ID).stream.subscribe((e: SseEvent) => seen.push(e));
      expect(seen.map(e => e.event)).toEqual(['message_start']);
    });

    it('leaves a message that was already answered alone', async () => {
      const service = restarted({ isAnswered: true });

      await arrive(service, 'message_start');

      expect((service as any).turns.has(JOB_ID)).toBe(false);
    });

    it('does not attach a job that is not the answer to a chat message', async () => {
      const service = restarted({ answerAt: new Date(QUESTION_AT.getTime() + 60_000) });

      await arrive(service, 'message_start');

      expect((service as any).turns.has(JOB_ID)).toBe(false);
    });

    it('does not reopen a turn that was stopped', async () => {
      const service = restarted();
      attachStream(service);
      (service as any).closeTurn(JOB_ID);

      await arrive(service, 'content_block_stop');

      expect((service as any).turns.has(JOB_ID)).toBe(false);
    });
  });

  describe('abort', () => {
    it('stops only the message being answered, by its job', async () => {
      const service = makeService();
      const redis = { set: jest.fn().mockResolvedValue(undefined) };
      (service as any).redisService = redis;
      (service as any).chatRepository = { findOne: jest.fn().mockResolvedValue({ id: CHAT_ID }) };
      attachStream(service, 'job-a', 'message-a');
      const latest = jest.spyOn(attachStream(service, 'job-b', 'message-b'), 'complete');

      await service.abort(CHAT_ID, 'user-1');

      expect(redis.set).toHaveBeenCalledWith('cancel_job:job-b', '1', expect.any(Number));
      expect(latest).toHaveBeenCalledTimes(1);
      expect((service as any).turns.has('job-a')).toBe(true);
    });
  });
});
