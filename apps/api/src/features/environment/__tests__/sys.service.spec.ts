import { SysinfoService } from '../sys.service';

function makePythonExecutor() {
  return {
    executeCode: jest.fn(),
  } as any;
}

function makeService() {
  const pythonExecutor = makePythonExecutor();
  const service = new SysinfoService(pythonExecutor);
  return { service, pythonExecutor };
}

const CONTEXT = { workspaceId: 'ws-1', sessionId: 'session-1' };
const SYSINFO_PAYLOAD = { python: { version: '3.11' } };

function stdoutOutput(payload: Record<string, unknown>) {
  return { type: 'stdio', name: 'stdout', text: JSON.stringify({ __sysinfo__: payload }) };
}

function mockSuccessfulRun(pythonExecutor: any, payload: Record<string, unknown> = SYSINFO_PAYLOAD) {
  pythonExecutor.executeCode.mockImplementation(async (_ctx: any, _code: string, onOutputs: any) => {
    onOutputs([stdoutOutput(payload)]);
    return { promise: Promise.resolve(), abort: jest.fn() };
  });
}

describe('SysinfoService', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('collect', () => {
    it('runs python and caches the result on a cache miss', async () => {
      const { service, pythonExecutor } = makeService();
      mockSuccessfulRun(pythonExecutor);

      const result = await service.collect(CONTEXT);

      expect(pythonExecutor.executeCode).toHaveBeenCalledTimes(1);
      expect(result).toEqual(SYSINFO_PAYLOAD);
    });

    it('returns the cached value without re-running python', async () => {
      const { service, pythonExecutor } = makeService();
      mockSuccessfulRun(pythonExecutor);

      await service.collect(CONTEXT);
      const result = await service.collect(CONTEXT);

      expect(pythonExecutor.executeCode).toHaveBeenCalledTimes(1);
      expect(result).toEqual(SYSINFO_PAYLOAD);
    });

    it('re-runs python once the cache TTL has expired', async () => {
      jest.useFakeTimers();
      const { service, pythonExecutor } = makeService();
      mockSuccessfulRun(pythonExecutor);

      await service.collect(CONTEXT);
      jest.advanceTimersByTime(1000 * 60 * 10 + 1);
      await service.collect(CONTEXT);

      expect(pythonExecutor.executeCode).toHaveBeenCalledTimes(2);
    });

    it('dedupes concurrent calls for the same context via the inflight map', async () => {
      const { service, pythonExecutor } = makeService();
      let resolveExecution: () => void;
      const gate = new Promise<void>((resolve) => {
        resolveExecution = resolve;
      });
      pythonExecutor.executeCode.mockImplementation(async (_ctx: any, _code: string, onOutputs: any) => {
        const promise = gate.then(() => {
          onOutputs([stdoutOutput(SYSINFO_PAYLOAD)]);
        });
        return { promise, abort: jest.fn() };
      });

      const first = service.collect(CONTEXT);
      const second = service.collect(CONTEXT);
      resolveExecution!();
      const [firstResult, secondResult] = await Promise.all([first, second]);

      expect(pythonExecutor.executeCode).toHaveBeenCalledTimes(1);
      expect(firstResult).toEqual(SYSINFO_PAYLOAD);
      expect(secondResult).toEqual(SYSINFO_PAYLOAD);
    });

    it('does not dedupe calls for different contexts', async () => {
      const { service, pythonExecutor } = makeService();
      mockSuccessfulRun(pythonExecutor);

      await Promise.all([
        service.collect(CONTEXT),
        service.collect({ workspaceId: 'ws-2', sessionId: 'session-2' }),
      ]);

      expect(pythonExecutor.executeCode).toHaveBeenCalledTimes(2);
    });

    it('throws when python produces no sysinfo output', async () => {
      const { service, pythonExecutor } = makeService();
      pythonExecutor.executeCode.mockResolvedValue({ promise: Promise.resolve(), abort: jest.fn() });

      await expect(service.collect(CONTEXT)).rejects.toThrow('Sysinfo produced no output');
    });

    it('clears the inflight entry after failure so a retry can run again', async () => {
      const { service, pythonExecutor } = makeService();
      pythonExecutor.executeCode.mockResolvedValueOnce({ promise: Promise.resolve(), abort: jest.fn() });
      await expect(service.collect(CONTEXT)).rejects.toThrow();

      mockSuccessfulRun(pythonExecutor);
      const result = await service.collect(CONTEXT);

      expect(result).toEqual(SYSINFO_PAYLOAD);
    });
  });

  describe('refresh', () => {
    it('clears the cache and re-collects', async () => {
      const { service, pythonExecutor } = makeService();
      mockSuccessfulRun(pythonExecutor);

      await service.collect(CONTEXT);
      await service.refresh(CONTEXT);

      expect(pythonExecutor.executeCode).toHaveBeenCalledTimes(2);
    });
  });

  describe('getCacheStatus', () => {
    it('reports not cached when nothing has been collected', () => {
      const { service } = makeService();

      expect(service.getCacheStatus(CONTEXT)).toEqual({ cached: false });
    });

    it('reports cached with timestamps after a successful collect', async () => {
      const { service, pythonExecutor } = makeService();
      mockSuccessfulRun(pythonExecutor);

      await service.collect(CONTEXT);
      const status = service.getCacheStatus(CONTEXT);

      expect(status.cached).toBe(true);
      expect(status.collectedAt).toBeInstanceOf(Date);
      expect(status.expiresAt).toBeInstanceOf(Date);
    });

    it('reports not cached once the TTL has expired', async () => {
      jest.useFakeTimers();
      const { service, pythonExecutor } = makeService();
      mockSuccessfulRun(pythonExecutor);

      await service.collect(CONTEXT);
      jest.advanceTimersByTime(1000 * 60 * 10 + 1);

      expect(service.getCacheStatus(CONTEXT)).toEqual({ cached: false });
    });
  });
});
