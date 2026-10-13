import { BadRequestException } from '@nestjs/common';

// The chain, the notebook and the editor package are replaced: this is about the decision.
const chain = {
  validationStatus: jest.fn(),
  agentOwner: jest.fn(),
  fetchBytes: jest.fn(),
};
const receipt = {
  notebook: { notebookId: 'd1' },
  inputs: [{ cellId: 'c1' }, { cellId: 'c2' }],
  codeHash: '0xcode',
};
let liveCode = '0xcode';
let cellsHaveRun = true;
let liveCells = ['c1', 'c2'];

jest.mock('@sandworm/trust', () => ({
  agentOwner: (...args: unknown[]) => chain.agentOwner(...args),
  validationStatus: (...args: unknown[]) => chain.validationStatus(...args),
  fetchBytes: (...args: unknown[]) => chain.fetchBytes(...args),
  parseReceipt: () => receipt,
  inputHashIsConsistent: () => true,
  hashCode: () => liveCode,
  extractInputs: () => [],
  runnableCellIds: () => liveCells,
  NotRunError: class NotRunError extends Error {},
  ranAt: () => {
    if (!cellsHaveRun) throw new (jest.requireMock('@sandworm/trust').NotRunError)();
    return '2026-10-13T10:00:00.000Z';
  },
  walletFrom: (key: string) => ({ account: { address: `0x${key}` } }),
}));
jest.mock('viem', () => ({ keccak256: () => '0xrequest' }));
jest.mock('../../notebook-blocks/notebook-doc.service', () => ({ NotebookDocService: class {} }));
jest.mock('../../notebook-blocks/notebook-run.service', () => ({ NotebookRunService: class {} }));
jest.mock('../../document/service/document.service', () => ({ DocumentService: class {} }));

import { TrustService } from '../trust.service';

const VALIDATOR = '0x00000000000000000000000000000000000000aa';
const AGENT_OWNER = '0x00000000000000000000000000000000000000bb';
const REF = { userId: 'u1', workspaceId: 'w1', documentId: 'd1' };
const row = { id: 'a1', agentId: '7', requestHash: '0xrequest', receiptUri: 'ipfs://x', codeHash: '0xcode' };

const setup = (rows: unknown[] = [row]) => {
  const attestations = { find: jest.fn().mockResolvedValue(rows) };
  const docs = {
    use: jest.fn(async (_ref, _access, work: (doc: { ydoc: object }) => unknown) => work({ ydoc: {} })),
    assertRunsInCloud: jest.fn().mockResolvedValue(undefined),
  };
  return { service: new TrustService(attestations as never, docs as never, {} as never, {} as never), attestations, docs };
};

beforeEach(() => {
  process.env.TRUST_VALIDATORS = VALIDATOR;
  delete process.env.TRUST_VALIDATOR_PRIVATE_KEY;
  process.env.TRUST_AGENT_PRIVATE_KEY = 'aa';
  process.env.TRUST_VALIDATOR_PRIVATE_KEY = 'bb';
  process.env.TRUST_AGENT_ID = '7';
  liveCode = '0xcode';
  cellsHaveRun = true;
  liveCells = ['c1', 'c2'];
  chain.validationStatus.mockResolvedValue({ validator: VALIDATOR, agentId: 7n, response: 100 });
  chain.agentOwner.mockResolvedValue(AGENT_OWNER);
  chain.fetchBytes.mockResolvedValue(new Uint8Array());
});

describe('TrustService.trusted', () => {
  it('accepts a notebook the validator passed, with nothing changed since', async () => {
    const { service } = setup();
    await expect(service.trusted(REF)).resolves.toBe(row);
  });

  it('refuses a notebook that was never attested', async () => {
    const { service } = setup([]);
    await expect(service.trusted(REF)).rejects.toThrow('not trusted yet');
  });

  it('refuses when the validator did not pass it', async () => {
    chain.validationStatus.mockResolvedValue({ validator: VALIDATOR, agentId: 7n, response: 0 });
    const { service } = setup();
    await expect(service.trusted(REF)).rejects.toThrow('did not pass');
  });

  it('refuses a validator that is not on the trusted list', async () => {
    process.env.TRUST_VALIDATORS = '0x00000000000000000000000000000000000000cc';
    const { service } = setup();
    await expect(service.trusted(REF)).rejects.toThrow('validator we do not trust');
  });

  it('refuses when the agent and the validator are the same wallet', async () => {
    chain.agentOwner.mockResolvedValue(VALIDATOR);
    const { service } = setup();
    await expect(service.trusted(REF)).rejects.toThrow('same wallet');
  });

  it('refuses when the onchain record belongs to another agent', async () => {
    chain.validationStatus.mockResolvedValue({ validator: VALIDATOR, agentId: 9n, response: 100 });
    const { service } = setup();
    await expect(service.trusted(REF)).rejects.toThrow('different agent');
  });

  it('refuses a notebook whose code changed after it was attested', async () => {
    liveCode = '0xedited';
    const { service } = setup();
    await expect(service.trusted(REF)).rejects.toThrow('changed after it was attested');
  });

  it('refuses a notebook with a cell the attestation does not cover', async () => {
    liveCells = ['c1', 'c2', 'c3'];
    const { service } = setup();
    await expect(service.trusted(REF)).rejects.toThrow('does not cover');
  });

  it('refuses a receipt that is for a different notebook', async () => {
    const { service } = setup();
    await expect(service.trusted({ ...REF, documentId: 'other' })).rejects.toThrow('different notebook');
  });

  it('falls back to an earlier attestation when the latest no longer holds', async () => {
    const older = { ...row, id: 'a0' };
    chain.validationStatus
      .mockResolvedValueOnce({ validator: VALIDATOR, agentId: 7n, response: 0 })
      .mockResolvedValueOnce({ validator: VALIDATOR, agentId: 7n, response: 100 });
    const { service } = setup([row, older]);
    await expect(service.trusted(REF)).resolves.toBe(older);
  });

  it('says it is a bad request, not a server error', async () => {
    const { service } = setup([]);
    await expect(service.trusted(REF)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('TrustService.start and status', () => {
  const tick = () => new Promise(resolve => setImmediate(resolve));

  it('returns at once and reports the attestation as pending while it runs', async () => {
    const { service } = setup([]);
    let finish: (value: unknown) => void = () => undefined;
    jest.spyOn(service, 'attest').mockReturnValue(new Promise(resolve => (finish = resolve)) as never);

    await service.start(REF);
    await expect(service.status(REF)).resolves.toMatchObject({ trusted: false, pending: true });

    finish({ response: 100 });
    await tick();
    await expect(service.status(REF)).resolves.toMatchObject({ pending: false });
  });

  it('does not start a second attestation while one is running', async () => {
    const { service } = setup([]);
    const attest = jest.spyOn(service, 'attest').mockReturnValue(new Promise(() => undefined) as never);

    await service.start(REF);
    await service.start(REF);
    expect(attest).toHaveBeenCalledTimes(1);
  });

  it('refuses straight away what can be refused, such as a browser notebook', async () => {
    const { service, docs } = setup([]);
    docs.assertRunsInCloud.mockRejectedValue(new BadRequestException('This is a Live notebook'));
    const attest = jest.spyOn(service, 'attest');

    await expect(service.start(REF)).rejects.toThrow('Live notebook');
    expect(attest).not.toHaveBeenCalled();
    await expect(service.status(REF)).resolves.toMatchObject({ pending: false });
  });

  it('tells the user to run the notebook first when none of its cells has run', async () => {
    cellsHaveRun = false;
    const { service } = setup([]);
    const attest = jest.spyOn(service, 'attest');

    await expect(service.start(REF)).rejects.toThrow('Run the notebook first');
    await expect(service.start(REF)).rejects.toBeInstanceOf(BadRequestException);
    expect(attest).not.toHaveBeenCalled();
  });

  it('says why a failed attestation failed', async () => {
    const { service } = setup([]);
    jest.spyOn(service, 'attest').mockRejectedValue(new Error('The notebook is still running: try again'));

    await service.start(REF);
    await tick();
    await expect(service.status(REF)).resolves.toMatchObject({
      trusted: false,
      pending: false,
      reason: 'The notebook is still running: try again',
    });
  });

  it('starts again after a failure', async () => {
    const { service } = setup([]);
    const attest = jest.spyOn(service, 'attest').mockRejectedValueOnce(new Error('boom')).mockResolvedValue({ response: 100 } as never);

    await service.start(REF);
    await tick();
    await service.start(REF);
    expect(attest).toHaveBeenCalledTimes(2);
  });
});
