import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { handleRunQuery, type ChargeOutcome, type RunQueryDeps, type ToolResult } from './run-query.ts';
import { TrinoQueryError } from './trino.ts';

const RECEIPT = { receipt: 'paid' };

function makeDeps(overrides: Partial<RunQueryDeps> & { outcome?: ChargeOutcome } = {}) {
  const calls = { charge: 0, query: [] as string[] };
  const deps: RunQueryDeps = {
    charge: async () => {
      calls.charge += 1;
      return (
        overrides.outcome ?? {
          status: 200,
          withReceipt: (result: ToolResult) => ({ ...result, _meta: RECEIPT }) as ToolResult,
        }
      );
    },
    query:
      overrides.query ??
      (async sql => {
        calls.query.push(sql);
        return { columns: [{ name: 'n', type: 'integer' }], rows: [[1]], truncated: false };
      }),
  };
  return { deps, calls };
}

describe('handleRunQuery', () => {
  it('rejects a bad query without charging or querying', async () => {
    const { deps, calls } = makeDeps();

    const result = await handleRunQuery({ sql: 'drop table t' }, {}, deps);

    assert.equal(result.isError, true);
    assert.equal(calls.charge, 0);
    assert.deepEqual(calls.query, []);
  });

  it('throws the challenge and does not query when unpaid', async () => {
    const challenge = new Error('payment required');
    const { deps, calls } = makeDeps({ outcome: { status: 402, challenge } });

    await assert.rejects(handleRunQuery({ sql: 'select 1' }, {}, deps), err => err === challenge);
    assert.deepEqual(calls.query, []);
  });

  it('runs the query and attaches the receipt once paid', async () => {
    const { deps, calls } = makeDeps();

    const result = await handleRunQuery({ sql: 'select 1;' }, {}, deps);

    assert.deepEqual(calls.query, ['select 1']);
    assert.deepEqual((result as ToolResult & { _meta: unknown })._meta, RECEIPT);
    assert.deepEqual(JSON.parse(result.content[0].text), {
      columns: [{ name: 'n', type: 'integer' }],
      rows: [[1]],
      rowCount: 1,
      truncated: false,
    });
  });

  it('returns a paid query failure as a tool error, still with a receipt', async () => {
    const { deps } = makeDeps({
      query: async () => {
        throw new TrinoQueryError('Column x cannot be resolved');
      },
    });

    const result = await handleRunQuery({ sql: 'select x' }, {}, deps);

    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /cannot be resolved/);
    assert.deepEqual((result as ToolResult & { _meta: unknown })._meta, RECEIPT);
  });

  it('does not swallow unexpected errors', async () => {
    const { deps } = makeDeps({
      query: async () => {
        throw new TypeError('boom');
      },
    });

    await assert.rejects(handleRunQuery({ sql: 'select 1' }, {}, deps), TypeError);
  });
});
