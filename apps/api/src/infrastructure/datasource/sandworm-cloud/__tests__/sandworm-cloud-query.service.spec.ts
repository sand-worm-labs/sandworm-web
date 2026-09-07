import { ForbiddenException } from '@nestjs/common';
import { SandwormCloudQueryService } from '../sandworm-cloud-query.service';

function makeService() {
  const configService = {} as any;
  return new SandwormCloudQueryService(configService);
}

describe('SandwormCloudQueryService', () => {
  describe('executeQuery', () => {
    it('returns mock columns/rows for a valid query (real execution not implemented yet)', async () => {
      const service = makeService();

      const result = await service.executeQuery('SELECT * FROM example_table', 'u1', 'w1');

      expect(result).toEqual({
        columns: ['id', 'name', 'value'],
        rows: [
          [1, 'Example', 100],
          [2, 'Test', 200],
        ],
      });
    });

    it.each(['DROP TABLE foo', 'DELETE FROM foo', 'UPDATE foo SET x=1', 'INSERT INTO foo VALUES (1)', 'ALTER TABLE foo', 'TRUNCATE foo', 'CREATE TABLE foo (id int)'])(
      'rejects a mutating statement: %s',
      async (query) => {
        const service = makeService();

        await expect(service.executeQuery(query, 'u1', 'w1')).rejects.toThrow(ForbiddenException);
      },
    );
  });

  describe('getSchema', () => {
    it('returns the mock schema with a main schema and default schema name', async () => {
      const service = makeService();

      const result = await service.getSchema();

      expect(result.defaultSchema).toBe('main');
      expect(result.tables.has('main')).toBe(true);
      expect(result.tables.get('main').has('example_table')).toBe(true);
      expect(result.tables.get('main').has('another_table')).toBe(true);
    });
  });
});
