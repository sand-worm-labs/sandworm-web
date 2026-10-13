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
  walletFrom: jest.fn(),
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
  const docs = { use: jest.fn(async (_ref, _access, work: (doc: { ydoc: object }) => unknown) => work({ ydoc: {} })) };
  return { service: new TrustService(attestations as never, docs as never, {} as never, {} as never), attestations };
};

beforeEach(() => {
  process.env.TRUST_VALIDATORS = VALIDATOR;
  delete process.env.TRUST_VALIDATOR_PRIVATE_KEY;
  liveCode = '0xcode';
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
