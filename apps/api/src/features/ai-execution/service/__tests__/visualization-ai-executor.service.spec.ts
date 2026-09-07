// YjsDocumentService transitively drags in DocumentExecutorService ->
// the visualization block executor -> an ESM-only dependency; stub it via
// an explicit factory so jest never loads the real module chain.
jest.mock('@/features/collaboration/yjs/yjs-document.service', () => ({
  YjsDocumentService: jest.fn(),
}));

import { VisualizationAiExecutorService } from '../visualization-ai-executor.service';
import { BaseAiExecutorService } from '../base-ai-executor.service';

function makeService() {
  const yjsDocumentService = {} as any;
  const persistorFactory = {} as any;
  const eventEmitter = {} as any;
  const service = new VisualizationAiExecutorService(yjsDocumentService, persistorFactory, eventEmitter);
  return { service, yjsDocumentService, persistorFactory, eventEmitter };
}

describe('VisualizationAiExecutorService', () => {
  it('constructs, extends BaseAiExecutorService, and threads deps through to the base', () => {
    const { service, yjsDocumentService, persistorFactory, eventEmitter } = makeService();

    expect(service).toBeInstanceOf(BaseAiExecutorService);
    expect((service as any).yjsDocumentService).toBe(yjsDocumentService);
    expect((service as any).persistorFactory).toBe(persistorFactory);
    expect((service as any).eventEmitter).toBe(eventEmitter);
  });
});
