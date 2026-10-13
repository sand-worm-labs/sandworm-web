// Step 5: print the links to show: the agent, the request and the response.

import type { Hex } from 'viem';

import { addressUrl, tokenUrl, txUrl } from '../src/chain.ts';
import { REGISTRIES } from '../src/config.ts';
import { loadState } from './state.ts';

// =====================================
// ⬢ Links
// =====================================
const state = loadState();

console.log(`Identity registry   ${addressUrl(REGISTRIES.identity)}`);
console.log(`Validation registry ${addressUrl(REGISTRIES.validation)}`);
if (state.agentId) console.log(`Agent ${state.agentId}             ${tokenUrl(REGISTRIES.identity, BigInt(state.agentId))}`);
if (state.registrationTx) console.log(`Registration tx     ${txUrl(state.registrationTx as Hex)}`);
if (state.requestTx) console.log(`Validation request  ${txUrl(state.requestTx as Hex)}`);
if (state.validationTx) console.log(`Validation response ${txUrl(state.validationTx as Hex)}`);
console.log('Agent explorer      https://erc-8004.quicknode.com (search the agent id)');
