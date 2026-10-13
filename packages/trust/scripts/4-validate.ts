// Step 4: from the validator's wallet, check a request and post the verdict.
// Needs a Sandworm token that can read, and re-run, the notebook.

import { keccak256, type Hex } from 'viem';

import { publicClient, txUrl, VALIDATION_ABI, wallet } from '../src/chain.ts';
import { REGISTRIES, TAG } from '../src/config.ts';
import { extractInputs, hashCode, ranAt } from '../src/inputs.ts';
import { fetchBytes, publish } from '../src/ipfs.ts';
import { encode, inputHashIsConsistent, parseReceipt, REPORT_TYPE, score, type Checks } from '../src/receipt.ts';
import { cellStates, loadNotebook, rerunNotebook } from '../src/sandworm.ts';
import { loadState, saveState } from './state.ts';

// =====================================
// ⬢ Find the request
// =====================================
// From the chain, not from a file: the validator trusts nothing the agent hands over.
async function findRequest(validator: Hex, requestHash?: Hex) {
  const fromBlock = BigInt(loadState().requestBlock ?? process.env.FROM_BLOCK ?? '0');
  const logs = await publicClient().getContractEvents({
    address: REGISTRIES.validation,
    abi: VALIDATION_ABI,
    eventName: 'ValidationRequest',
    args: { validatorAddress: validator, ...(requestHash ? { requestHash } : {}) },
    fromBlock,
  });
  const latest = logs.at(-1);
  if (!latest) throw new Error('No validation request for this validator (set FROM_BLOCK if it is older)');
  return latest.args as { agentId: bigint; requestURI: string; requestHash: Hex };
}

// =====================================
// ⬢ Checks
// =====================================
async function check(request: { requestURI: string; requestHash: Hex }) {
  const bytes = await fetchBytes(request.requestURI);
  const receipt = parseReceipt(bytes);
  const ids = receipt.inputs.map(input => input.cellId);

  // The notebook as it is now, before anything is re-run. Only the code is compared:
  // a notebook that has been run again is not an altered one.
  const live = hashCode(extractInputs(await loadNotebook(receipt.notebook), ids));
  const reran = await rerunNotebook(receipt.notebook);
  const states = cellStates(reran, ids);

  const checks: Checks = {
    receiptMatchesRequest: keccak256(bytes) === request.requestHash,
    inputHashConsistent: inputHashIsConsistent(receipt),
    notebookStillMatches: live === receipt.codeHash,
    reran: Object.values(states).every(state => state === 'success'),
  };
  return { receipt, checks, states, rerunAt: ranAt(reran, ids) };
}

// =====================================
// ⬢ Validate
// =====================================
async function main() {
  const { account, client } = wallet('VALIDATOR_PRIVATE_KEY');
  const request = await findRequest(account.address, process.argv[2] as Hex | undefined);
  const { receipt, checks, states, rerunAt } = await check(request);
  const response = score(checks);

  // What the validator saw, for information. The verdict rests on the checks only.
  const report = encode({
    type: REPORT_TYPE,
    requestHash: request.requestHash,
    agentId: request.agentId.toString(),
    inputHash: receipt.inputHash,
    checks,
    originalRanAt: receipt.ranAt,
    rerunAt,
    observed: states,
    validatedAt: new Date().toISOString(),
  });
  const responseURI = await publish(report.bytes, `sandworm-validation-${request.requestHash.slice(2, 10)}.json`);

  const chain = publicClient();
  const { request: tx } = await chain.simulateContract({
    account,
    address: REGISTRIES.validation,
    abi: VALIDATION_ABI,
    functionName: 'validationResponse',
    args: [request.requestHash, response, responseURI, report.requestHash, TAG],
  });
  const hash = await client.writeContract(tx);
  await chain.waitForTransactionReceipt({ hash });

  saveState({ validationTx: hash });
  console.log(`Checks: ${JSON.stringify(checks)}`);
  console.log(`Response ${response} posted by ${account.address}`);
  console.log(`  tx ${txUrl(hash)}`);
}

await main();
