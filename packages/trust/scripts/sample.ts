// A sample of the whole flow with nothing to fill in but the two keys: the notebook is
// built here, in memory, so it needs no Sandworm API, token or notebook id. The receipt,
// the request and the verdict are real, and go onchain on the network in TRUST_NETWORK.
// Run `pnpm register-agent` first.

import { addBlockGroup, BlockType, getBlocks, getLayout } from '@sandworm/editor';
import { keccak256 } from 'viem';
import * as Y from 'yjs';

import { publicClient, txUrl, VALIDATION_ABI, wallet } from '../src/chain.ts';
import { REGISTRIES, TAG } from '../src/config.ts';
import { extractInputs, hashCode, ranAt } from '../src/inputs.ts';
import { fetchBytes, publish } from '../src/ipfs.ts';
import { buildReceipt, encode, inputHashIsConsistent, parseReceipt, REPORT_TYPE, score, type Checks } from '../src/receipt.ts';
import { loadState, need, saveState } from './state.ts';

const NOTEBOOK = { workspaceId: '00000000-0000-4000-8000-000000000000', notebookId: '00000000-0000-4000-8000-000000000001' };
const CELL_ID = '11111111-1111-4111-8111-111111111111';
const SOURCE = "import pandas as pd\ndf = pd.DataFrame({'chain': ['monad'], 'tps': [10000]})\ndf";
const FINDING = 'Sample finding: a one-cell notebook, attested end to end';

// =====================================
// ⬢ The sample notebook
// =====================================
// One Python cell that has just run, built the way the editor builds one.
function sampleNotebook(): Y.Doc {
  const ydoc = new Y.Doc();
  const blocks = getBlocks(ydoc);
  const block = { type: BlockType.Python, title: 'Sample', source: SOURCE };
  const id = addBlockGroup(getLayout(ydoc), blocks, block as never, 0, false, CELL_ID);
  blocks.get(id)!.setAttribute('lastQueryTime' as never, new Date().toISOString() as never);
  return ydoc;
}

// =====================================
// ⬢ Run
// =====================================
async function main() {
  const agentId = need(loadState(), 'agentId', 'register-agent');
  const agent = wallet('AGENT_PRIVATE_KEY');
  const validator = wallet('VALIDATOR_PRIVATE_KEY');
  const chain = publicClient();
  const ydoc = sampleNotebook();

  // The agent: receipt, then the request.
  const inputs = extractInputs(ydoc, [CELL_ID]);
  const blockNumber = (await chain.getBlockNumber()).toString();
  const built = buildReceipt({ agentId, finding: FINDING, notebook: NOTEBOOK, inputs, ranAt: ranAt(ydoc, [CELL_ID]), blockNumber });
  const receiptURI = await publish(built.bytes, `sandworm-receipt-${built.requestHash.slice(2, 10)}.json`);
  console.log(`1. Receipt   ${receiptURI}`);
  console.log(`   requestHash ${built.requestHash}`);

  const asked = await chain.simulateContract({
    account: agent.account,
    address: REGISTRIES.validation,
    abi: VALIDATION_ABI,
    functionName: 'validationRequest',
    args: [validator.account.address, BigInt(agentId), receiptURI, built.requestHash],
  });
  const requestTx = await agent.client.writeContract(asked.request);
  const requested = await chain.waitForTransactionReceipt({ hash: requestTx });
  console.log(`2. Requested ${txUrl(requestTx)}`);

  // The validator: fetch what was published and check it against the notebook.
  const bytes = await fetchBytes(receiptURI);
  const receipt = parseReceipt(bytes);
  const checks: Checks = {
    receiptMatchesRequest: keccak256(bytes) === built.requestHash,
    inputHashConsistent: inputHashIsConsistent(receipt),
    notebookStillMatches: hashCode(extractInputs(ydoc, [CELL_ID])) === receipt.codeHash,
    // Not a real re-run: this notebook exists only here. `pnpm validate` re-runs a real one.
    reran: true,
  };
  const report = encode({
    type: REPORT_TYPE,
    sample: true,
    requestHash: built.requestHash,
    agentId,
    inputHash: receipt.inputHash,
    checks,
    originalRanAt: receipt.ranAt,
    validatedAt: new Date().toISOString(),
  });
  const responseURI = await publish(report.bytes, `sandworm-validation-${built.requestHash.slice(2, 10)}.json`);

  const answered = await chain.simulateContract({
    account: validator.account,
    address: REGISTRIES.validation,
    abi: VALIDATION_ABI,
    functionName: 'validationResponse',
    args: [built.requestHash, score(checks), responseURI, report.requestHash, TAG],
  });
  const validationTx = await validator.client.writeContract(answered.request);
  await chain.waitForTransactionReceipt({ hash: validationTx });
  console.log(`3. Verdict ${score(checks)}  ${txUrl(validationTx)}`);
  console.log(`   checks ${JSON.stringify(checks)}`);

  saveState({
    receiptURI,
    requestHash: built.requestHash,
    inputHash: receipt.inputHash,
    requestTx,
    requestBlock: requested.blockNumber.toString(),
    validationTx,
  });
}

await main();
