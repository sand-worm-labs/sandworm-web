// Step 2: read the finding's notebook, commit to its inputs and run time, and publish the receipt.

import { publicClient } from '../src/chain.ts';
import { required } from '../src/config.ts';
import { extractInputs, ranAt } from '../src/inputs.ts';
import { publish } from '../src/ipfs.ts';
import { buildReceipt } from '../src/receipt.ts';
import { loadNotebook } from '../src/sandworm.ts';
import { loadState, need, saveState } from './state.ts';

// =====================================
// ⬢ Build
// =====================================
async function main() {
  const agentId = need(loadState(), 'agentId', 'register-agent');
  const notebook = { workspaceId: required('WORKSPACE_ID'), notebookId: required('NOTEBOOK_ID') };
  const cellIds = required('CELL_IDS')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);

  const ydoc = await loadNotebook(notebook);
  const inputs = extractInputs(ydoc, cellIds);
  // The Monad block when the receipt was made: a timestamp anchor, not a data version.
  const blockNumber = (await publicClient().getBlockNumber()).toString();

  const { receipt, bytes, requestHash } = buildReceipt({
    agentId,
    finding: required('FINDING'),
    notebook,
    inputs,
    ranAt: ranAt(ydoc, cellIds),
    blockNumber,
  });
  const receiptURI = await publish(bytes, `sandworm-receipt-${requestHash.slice(2, 10)}.json`);

  saveState({ receiptURI, requestHash, inputHash: receipt.inputHash });
  console.log(`Receipt for agent ${agentId}: ${inputs.length} cell(s), ran at ${receipt.ranAt}`);
  console.log(`  inputHash   ${receipt.inputHash}`);
  console.log(`  requestHash ${requestHash}`);
  console.log(`  receiptURI  ${receiptURI.length > 100 ? `${receiptURI.slice(0, 60)}… (data URI)` : receiptURI}`);
}

await main();
