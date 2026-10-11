// Runs the real search SQL against a real Postgres, so relevance cannot quietly regress.
// Off by default (CI has no database). Turn it on by giving it a database that has the
// add-search-index migration:
//
//   SEARCH_INTEGRATION=postgres://postgres:postgres@localhost:25432/sandworm \
//     pnpm --filter api test -- search.integration
//
// It works inside one transaction that always rolls back: it empties search_entry for itself,
// seeds a small set that looks like real data, and leaves the table as it found it.
import { DataSource, QueryRunner } from 'typeorm';
import { SearchCacheService } from '../search-cache.service';
import { SearchRepository } from '../search.repository';
import { SearchService } from '../search.service';
import type { SearchEntryType } from '../search.types';

const databaseUrl = process.env.SEARCH_INTEGRATION;
const run = databaseUrl ? describe : describe.skip;

type Seed = [
  SearchEntryType,
  string,
  string,
  string | null,
  string | null,
  number,
];
// type, ref_id, title, subtitle, keywords, popularity
const SEED: Seed[] = [
  ['protocol', 'uniswap', 'Uniswap', 'DEXes', 'uni', 6],
  ['protocol', 'pump-fun', 'pump.fun', 'Launchpads', 'pumpfun pump', 3],
  ['protocol', 'aave', 'Aave', 'Lending', 'lending', 5],
  ['protocol', 'solayer', 'Solayer', 'Restaking', null, 1],
  ['chain', 'solana', 'Solana', 'Chain', 'sol', 9],
  ['chain', 'arbitrum', 'Arbitrum', 'Chain', 'arb', 7],
  ['chain', 'ethereum', 'Ethereum', 'Chain', 'eth ether mainnet', 8],
  ['category', 'dex', 'DEXes', 'Trading', 'uniswap curve', 6],
  ['category', 'lending', 'Lending', 'Yield', 'aave morpho', 5],
  [
    'notebook',
    'n1',
    'Uniswap (sample case study)',
    'Sandworm',
    'uniswap dex',
    1,
  ],
  ['notebook', 'n2', 'Wallet X-Ray', 'ceeriil', null, 2],
  [
    'notebook',
    'n3',
    'Just PAJ It: How Nigeria Cashes Out on Solana',
    'ceeriil',
    'paj',
    4,
  ],
  ['notebook', 'n4', 'Zürich Gas Study', 'ada', null, 0],
  [
    'dashboard',
    'n3',
    'Just PAJ It: How Nigeria Cashes Out on Solana',
    'ceeriil',
    'dashboard paj',
    4,
  ],
  ['creator', 'u1', 'Ada Lovelace', '@ada', 'ada', 3],
  [
    'bounty',
    'b1',
    'Uniswap V3: How Do Liquidity Providers Really Do?',
    'Uniswap · 5,000 USDC',
    'bounty bounties dex',
    3,
  ],
];

run('search against Postgres', () => {
  let dataSource: DataSource;
  let runner: QueryRunner;
  let search: SearchService;
  let repository: SearchRepository;

  beforeAll(async () => {
    dataSource = await new DataSource({
      type: 'postgres',
      url: databaseUrl,
    }).initialize();
  });

  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    await runner.query('DELETE FROM search_entry');
    for (const [type, id, title, subtitle, keywords, popularity] of SEED) {
      await runner.query(
        `INSERT INTO search_entry (type, ref_id, title, subtitle, url, keywords, popularity)
         VALUES ($1, $2, $3, $4, '/x/' || $2, $5, $6)`,
        [type, id, title, subtitle, keywords, popularity],
      );
    }
    // The service goes through the repository; point the repository at this transaction.
    repository = new SearchRepository(dataSource);
    const find = repository.find.bind(repository);
    repository.find = (query, options) => find(query, options, runner.manager);
    search = new SearchService(repository, new SearchCacheService());
  });

  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  const titles = async (
    query: string,
    type?: SearchEntryType,
    extra: { limit?: number; offset?: number } = {},
  ) => {
    const result = await search.search({ query, type, ...extra });
    return Object.fromEntries(
      result.groups.map((group) => [
        group.type,
        group.items.map((item) => item.title),
      ]),
    );
  };

  it('finds a protocol by its name, and everything else that mentions it', async () => {
    const found = await titles('uniswap');
    expect(found.protocol?.[0]).toBe('Uniswap');
    expect(found.category).toEqual(['DEXes']);
    expect(found.notebook).toEqual(['Uniswap (sample case study)']);
    expect(found.bounty?.[0]).toMatch(/^Uniswap V3/);
  });

  it('finds it from a nickname, a prefix and a typo', async () => {
    expect((await titles('uni')).protocol?.[0]).toBe('Uniswap');
    expect((await titles('un')).protocol?.[0]).toBe('Uniswap');
    expect((await titles('uniswp')).protocol).toEqual(['Uniswap']);
    expect((await titles('pumpfun')).protocol).toEqual(['pump.fun']);
    expect((await titles('arb')).chain).toEqual(['Arbitrum']);
  });

  it('ranks the chain itself first, then what merely starts the same way', async () => {
    const found = await titles('sol');
    expect(found.chain).toEqual(['Solana']);
    expect(found.protocol).toEqual(['Solayer']);
    expect(found.notebook).toEqual([
      'Just PAJ It: How Nigeria Cashes Out on Solana',
    ]);
  });

  it('matches every word of a longer query, as a word prefix', async () => {
    expect((await titles('nigeria cashes')).notebook).toHaveLength(1);
    expect((await titles('wallet x')).notebook).toEqual(['Wallet X-Ray']);
    expect((await titles('x ray')).notebook).toEqual(['Wallet X-Ray']);
    expect(await titles('nigeria banana')).toEqual({});
  });

  it('ignores accents and punctuation', async () => {
    expect((await titles('zurich')).notebook).toEqual(['Zürich Gas Study']);
    expect((await titles('pump.fun')).protocol).toEqual(['pump.fun']);
  });

  it('finds a creator by name or handle, and a bounty by the word "bounty"', async () => {
    expect((await titles('ada')).creator).toEqual(['Ada Lovelace']);
    expect(await titles('bounties')).toEqual({
      bounty: [expect.stringMatching(/^Uniswap V3/)],
    });
  });

  it('lists a notebook and its dashboard as separate results', async () => {
    const found = await titles('nigeria');
    expect(found.notebook).toHaveLength(1);
    expect(found.dashboard).toHaveLength(1);
  });

  it('returns a page of one kind, with the total of that kind', async () => {
    const first = await search.search({
      query: '',
      type: 'chain',
      limit: 1,
      offset: 0,
    });
    const second = await search.search({
      query: '',
      type: 'chain',
      limit: 1,
      offset: 1,
    });
    expect(first.groups).toHaveLength(1);
    expect(first.groups[0].total).toBe(3);
    // Popularity orders a browse list: Solana (9), Ethereum (8), Arbitrum (7).
    expect(first.groups[0].items.map((i) => i.title)).toEqual(['Solana']);
    expect(second.groups[0].items.map((i) => i.title)).toEqual(['Ethereum']);
  });

  it('browses every kind, in the same order each time, when there is no query', async () => {
    const result = await search.search({});
    expect(result.groups.map((group) => group.type)).toEqual([
      'protocol',
      'chain',
      'category',
      'notebook',
      'dashboard',
      'creator',
      'bounty',
    ]);
  });

  it('returns nothing, and does not fail, for text that matches nothing or tries to break the query', async () => {
    expect(await titles('zzzzzz')).toEqual({});
    expect(await titles(`'; DROP TABLE search_entry; --`)).toEqual({});
    expect(await titles(`a:* | !b & (c) <-> d`)).toEqual({});
    const stillThere = await runner.query(
      'SELECT count(*)::int AS n FROM search_entry',
    );
    expect(stillThere[0].n).toBe(SEED.length);
  });
});
