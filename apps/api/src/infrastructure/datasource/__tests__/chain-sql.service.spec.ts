jest.mock('../dune/dune-datasource.service', () => ({ DuneDataSourceService: jest.fn() }));

import { ChainSqlService } from '../chain-sql.service';

const service = (dune: boolean, sandwormCloud: boolean) =>
  new ChainSqlService(
    { canRunSql: async () => dune } as any,
    { canRunSql: async () => sandwormCloud } as any,
  );

describe('ChainSqlService', () => {
  it('is available when either Dune or Sandworm Cloud can run SQL', async () => {
    expect(await service(true, false).status()).toEqual({ available: true, sources: { dune: true, sandworm_cloud: false } });
    expect((await service(false, true).status()).available).toBe(true);
  });

  it('is unavailable only when both are down', async () => {
    expect(await service(false, false).status()).toEqual({ available: false, sources: { dune: false, sandworm_cloud: false } });
  });
});
