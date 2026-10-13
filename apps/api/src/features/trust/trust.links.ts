// Where to look at an attestation, as links. Kept free of imports: the models use it, and they
// must not pull in the chain and notebook code. The explorer and the identity registry are
// the ones packages/trust uses (Monad mainnet).

const EXPLORER = 'https://monadscan.com';
const IDENTITY_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export const txLink = (hash: string) => `${EXPLORER}/tx/${hash}`;

export const agentLink = (agentId: string) => `${EXPLORER}/token/${IDENTITY_REGISTRY}?a=${agentId}`;

// A receipt pinned to IPFS opens through a public gateway. One published as a data: URI has no page of its own.
export const receiptLink = (uri: string): string | null => (uri.startsWith('ipfs://') ? `${IPFS_GATEWAY}/${uri.slice(7)}` : null);
