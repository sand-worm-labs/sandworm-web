jest.mock('../dune/dune-datasource.service', () => ({ DuneDataSourceService: jest.fn() }));

import { ChainSqlService } from '../chain-sql.service';

const service = (dune: boolean, sandwormCloud: boolean, paid = true) =>
  new ChainSqlService(
    { canRunSql: async () => dune } as any,
    { canRunSql: async () => sandwormCloud } as any,
    { isPaid: async () => paid } as any,
  );

describe('ChainSqlService', () => {
  it('is available when either Dune or Sandworm Cloud can run SQL', async () => {
    expect(await service(true, false).status('w1')).toEqual({ available: true, paidPlanRequired: false, sources: { dune: true, sandworm_cloud: false } });
    expect((await service(false, true).status('w1')).available).toBe(true);
  });

  it('is unavailable only when both are down', async () => {
    expect(await service(false, false).status('w1')).toEqual({ available: false, paidPlanRequired: false, sources: { dune: false, sandworm_cloud: false } });
  });

  it('is unavailable to a workspace on the free plan, whatever is up', async () => {
    expect(await service(true, true, false).status('w1')).toEqual({ available: false, paidPlanRequired: true, sources: { dune: false, sandworm_cloud: false } });
  });
});
