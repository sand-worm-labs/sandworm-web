// Step 3: from the agent's wallet, ask the validator to check the receipt.

import type { Address, Hex } from 'viem';

import { publicClient, txUrl, VALIDATION_ABI, wallet } from '../src/chain.ts';
import { optional, REGISTRIES } from '../src/config.ts';
import { loadState, need, saveState } from './state.ts';

// =====================================
// ⬢ Validator address
// =====================================
// Only the address is needed here, so the validator's key can stay with the validator.
function validatorAddress(): Address {
  const address = optional('VALIDATOR_ADDRESS');
  if (address) return address as Address;
  return wallet('VALIDATOR_PRIVATE_KEY').account.address;
}

// =====================================
// ⬢ Request
// =====================================
async function main() {
  const state = loadState();
  const agentId = BigInt(need(state, 'agentId', 'register-agent'));
  const receiptURI = need(state, 'receiptURI', 'build-receipt');
  const requestHash = need(state, 'requestHash', 'build-receipt') as Hex;
  const validator = validatorAddress();

  const { account, client } = wallet('AGENT_PRIVATE_KEY');
  const chain = publicClient();
  const { request } = await chain.simulateContract({
    account,
    address: REGISTRIES.validation,
    abi: VALIDATION_ABI,
    functionName: 'validationRequest',
    args: [validator, agentId, receiptURI, requestHash],
  });
  const hash = await client.writeContract(request);
  const receipt = await chain.waitForTransactionReceipt({ hash });

  saveState({ requestTx: hash, requestBlock: receipt.blockNumber.toString() });
  console.log(`Validation requested from ${validator} for agent ${agentId}`);
  console.log(`  tx ${txUrl(hash)}`);
}

await main();
