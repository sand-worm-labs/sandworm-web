// The receipt: what is published for a finding, and the checks a validator makes on it.

import { keccak256, stringToBytes, type Hex } from 'viem';

import { canonicalJson, type Json } from './canonical.ts';
import { agentRegistry, chain } from './config.ts';
import { hashCode, hashInputs, type CellInput } from './inputs.ts';

export const RECEIPT_TYPE = 'sandworm-input-receipt/v1';
export const REPORT_TYPE = 'sandworm-validation/v1';

export type Receipt = {
  type: typeof RECEIPT_TYPE;
  agentRegistry: string;
  agentId: string;
  finding: string;
  notebook: { workspaceId: string; notebookId: string };
  inputs: CellInput[];
  // When the cells last ran: part of what inputHash commits to.
  ranAt: string;
  // The code and parameters alone, to tell "edited" from "run again".
  codeHash: Hex;
  inputHash: Hex;
  chainId: number;
  blockNumber: string;
  createdAt: string;
  commitsTo: 'inputs';
  note: string;
};

const NOTE =
  'This receipt commits to the notebook cells that produce the finding (code, data source, parameters) and to the time they ran. ' +
  'It does not hash their output, which changes as the data does: a later difference in results is expected unless the code differs. It does not prove the logic is correct.';

// =====================================
// ⬢ Build
// =====================================
export type ReceiptDraft = Pick<Receipt, 'agentId' | 'finding' | 'notebook' | 'inputs' | 'ranAt' | 'blockNumber'>;

export function buildReceipt(draft: ReceiptDraft): { receipt: Receipt; bytes: Uint8Array; requestHash: Hex } {
  const receipt: Receipt = {
    type: RECEIPT_TYPE,
    agentRegistry: agentRegistry(),
    ...draft,
    codeHash: hashCode(draft.inputs),
    inputHash: hashInputs(draft.inputs, draft.ranAt),
    chainId: chain().id,
    createdAt: new Date().toISOString(),
    commitsTo: 'inputs',
    note: NOTE,
  };
  return { receipt, ...encode(receipt) };
}

// The bytes that are pinned and hashed: canonical, so they are the same everywhere.
export function encode(value: object): { bytes: Uint8Array; requestHash: Hex } {
  const bytes = stringToBytes(canonicalJson(value as Json));
  return { bytes, requestHash: keccak256(bytes) };
}

// =====================================
// ⬢ Check
// =====================================
export function parseReceipt(bytes: Uint8Array): Receipt {
  const receipt = JSON.parse(Buffer.from(bytes).toString('utf8')) as Receipt;
  if (receipt.type !== RECEIPT_TYPE) throw new Error(`Not a ${RECEIPT_TYPE} receipt`);
  return receipt;
}

// The inputs inside the receipt really hash to the hash it states.
export const inputHashIsConsistent = (receipt: Receipt): boolean =>
  hashCode(receipt.inputs) === receipt.codeHash && hashInputs(receipt.inputs, receipt.ranAt) === receipt.inputHash;

// What the validator publishes alongside its score.
export type Checks = { receiptMatchesRequest: boolean; inputHashConsistent: boolean; notebookStillMatches: boolean; reran: boolean };

export const score = (checks: Checks): number => (Object.values(checks).every(Boolean) ? 100 : 0);
