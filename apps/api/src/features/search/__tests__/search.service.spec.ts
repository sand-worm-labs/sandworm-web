import { SearchCacheService } from '../search-cache.service';
import { SearchRepository, type SearchRow } from '../search.repository';
import { SearchService } from '../search.service';

const row = (type: SearchRow['type'], id: string, total = '1'): SearchRow => ({
  type,
  ref_id: id,
  title: id.toUpperCase(),
  subtitle: null,
  url: `/${type}/${id}`,
  image: null,
  total,
});

function makeService(rows: SearchRow[] = []) {
  const repository = {
    find: jest.fn().mockResolvedValue(rows),
  } as unknown as jest.Mocked<SearchRepository>;
  const service = new SearchService(repository, new SearchCacheService());
  return { service, repository };
}

describe('SearchService', () => {
  it('groups consecutive rows by kind and keeps the total of each', async () => {
    const { service } = makeService([
      row('protocol', 'a', '9'),
      row('protocol', 'b', '9'),
      row('chain', 'c', '1'),
    ]);
    const result = await service.search({ query: 'a' });
    expect(
      result.groups.map((g) => [g.type, g.total, g.items.map((i) => i.id)]),
    ).toEqual([
      ['protocol', 9, ['a', 'b']],
      ['chain', 1, ['c']],
    ]);
    expect(result.groups[0].items[0]).toEqual({
      type: 'protocol',
      id: 'a',
      title: 'A',
      subtitle: null,
      url: '/protocol/a',
      image: null,
    });
  });

  it('searches the normalized text, and reports it back', async () => {
    const { service, repository } = makeService();
    const result = await service.search({ query: '  Pump.Fun ' });
    expect(result.query).toBe('pump fun');
    expect(repository.find).toHaveBeenCalledWith(
      {
        term: 'pump fun',
        tsquery: 'pump:* & fun:*',
        titleTsquery: 'pump:*A & fun:*A',
      },
      { type: undefined, limit: 3, offset: 0 },
    );
  });

  it('shows a few of each kind on the first screen and a page when one kind is asked for', async () => {
    const { service, repository } = makeService();
    await service.search({ query: 'x' });
    await service.search({ query: 'x', type: 'protocol' });
    expect(repository.find.mock.calls[0][1]).toEqual({
      type: undefined,
      limit: 3,
      offset: 0,
    });
    expect(repository.find.mock.calls[1][1]).toEqual({
      type: 'protocol',
      limit: 20,
      offset: 0,
    });
  });

  it('ignores an offset without a kind and caps the page size', async () => {
    const { service, repository } = makeService();
    await service.search({ query: 'x', offset: 40, limit: 500 });
    await service.search({
      query: 'y',
      type: 'notebook',
      offset: 40,
      limit: 500,
    });
    expect(repository.find.mock.calls[0][1]).toEqual({
      type: undefined,
      limit: 50,
      offset: 0,
    });
    expect(repository.find.mock.calls[1][1]).toEqual({
      type: 'notebook',
      limit: 50,
      offset: 40,
    });
  });

  it('answers a repeated query from memory, and treats different spellings of it as one', async () => {
    const { service, repository } = makeService([row('chain', 'solana')]);
    await service.search({ query: 'Sol' });
    await service.search({ query: ' sol ' });
    await service.search({ query: 'SOL!' });
    expect(repository.find).toHaveBeenCalledTimes(1);
    await service.search({ query: 'sol', type: 'chain' });
    expect(repository.find).toHaveBeenCalledTimes(2);
  });

  it('browses when there is no query', async () => {
    const { service, repository } = makeService();
    await service.search({});
    expect(repository.find).toHaveBeenCalledWith(
      { term: '', tsquery: null, titleTsquery: null },
      { type: undefined, limit: 3, offset: 0 },
    );
  });
});
