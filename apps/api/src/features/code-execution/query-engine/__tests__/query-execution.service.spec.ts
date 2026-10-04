jest.mock('../duckdb/duckdb-query.service', () => ({ DuckDBQueryService: jest.fn() }));
jest.mock('../trino/trino-query.service', () => ({ TrinoQueryService: jest.fn() }));
jest.mock('../postgres/postgres-query.service', () => ({ PostgresQueryService: jest.fn() }));

import { QueryExecutionService } from '../query-execution.service';

const RAN = [Promise.resolve({ type: 'success' }), async () => {}];

function makeService(paid: boolean) {
  const engine = () => ({ execute: jest.fn().mockResolvedValue(RAN) });
  const duckdb = engine();
  const trino = engine();
  const postgres = engine();
  const service = new QueryExecutionService(duckdb as any, trino as any, postgres as any, { isPaid: async () => paid } as any);
  const run = (datasource: 'duckdb' | 'trino' | 'postgres') =>
    service.makeSQLQuery('w1', 's1', 'q1', 'df', datasource, 'select 1', { pageSize: 50, dashboardPageSize: 0 }, () => {}, null);
  return { run, duckdb, trino, postgres };
}

describe('QueryExecutionService', () => {
  it('fails Dune and Sandworm Cloud queries on the free plan without running them', async () => {
    const { run, trino, postgres } = makeService(false);

    for (const [datasource, name] of [['trino', 'Dune'], ['postgres', 'Sandworm Cloud']] as const) {
      const [result] = await run(datasource);
      expect(await result).toMatchObject({ type: 'python-error', ename: 'PaidPlanRequired' });
      expect((await result as any).evalue).toContain(`${name} needs a paid plan`);
    }
    expect(trino.execute).not.toHaveBeenCalled();
    expect(postgres.execute).not.toHaveBeenCalled();
  });

  it('still runs DuckDB on the free plan', async () => {
    const { run, duckdb } = makeService(false);
    await run('duckdb');
    expect(duckdb.execute).toHaveBeenCalled();
  });

  it('runs Dune and Sandworm Cloud on a paid plan', async () => {
    const { run, trino, postgres } = makeService(true);
    await run('trino');
    await run('postgres');
    expect(trino.execute).toHaveBeenCalled();
    expect(postgres.execute).toHaveBeenCalled();
  });
});
