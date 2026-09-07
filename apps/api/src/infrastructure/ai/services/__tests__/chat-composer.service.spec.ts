import { EventEmitter } from 'events';
import { of, throwError } from 'rxjs';
import { ChatComposerService } from '../chat-composer.service';
import { FinishReason, MessageContentType, MessageRole } from '@/features/chat/types/message.types';

const AI_CONFIG = { url: 'http://ai.local', handshakeToken: 'token-123' };

function makeService() {
  const configService = { getOrThrow: jest.fn(() => AI_CONFIG) } as any;
  const httpService = { post: jest.fn() } as any;
  const service = new ChatComposerService(configService, httpService);
  return { service, configService, httpService };
}

function collect<T>(obs: { subscribe: (cbs: { next: (v: T) => void; error: (e: unknown) => void; complete: () => void }) => void }) {
  const events: T[] = [];
  let error: unknown;
  let completed = false;
  obs.subscribe({
    next: (v) => events.push(v),
    error: (e) => (error = e),
    complete: () => (completed = true),
  });
  return { events, getError: () => error, isCompleted: () => completed };
}

describe('ChatComposerService', () => {
  describe('generateTitle', () => {
    it('posts to /generate-title and returns the title', async () => {
      const { service, httpService } = makeService();
      httpService.post.mockReturnValue(of({ data: { title: 'A Title' } }));

      const result = await service.generateTitle({
        message: 'hi',
        openrouter_api_key: 'sk-abc',
        context: { user_id: 'u1', workspace_id: 'w1', document_id: 'd1' },
      });

      expect(httpService.post).toHaveBeenCalledWith(
        'http://ai.local/generate-title',
        {
          message: 'hi',
          openrouter_api_key: 'sk-abc',
          context: { user_id: 'u1', workspace_id: 'w1', document_id: 'd1' },
        },
        { headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token-123' } },
      );
      expect(result).toBe('A Title');
    });

    it('propagates an error when the HTTP call fails', async () => {
      const { service, httpService } = makeService();
      httpService.post.mockReturnValue(throwError(() => new Error('network down')));

      await expect(
        service.generateTitle({
          message: 'hi',
          openrouter_api_key: 'sk-abc',
          context: { user_id: 'u1', workspace_id: 'w1', document_id: 'd1' },
        }),
      ).rejects.toThrow('network down');
    });
  });

  describe('buildContentParts', () => {
    it('wraps plain string content as a text part', () => {
      const { service } = makeService();

      expect(service.buildContentParts('hello')).toEqual([{ type: MessageContentType.TEXT, text: 'hello' }]);
    });

    it('omits an empty/whitespace string as no parts', () => {
      const { service } = makeService();

      expect(service.buildContentParts('   ')).toEqual([]);
    });

    it('passes through already-structured content parts unchanged', () => {
      const { service } = makeService();
      const parts = [{ type: MessageContentType.TEXT, text: 'existing' }] as any;

      expect(service.buildContentParts(parts)).toEqual(parts);
    });

    it('appends serialized attachments after the content', () => {
      const { service } = makeService();

      const result = service.buildContentParts('hello', [{ type: 'image', url: 'http://img.png' } as any]);

      expect(result).toEqual([
        { type: MessageContentType.TEXT, text: 'hello' },
        { type: MessageContentType.IMAGE_URL, image_url: { url: 'http://img.png', detail: 'auto' } },
      ]);
    });
  });

  describe('serializeAttachments', () => {
    it('serializes an image attachment as an image_url part', () => {
      const { service } = makeService();

      expect(service.serializeAttachments([{ type: 'image', url: 'http://img.png' } as any])).toEqual([
        { type: MessageContentType.IMAGE_URL, image_url: { url: 'http://img.png', detail: 'auto' } },
      ]);
    });

    it('serializes a PDF file attachment as a document part', () => {
      const { service } = makeService();

      expect(
        service.serializeAttachments([
          { type: 'file', url: 'http://doc.pdf', mimeType: 'application/pdf' } as any,
        ]),
      ).toEqual([
        { type: MessageContentType.DOCUMENT, source: { type: 'url', media_type: 'application/pdf', url: 'http://doc.pdf' } },
      ]);
    });

    it('falls back to a text label for other file attachments', () => {
      const { service } = makeService();

      expect(
        service.serializeAttachments([
          { type: 'file', url: 'http://f.csv', mimeType: 'text/csv', name: 'data.csv' } as any,
        ]),
      ).toEqual([{ type: MessageContentType.TEXT, text: '[Attached file: data.csv (text/csv)]' }]);
    });
  });

  describe('streamCompletion', () => {
    const REQUEST = {
      messages: [{ role: MessageRole.USER, content: 'hi' }],
      model: 'gpt-5',
      openrouter_api_key: 'sk-abc',
      context: { user_id: 'u1', workspace_id: 'w1', document_id: 'd1', chat_id: 'c1' },
    };

    it('parses token and part SSE lines, then emits done and completes on [DONE]', async () => {
      const { service, httpService } = makeService();
      const stream = new EventEmitter();
      httpService.post.mockReturnValue(of({ data: stream }));

      const result = collect(service.streamCompletion(REQUEST));
      await new Promise((resolve) => setImmediate(resolve));

      stream.emit('data', Buffer.from('data: {"event":"token","data":{"token":"Hel"}}\n'));
      stream.emit('data', Buffer.from('data: {"event":"token","data":{"token":"lo"}}\n'));
      stream.emit(
        'data',
        Buffer.from('data: {"event":"part","data":{"type":"thinking","thinking":"...","duration_ms":10}}\n'),
      );
      stream.emit('data', Buffer.from('data: [DONE]\n'));

      // allow the async executeStream microtask chain to run
      await new Promise((resolve) => setImmediate(resolve));

      expect(result.events).toEqual([
        { event: 'token', data: { token: 'Hel' } },
        { event: 'token', data: { token: 'lo' } },
        { event: 'part', data: { type: 'thinking', thinking: '...', duration_ms: 10 } },
        { event: 'done', data: { content: 'Hello', finish_reason: FinishReason.STOP } },
      ]);
      expect(result.isCompleted()).toBe(true);
    });

    it('emits an explicit done event from the stream and completes without a synthetic done', async () => {
      const { service, httpService } = makeService();
      const stream = new EventEmitter();
      httpService.post.mockReturnValue(of({ data: stream }));

      const result = collect(service.streamCompletion(REQUEST));
      await new Promise((resolve) => setImmediate(resolve));

      stream.emit(
        'data',
        Buffer.from('data: {"event":"done","data":{"content":"final","finish_reason":"stop"}}\n'),
      );

      await new Promise((resolve) => setImmediate(resolve));

      expect(result.events).toEqual([{ event: 'done', data: { content: 'final', finish_reason: 'stop' } }]);
      expect(result.isCompleted()).toBe(true);
    });

    it('emits a synthetic done on stream end if not already completed', async () => {
      const { service, httpService } = makeService();
      const stream = new EventEmitter();
      httpService.post.mockReturnValue(of({ data: stream }));

      const result = collect(service.streamCompletion(REQUEST));
      await new Promise((resolve) => setImmediate(resolve));

      stream.emit('data', Buffer.from('data: {"event":"token","data":{"token":"Hi"}}\n'));
      stream.emit('end');

      await new Promise((resolve) => setImmediate(resolve));

      expect(result.events).toEqual([
        { event: 'token', data: { token: 'Hi' } },
        { event: 'done', data: { content: 'Hi', finish_reason: FinishReason.STOP } },
      ]);
      expect(result.isCompleted()).toBe(true);
    });

    it('errors the observable when the stream emits an error', async () => {
      const { service, httpService } = makeService();
      const stream = new EventEmitter();
      httpService.post.mockReturnValue(of({ data: stream }));

      const result = collect(service.streamCompletion(REQUEST));
      await new Promise((resolve) => setImmediate(resolve));

      const err = new Error('stream broke');
      stream.emit('error', err);

      await new Promise((resolve) => setImmediate(resolve));

      expect(result.getError()).toBe(err);
    });

    it('errors the observable when the initial HTTP call fails', async () => {
      const { service, httpService } = makeService();
      httpService.post.mockReturnValue(throwError(() => new Error('connect refused')));

      const result = collect(service.streamCompletion(REQUEST));

      await new Promise((resolve) => setImmediate(resolve));

      expect((result.getError() as Error).message).toBe('connect refused');
    });
  });
});
