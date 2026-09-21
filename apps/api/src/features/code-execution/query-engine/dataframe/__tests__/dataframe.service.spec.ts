import { DataFrameService } from '../dataframe.service';

const CONTEXT = { workspaceId: 'ws-1', sessionId: 'session-1' };
const BLOCK_ID = '11111111-2222-3333-4444-555555555555';

function makeService() {
  const pythonExecutor = { executeCode: jest.fn() } as any;
  const service = new DataFrameService(pythonExecutor);
  return { service, pythonExecutor };
}

describe('DataFrameService.exportBlockResult', () => {
  it('runs the export code without touching kernel history', async () => {
    const { service, pythonExecutor } = makeService();
    pythonExecutor.executeCode.mockResolvedValue({ promise: Promise.resolve() });

    await service.exportBlockResult(CONTEXT, BLOCK_ID, { executionCount: 4 });

    const [context, code, , opts] = pythonExecutor.executeCode.mock.calls[0];
    expect(context).toBe(CONTEXT);
    // History must stay off, otherwise the export itself would take an
    // execution count and shift the numbering for later cells.
    expect(opts).toEqual({ storeHistory: false });
    expect(code).toContain(`/home/sandwormuser/.sandworm/query-${BLOCK_ID}`);
  });

  it('never fails the block when the kernel call fails', async () => {
    const { service, pythonExecutor } = makeService();
    pythonExecutor.executeCode.mockRejectedValue(new Error('kernel gone'));

    await expect(
      service.exportBlockResult(CONTEXT, BLOCK_ID, { executionCount: 4 }),
    ).resolves.toBeUndefined();
  });
});

describe('DataFrameService.buildExportBlockResultCode', () => {
  it("looks up the cell's own Out entry, not the latest one", () => {
    const { service } = makeService();

    const code = service.buildExportBlockResultCode(BLOCK_ID, { executionCount: 12 });

    expect(code).toContain('ip.user_ns.get("Out", {}).get(12)');
    // The old approach (`execution_count - 1`) can pick up another block's
    // result if a different cell ran in between.
    expect(code).not.toContain('execution_count');
  });

  it('exports nothing when the execution count is unknown', () => {
    const { service } = makeService();

    const code = service.buildExportBlockResultCode(BLOCK_ID, { executionCount: null });

    expect(code).toContain('df = None');
    // Still clears the previous run's files so nothing stale is served.
    expect(code).toContain('os.remove(path)');
  });

  it('exports the named variable when the block knows it', () => {
    const { service } = makeService();

    const code = service.buildExportBlockResultCode(BLOCK_ID, {
      dataframeName: 'ptb_contracts_unique_wallets_2',
    });

    expect(code).toContain('ip.user_ns.get("ptb_contracts_unique_wallets_2")');
    // A tool that ends on a chart has no useful `Out[n]` — don't fall back to it.
    expect(code).not.toContain('"Out"');
  });

  it('saves the csv where the SQL csv endpoint looks for it', () => {
    const { service } = makeService();

    const code = service.buildExportBlockResultCode(BLOCK_ID, { executionCount: 1 });

    expect(code).toContain('csv = base + ".csv"');
    expect(code).toContain('parquet = base + ".parquet.gzip"');
  });

  it('retries parquet with stringified columns and removes a partial file if that fails too', () => {
    const { service } = makeService();

    const code = service.buildExportBlockResultCode(BLOCK_ID, { executionCount: 1 });

    expect(code).toContain('safe.isetitem(');
    expect(code).toContain('f"{name}_{count}"');
    expect(code.match(/os\.remove\(parquet\)/g)).toHaveLength(1);
  });
});
