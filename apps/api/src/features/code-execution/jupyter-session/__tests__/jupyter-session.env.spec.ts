// What reaches a notebook's environment: the one key Sandworm supplies (Etherscan),
// the variables the workspace saved on its environment page, and changes made
// while a kernel is already running.
const mockExecuted: { kernel: number; code: string }[] = [];
let mockKernelCount = 0;

jest.mock('@/infrastructure/jupyter/jupyter.service', () => ({ JupyterService: jest.fn() }));
jest.mock('@/features/code-execution/query-engine/trino/trino-connection-url.util', () => ({
  buildTrinoConnectionUrl: () => 'trino://unused',
}));
jest.mock('@jupyterlab/services', () => ({
  KernelManager: jest.fn(),
  SessionManager: jest.fn().mockImplementation(() => ({
    startNew: jest.fn().mockImplementation(async () => {
      const id = ++mockKernelCount;
      return {
        kernel: {
          connectionStatus: 'connected',
          requestExecute: ({ code }: { code: string }) => {
            mockExecuted.push({ kernel: id, code });
            return { done: Promise.resolve() };
          },
        },
      };
    }),
  })),
}));

import { JupyterSessionService } from '../jupyter-session.service';
import { EnvironmentVariablesChangedEvent } from '@/events/environment.events';

function makeService(workspaceVariables: { name: string; value: string }[] = [], etherscan: string | null = 'platform-etherscan') {
  const repo = { find: jest.fn().mockResolvedValue(workspaceVariables) } as any;
  const config = {
    get: jest.fn((key: string) => (key === 'etherscan.apiKey' ? etherscan : undefined)),
    getOrThrow: jest.fn().mockReturnValue({}),
  } as any;
  const jupyterManager = { getServerSettings: jest.fn().mockResolvedValue({}) } as any;
  return { service: new JupyterSessionService(repo, config, jupyterManager), repo };
}

// The first thing a new session runs is its environment; the second is the preamble.
const environmentCode = () => mockExecuted[0]!.code;

beforeEach(() => {
  mockExecuted.length = 0;
  mockKernelCount = 0;
});

describe('a new kernel session', () => {
  it('gets Etherscan from Sandworm and the workspace\'s own variables, and no other server key', async () => {
    const { service, repo } = makeService([
      { name: 'NANSEN_API_KEY', value: 'workspace-nansen' },
      { name: 'AVACLOUD_API_KEY', value: 'workspace-avacloud' },
    ]);

    await service.getSession('w1', 's1');

    expect(repo.find).toHaveBeenCalledWith({ where: { workspaceId: 'w1' } });
    expect(environmentCode()).toBe(
      [
        'import os',
        'os.environ["ETHERSCAN_API_KEY"] = "platform-etherscan"',
        'os.environ["NANSEN_API_KEY"] = "workspace-nansen"',
        'os.environ["AVACLOUD_API_KEY"] = "workspace-avacloud"',
      ].join('\n'),
    );
  });

  it('gives a workspace\'s own Etherscan key priority over Sandworm\'s', async () => {
    const { service } = makeService([{ name: 'ETHERSCAN_API_KEY', value: 'mine' }]);

    await service.getSession('w1', 's1');

    const assignments = environmentCode().split('\n').filter(line => line.includes('ETHERSCAN_API_KEY'));
    // Both are set, in this order, so the last one standing is the workspace's.
    expect(assignments).toEqual(['os.environ["ETHERSCAN_API_KEY"] = "platform-etherscan"', 'os.environ["ETHERSCAN_API_KEY"] = "mine"']);
  });

  it('sets nothing but the workspace\'s variables when Sandworm has no Etherscan key', async () => {
    const { service } = makeService([{ name: 'NANSEN_API_KEY', value: 'k' }], null);

    await service.getSession('w1', 's1');

    expect(environmentCode()).toBe('import os\nos.environ["NANSEN_API_KEY"] = "k"');
  });
});

describe('variables Sandworm manages for a workspace', () => {
  it('keeps the AI key and its hash out of the kernel, at session start and on a change', async () => {
    const { service } = makeService([
      { name: 'OPENROUTER_API_KEY', value: 'sk-or-secret' },
      { name: 'OPENROUTER_API_KEY_HASH', value: 'hash-secret' },
      { name: 'NANSEN_API_KEY', value: 'k' },
    ]);

    await service.getSession('w1', 's1');
    expect(environmentCode()).toBe('import os\nos.environ["ETHERSCAN_API_KEY"] = "platform-etherscan"\nos.environ["NANSEN_API_KEY"] = "k"');
    expect(environmentCode()).not.toContain('sk-or-secret');

    mockExecuted.length = 0;
    await service.onEnvironmentVariablesChanged(
      new EnvironmentVariablesChangedEvent('w1', [{ name: 'OPENROUTER_API_KEY', value: 'rotated-secret' }, { name: 'MY_KEY', value: 'v' }], []),
    );
    expect(mockExecuted[0]!.code).toBe('import os\nos.environ["MY_KEY"] = "v"');
  });
});

describe('setting variables from user input', () => {
  const kernelWith = () => {
    const code: string[] = [];
    return { code, kernel: { requestExecute: ({ code: c }: { code: string }) => (code.push(c), { done: Promise.resolve() }) } as any };
  };

  it('puts values in as string literals, so a quote or a line break cannot run as code', async () => {
    const { service } = makeService();
    const { code, kernel } = kernelWith();
    const hostile = 'a\'b"c\nimport os; os.system("rm -rf /")\\';

    await service.setEnvironmentVariables(kernel, { add: [{ name: 'MY_KEY', value: hostile }], remove: [] });

    const lines = code[0]!.split('\n');
    // One statement for the variable, however many line breaks the value has.
    expect(lines).toEqual(['import os', `os.environ["MY_KEY"] = ${JSON.stringify(hostile)}`]);
  });

  it('skips a name that is not a valid variable name, for both setting and removing', async () => {
    const { service } = makeService();
    const { code, kernel } = kernelWith();

    await service.setEnvironmentVariables(kernel, {
      add: [{ name: 'OK_NAME', value: '1' }, { name: 'bad name', value: '2' }, { name: 'x"]=1#', value: '3' }],
      remove: ['GONE', '1STARTS_WITH_DIGIT', 'a;b'],
    });

    expect(code[0]).toBe(['import os', 'os.environ.pop("GONE", None)', 'os.environ["OK_NAME"] = "1"'].join('\n'));
  });
});

describe('a change made while kernels are running', () => {
  it('reaches that workspace\'s running kernels only', async () => {
    const { service } = makeService();
    await service.getSession('w1', 'a');
    await service.getSession('w2', 'b');
    mockExecuted.length = 0;

    await service.onEnvironmentVariablesChanged(
      new EnvironmentVariablesChangedEvent('w1', [{ name: 'NANSEN_API_KEY', value: 'new' }], ['OLD_KEY']),
    );

    expect(mockExecuted).toHaveLength(1);
    expect(mockExecuted[0]!.kernel).toBe(1);
    expect(mockExecuted[0]!.code).toBe(['import os', 'os.environ.pop("OLD_KEY", None)', 'os.environ["NANSEN_API_KEY"] = "new"'].join('\n'));
  });

  it('does not fail the save when a kernel cannot take the update', async () => {
    const { service } = makeService();
    await service.getSession('w1', 'a');
    const session = (service as any).sessions.get('w1-a');
    session.kernel.requestExecute = () => {
      throw new Error('kernel is dead');
    };

    await expect(
      service.onEnvironmentVariablesChanged(new EnvironmentVariablesChangedEvent('w1', [{ name: 'K', value: 'v' }], [])),
    ).resolves.toBeUndefined();
  });
});
