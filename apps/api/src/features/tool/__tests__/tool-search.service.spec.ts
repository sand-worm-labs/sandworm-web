import { of } from 'rxjs';
import { ToolSearchService } from '../tool-search.service';

const AI_CONFIG = { url: 'http://ai.local', handshakeToken: 'token-123' };

const tool = (toolId: string) => ({ toolId }) as any;

function makeService(hits: string[], known: string[]) {
  const configService = { getOrThrow: jest.fn(() => AI_CONFIG) } as any;
  const httpService = { post: jest.fn(() => of({ data: hits.map(tool_id => ({ tool_id })) })) } as any;
  const toolService = { getToolsByIds: jest.fn(async () => known.map(tool)) } as any;
  return { service: new ToolSearchService(configService, httpService, toolService), httpService, toolService };
}

describe('ToolSearchService', () => {
  it('posts the query to the AI service with the handshake token', async () => {
    const { service, httpService } = makeService([], []);
    await service.search('block activity', 5);
    expect(httpService.post).toHaveBeenCalledWith(
      'http://ai.local/select-tool/search',
      { query: 'block activity', top_k: 5 },
      { headers: { 'Content-Type': 'application/json', 'x-handshake-token': 'token-123' } },
    );
  });

  it('returns catalog tools in the order the search ranked them', async () => {
    const { service } = makeService(['b', 'a', 'c'], ['a', 'b', 'c']);
    expect((await service.search('q', 3)).map(t => t.toolId)).toEqual(['b', 'a', 'c']);
  });

  it('skips hits that are no longer in the catalog', async () => {
    const { service } = makeService(['a', 'gone', 'b'], ['a', 'b']);
    expect((await service.search('q', 3)).map(t => t.toolId)).toEqual(['a', 'b']);
  });

  it('keeps the requested limit within bounds', async () => {
    const { service, httpService } = makeService([], []);
    await service.search('q', 500);
    await service.search('q', 0);
    expect(httpService.post.mock.calls.map((c: any[]) => c[1].top_k)).toEqual([15, 1]);
  });
});
