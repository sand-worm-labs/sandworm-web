import { ForbiddenException } from '@nestjs/common';
import { PostgresQueryService } from '../postgres-query.service';

function makeService(env: Record<string, string> = { SANDWORM_CLOUD_DB_HOST: 'db.example.com', SANDWORM_CLOUD_DB_PASSWORD: 'p@ss/word' }) {
  const pythonExecutor = { renderJinja: jest.fn(async (_c: unknown, sql: string) => sql) } as any;
  const queryRunner = { runQuery: jest.fn(async () => [Promise.resolve({ type: 'success' }), async () => { }]) } as any;
  const configService = { get: (k: string) => env[k] } as any;
  return { service: new PostgresQueryService(pythonExecutor, queryRunner, configService), pythonExecutor, queryRunner };
}

describe('PostgresQueryService', () => {
  describe('buildConnectionUrl', () => {
    it('builds an SSL psycopg2 URL with defaults and an encoded password', () => {
      expect(makeService().service.buildConnectionUrl()).toBe(
        'postgresql+psycopg2://postgres:p%40ss%2Fword@db.example.com:5432/postgres?sslmode=require',
      );
    });

    it('turns SSL off when asked', () => {
      const { service } = makeService({ SANDWORM_CLOUD_DB_HOST: 'h', SANDWORM_CLOUD_DB_SSL: 'false' });

      expect(service.buildConnectionUrl()).toContain('sslmode=disable');
    });

    it('refuses when no host is configured', () => {
      expect(() => makeService({}).service.buildConnectionUrl()).toThrow(ForbiddenException);
    });
  });

  describe('execute', () => {
    it('renders jinja, then runs the generated query code with the load code', async () => {
      const { service, queryRunner } = makeService();

      await service.execute('w1', 's1', 'q1', 'df', 'SELECT 1', { pageSize: 50, dashboardPageSize: 0 }, jest.fn());

      const [workspaceId, sessionId, queryCode, loadCode, flagPath] = queryRunner.runQuery.mock.calls[0];
      expect([workspaceId, sessionId]).toEqual(['w1', 's1']);
      expect(queryCode).toContain('SELECT 1');
      expect(queryCode).toContain('postgresql+psycopg2://');
      expect(queryCode).not.toMatch(/LIMIT/i);
      expect(loadCode).toContain('df = pd.read_parquet');
      expect(flagPath).toBe('/home/sandwormuser/.sandworm/query-q1.flag');
    });

    it('returns a python-error without querying when jinja rendering fails', async () => {
      const { service, pythonExecutor, queryRunner } = makeService();
      pythonExecutor.renderJinja.mockResolvedValue({ type: 'python-error', message: 'bad' });

      const [promise] = await service.execute('w1', 's1', 'q1', 'df', '{{', { pageSize: 50, dashboardPageSize: 0 }, jest.fn());

      expect(await promise).toMatchObject({ type: 'python-error' });
      expect(queryRunner.runQuery).not.toHaveBeenCalled();
    });
  });
});
