// Where to look at an attestation, as links. Kept free of imports: the models use it, and they
// must not pull in the chain and notebook code. The explorer and the identity registry are
// the ones packages/trust uses on each Monad network (see its config.ts), picked by
// TRUST_NETWORK the same way.

const NETWORKS = {
  mainnet: { explorer: 'https://monadscan.com', identityRegistry: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432' },
  testnet: {
    explorer: 'https://testnet.monadscan.com',
    identityRegistry: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
  },
};
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

const current = () => (process.env.TRUST_NETWORK?.trim().toLowerCase() === 'testnet' ? NETWORKS.testnet : NETWORKS.mainnet);

export const txLink = (hash: string) => `${current().explorer}/tx/${hash}`;

export const agentLink = (agentId: string) => `${current().explorer}/token/${current().identityRegistry}?a=${agentId}`;

// A receipt pinned to IPFS opens through a public gateway. One published as a data: URI has no page of its own.
export const receiptLink = (uri: string): string | null => (uri.startsWith('ipfs://') ? `${IPFS_GATEWAY}/${uri.slice(7)}` : null);
