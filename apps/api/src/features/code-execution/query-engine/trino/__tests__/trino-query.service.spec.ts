import { TrinoQueryService } from '../trino-query.service';

const CONFIG = { host: 'trino.example.com', port: 443, catalog: 'dune', schema: null, user: 'u', password: 'pw', httpScheme: 'https' };

const json = (body: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => body, text: async () => JSON.stringify(body) }) as any;

function makeService() {
  const configService = { getOrThrow: jest.fn(() => CONFIG) } as any;
  return new TrinoQueryService({} as any, {} as any, configService);
}

describe('TrinoQueryService.executeQuery', () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    (global as any).fetch = fetchMock;
  });

  it('posts the SQL, follows nextUri, and collects columns and rows from every page', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ nextUri: 'https://trino.example.com/v1/statement/q/1' }))
      .mockResolvedValueOnce(json({ columns: [{ name: 'a', type: 'bigint' }], data: [[1]], nextUri: 'https://trino.example.com/v1/statement/q/2' }))
      .mockResolvedValueOnce(json({ data: [[2]] }));

    const result = await makeService().executeQuery('SELECT a FROM t');

    expect(result).toEqual({ columns: ['a'], rows: [[1], [2]] });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://trino.example.com:443/v1/statement');
    expect(init.body).toBe('SELECT a FROM t');
    expect(init.headers['X-Trino-User']).toBe('u');
    expect(init.headers['X-Trino-Catalog']).toBe('dune');
    expect(init.headers.Authorization).toBe(`Basic ${Buffer.from('u:pw').toString('base64')}`);
  });

  it('hex-encodes varbinary columns', async () => {
    fetchMock.mockResolvedValueOnce(
      json({ columns: [{ name: 'h', type: 'varbinary' }], data: [[Buffer.from([0xde, 0xad]).toString('base64')]] }),
    );

    const result = await makeService().executeQuery('SELECT h FROM t');

    expect(result.rows).toEqual([['0xdead']]);
  });

  it('throws the Trino error message', async () => {
    fetchMock.mockResolvedValueOnce(json({ error: { message: 'line 1:1: bad' } }));

    await expect(makeService().executeQuery('oops')).rejects.toThrow('[Trino] line 1:1: bad');
  });
});
