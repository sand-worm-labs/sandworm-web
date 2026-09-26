import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { guardSql } from './sql-guard.ts';

const accepts = (sql: string) => {
  const result = guardSql(sql);
  assert.equal(result.ok, true, `expected to accept: ${sql}`);
  return result.ok ? result.sql : '';
};
const rejects = (sql: string) => assert.equal(guardSql(sql).ok, false, `expected to reject: ${sql}`);

describe('guardSql', () => {
  it('accepts plain reads', () => {
    accepts('select * from ethereum.blocks limit 10');
    accepts('WITH t AS (SELECT 1 AS x) SELECT * FROM t');
    accepts('show tables');
    accepts('describe ethereum.logs');
  });

  it('strips a trailing semicolon', () => {
    assert.equal(accepts('select 1;'), 'select 1');
    assert.equal(accepts('select 1 ;  '), 'select 1');
  });

  it('rejects anything that is not a read', () => {
    rejects('insert into t values (1)');
    rejects('drop table t');
    rejects('delete from t');
    rejects('create table t as select 1');
    rejects('call system.runtime.kill_query(query_id => \'x\', message => \'y\')');
    rejects('set session query_max_run_time = \'1d\'');
    // EXPLAIN ANALYZE executes the query it wraps.
    rejects('explain analyze select 1');
  });

  it('rejects multiple statements', () => {
    rejects('select 1; select 2');
    rejects('select 1; drop table t');
  });

  it('ignores semicolons and keywords inside strings, identifiers and comments', () => {
    accepts("select 'a; drop table x' as note");
    accepts('select "weird;name" from t');
    accepts("select 'it''s; fine'");
    accepts('select 1 -- ; drop table x');
    accepts('select /* ; drop table x */ 1');
  });

  it('cannot be fooled by a comment hiding the real start of the statement', () => {
    rejects('/* select */ drop table t');
    rejects('-- select\ndrop table t');
  });

  it('rejects empty, oversized and unterminated input', () => {
    rejects('');
    rejects('   ;  ');
    rejects(`select ${'1,'.repeat(20_000)}1`);
    rejects("select 'never closed");
    rejects('select 1 /* never closed');
  });
});
