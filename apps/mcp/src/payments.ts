import { chainId, TOKEN_CONTRACTS } from '@arbitrum/mpp/default';
import { charge } from '@arbitrum/mpp/server';
import { Mppx, Transport } from 'mppx/server';
import { privateKeyToAccount } from 'viem/accounts';

import type { Config } from './config.ts';
import type { ChargeOutcome } from './run-query.ts';

const NETWORKS = {
  'arbitrum-sepolia': { chainId: chainId.arbitrumSepolia, currency: TOKEN_CONTRACTS.USDC_ARBITRUM_SEPOLIA },
  'arbitrum-one': { chainId: chainId.arbitrumOne, currency: TOKEN_CONTRACTS.USDC_ARBITRUM_ONE },
} as const;

// Returns a function that checks one tool call's payment: unpaid calls get a
// challenge, paid calls get a receipt to attach to the result.
export function createCharge(config: Config): (extra: unknown) => Promise<ChargeOutcome> {
  const account = privateKeyToAccount(config.serverPrivateKey);
  const network = NETWORKS[config.network];

  const mppx = Mppx.create({
    methods: [
      charge({
        recipient: config.recipient ?? account.address,
        currency: network.currency,
        methodDetails: { chainId: network.chainId, decimals: 6 },
        account,
      }),
    ],
    secretKey: config.secretKey,
    // Carries the challenge/credential/receipt inside MCP messages instead of
    // HTTP headers, which is what MCP clients expect.
    transport: Transport.mcpSdk(),
  });

  return async extra => {
    const outcome = await mppx.charge({
      amount: config.price,
      description: 'Sandworm SQL query',
      // `authorization` (EIP-3009) needs no prior token approval, which is
      // the friction-free option for an agent paying for the first time.
      methodDetails: { chainId: network.chainId, credentialTypes: ['authorization'] },
    })(extra as never);

    return outcome as unknown as ChargeOutcome;
  };
}
