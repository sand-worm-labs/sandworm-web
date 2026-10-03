import assert from 'node:assert/strict';
import { test } from 'node:test';

import { printedTableProblem } from '../printed-table.ts';

test('rejects a table printed with to_string', () => {
  assert.match(printedTableProblem('yr = df.groupby("year").sum()\nprint(yr.to_string())') ?? '', /print\(yr\.to_string\(\)\)/);
  assert.ok(printedTableProblem('print( df.head(10).to_string(index=False) )'));
  assert.ok(printedTableProblem('    print("Totals:\\n", yr.to_markdown())'));
});

test('accepts a cell that ends with the dataframe', () => {
  assert.equal(printedTableProblem('yr = df.groupby("year").sum()\nyr'), undefined);
  assert.equal(printedTableProblem('print(f"{len(df)} rows")'), undefined);
  assert.equal(printedTableProblem('# print(yr.to_string())\nyr'), undefined);
  assert.equal(printedTableProblem(undefined), undefined);
});
