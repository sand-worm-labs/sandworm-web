import * as Y from 'yjs';
import { PubSubProviderFactory } from '../pubsub-provider.factory';
import { PubSubProvider } from '../pubsub.provider';

function makeFactory() {
  const pubSubService = { publish: jest.fn(), subscribe: jest.fn() } as any;
  const payloadRepository = { save: jest.fn(), findOne: jest.fn() } as any;
  const factory = new PubSubProviderFactory(pubSubService, payloadRepository);
  return { factory, pubSubService, payloadRepository };
}

describe('PubSubProviderFactory', () => {
  describe('create', () => {
    it('builds a PubSubProvider wired to the given id/ydoc/clock and shared dependencies', () => {
      const { factory } = makeFactory();
      const ydoc = new Y.Doc();
      const onNewerClock = jest.fn();

      const provider = factory.create('doc-1', ydoc, 3, onNewerClock);

      expect(provider).toBeInstanceOf(PubSubProvider);
      expect((provider as any).id).toBe('doc-1');
      expect((provider as any).ydoc).toBe(ydoc);
      expect((provider as any).clock).toBe(3);
      expect((provider as any).onNewerClock).toBe(onNewerClock);
    });
  });
});
