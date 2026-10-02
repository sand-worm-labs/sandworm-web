import type { Output, RunQueryResult } from '@sandworm/types';
import { LIMITS, clipEnd, clipStart, describeOutputs, describeQueryResult, htmlToText } from '../run/outputs';

describe('clipping', () => {
  it('leaves short text alone', () => {
    expect(clipStart('hello', 10)).toEqual({ text: 'hello' });
    expect(clipEnd('hello', 10)).toEqual({ text: 'hello' });
  });

  it('keeps the start or the end and says how much was dropped', () => {
    expect(clipStart('abcdefghij', 4)).toEqual({ text: 'abcd\n… (6 more characters)', truncated: true });
    expect(clipEnd('abcdefghij', 4)).toEqual({ text: '… (6 earlier characters)\nghij', truncated: true });
  });
});

describe('htmlToText', () => {
  it('reads a rendered dataframe as rows of cells', () => {
    // Laid out the way pandas renders it, one tag per line.
    const html = `
      <style>.dataframe { color: red }</style>
      <table class="dataframe">
        <thead>
          <tr>
            <th></th>
            <th>chain</th>
            <th>txs</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>0</th>
            <td>base</td>
            <td>1 &amp; 2</td>
          </tr>
        </tbody>
      </table>
      <p>2 rows × 2 columns</p>`;

    expect(htmlToText(html)).toBe(['| chain | txs', '0 | base | 1 & 2', '2 rows × 2 columns'].join('\n'));
  });
});

describe('describeOutputs', () => {
  it('joins consecutive writes to one stream and keeps streams apart', () => {
    const result: Output[] = [
      { type: 'stdio', name: 'stdout', text: 'a\n' },
      { type: 'stdio', name: 'stdout', text: 'b\n' },
      { type: 'stdio', name: 'stderr', text: 'warn\n' },
      { type: 'stdio', name: 'stdout', text: 'c\n' },
    ];

    expect(describeOutputs(result)).toEqual({
      error: undefined,
      omitted: 0,
      outputs: [
        { type: 'stdout', text: 'a\nb\n' },
        { type: 'stderr', text: 'warn\n' },
        { type: 'stdout', text: 'c\n' },
      ],
    });
  });

  it('pulls out the error with a plain-text traceback', () => {
    const { error, outputs } = describeOutputs([
      { type: 'stdio', name: 'stdout', text: 'before' },
      { type: 'error', ename: 'NameError', evalue: "name 'x' is not defined", traceback: ['\u001b[0;31mNameError\u001b[0m', 'line 1'] },
    ]);

    expect(error).toEqual({ name: 'NameError', message: "name 'x' is not defined", traceback: 'NameError\nline 1' });
    expect(outputs).toEqual([{ type: 'stdout', text: 'before' }]);
  });

  it('keeps the end of a long traceback', () => {
    const traceback = ['x'.repeat(LIMITS.tracebackChars), 'ZeroDivisionError: division by zero'];
    const { error } = describeOutputs([{ type: 'error', ename: 'ZeroDivisionError', evalue: 'division by zero', traceback }]);

    expect(error!.traceback!.endsWith('ZeroDivisionError: division by zero')).toBe(true);
    expect(error!.traceback!.length).toBeLessThan(LIMITS.tracebackChars + 100);
  });

  it('summarizes charts and images without their data', () => {
    const { outputs } = describeOutputs([
      { type: 'plotly', data: [{ type: 'bar', name: 'TVL', x: [1, 2], y: [3, 4] }], layout: { title: { text: 'TVL by chain' } } },
      { type: 'image', format: 'png', data: 'iVBORw0KGgo=' },
    ]);

    expect(outputs).toEqual([
      { type: 'chart', title: 'TVL by chain', traces: [{ type: 'bar', name: 'TVL' }] },
      { type: 'image', format: 'png' },
    ]);
  });

  it('drops markup that has no text in it', () => {
    expect(describeOutputs([{ type: 'html', html: '<div id="plot"></div><script>render()</script>' }]).outputs).toEqual([]);
  });

  it('caps long text and the number of outputs', () => {
    const long = describeOutputs([{ type: 'markdown', text: 'm'.repeat(LIMITS.textChars + 5) }]).outputs[0];
    expect(long).toMatchObject({ type: 'markdown', truncated: true });

    const many: Output[] = Array.from({ length: LIMITS.outputsPerCell + 3 }, (_, i) => ({ type: 'markdown', text: String(i) }));
    const { outputs, omitted } = describeOutputs(many);
    expect(outputs).toHaveLength(LIMITS.outputsPerCell);
    expect(omitted).toBe(3);
  });
});

describe('describeQueryResult', () => {
  it('returns nothing for a query that has not produced a result', () => {
    expect(describeQueryResult(null)).toEqual({});
  });

  it('previews the first rows of a result and clips wide values', () => {
    const rows = Array.from({ length: LIMITS.tableRows + 5 }, (_, i) => ({ id: i, note: 'n'.repeat(LIMITS.tableCellChars + 50) }));
    const result = {
      version: 3,
      type: 'success',
      columns: [{ name: 'id', type: 'int64' }, { name: 'note', type: 'object' }],
      rows,
      count: 1234,
      page: 0,
      pageSize: 50,
      pageCount: 25,
      dashboardPage: 0,
      dashboardPageSize: 0,
      dashboardPageCount: 0,
      dashboardRows: [],
      queryDurationMs: 420,
    } as RunQueryResult;

    const { table, error } = describeQueryResult(result);
    expect(error).toBeUndefined();
    expect(table).toMatchObject({
      rowCount: 1234,
      columns: [{ name: 'id', type: 'int64' }, { name: 'note', type: 'object' }],
      durationMs: 420,
    });
    expect(table!.rows).toHaveLength(LIMITS.tableRows);
    expect(table!.rows[0]!.id).toBe(0);
    expect((table!.rows[0]!.note as string).length).toBe(LIMITS.tableCellChars + 1);
  });

  it('reports query errors', () => {
    expect(describeQueryResult({ type: 'syntax-error', message: 'line 1:8: mismatched input' })).toEqual({
      error: { message: 'line 1:8: mismatched input' },
    });
    expect(describeQueryResult({ type: 'python-error', ename: 'CatalogException', evalue: 'Table daily does not exist', traceback: [] })).toEqual({
      error: { name: 'CatalogException', message: 'Table daily does not exist' },
    });
  });
});
