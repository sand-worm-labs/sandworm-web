// Step 1: register Sandworm as an ERC-8004 agent on Monad and save its agentId.

import { parseEventLogs } from 'viem';

import { IDENTITY_ABI, publicClient, tokenUrl, txUrl, wallet } from '../src/chain.ts';
import { optional, REGISTRIES, required } from '../src/config.ts';
import { publish } from '../src/ipfs.ts';
import { encode } from '../src/receipt.ts';
import { loadState, saveState } from './state.ts';

// =====================================
// ⬢ Registration file
// =====================================
const registrationFile = () => ({
  type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
  name: optional('AGENT_NAME') ?? 'Sandworm',
  description:
    'Sandworm builds onchain analytics notebooks with AI. Each published finding carries a receipt of its exact inputs, which a second wallet can re-run and attest.',
  services: [{ name: 'MCP', endpoint: required('AGENT_MCP_ENDPOINT'), version: '2025-06-18' }],
  x402Support: false,
  active: true,
});

// =====================================
// ⬢ Register
// =====================================
async function main() {
  const existing = loadState();
  if (existing.agentId && !process.argv.includes('--force')) {
    console.log(`Already registered as agent ${existing.agentId}. Pass --force to register another.`);
    return;
  }

  const { bytes } = encode(registrationFile());
  const agentURI = await publish(bytes, 'sandworm-agent.json');
  const { account, client } = wallet('AGENT_PRIVATE_KEY');
  const chain = publicClient();

  const { request } = await chain.simulateContract({
    account,
    address: REGISTRIES.identity,
    abi: IDENTITY_ABI,
    functionName: 'register',
    args: [agentURI],
  });
  const hash = await client.writeContract(request);
  const receipt = await chain.waitForTransactionReceipt({ hash });

  const [registered] = parseEventLogs({ abi: IDENTITY_ABI, eventName: 'Registered', logs: receipt.logs });
  const agentId = (registered?.args as { agentId?: bigint } | undefined)?.agentId;
  if (agentId === undefined) throw new Error(`No Registered event in ${txUrl(hash)}`);

  saveState({ agentId: agentId.toString(), registrationTx: hash, agentURI });
  console.log(`Agent ${agentId} registered by ${account.address}`);
  console.log(`  tx    ${txUrl(hash)}`);
  console.log(`  agent ${tokenUrl(REGISTRIES.identity, agentId)}`);
}

await main();
