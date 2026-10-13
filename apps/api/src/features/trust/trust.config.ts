import { ServiceUnavailableException } from '@nestjs/common';
import { walletFrom, type TrustWallet } from '@sandworm/trust';

// The wallets that sign attestations, from the environment. The two must differ:
// a validator that is the agent checks nothing.
export type TrustSigners = { agent: TrustWallet; validator: TrustWallet; agentId: bigint };

export function trustSigners(): TrustSigners {
  const { TRUST_AGENT_PRIVATE_KEY, TRUST_VALIDATOR_PRIVATE_KEY, TRUST_AGENT_ID } = process.env;
  if (!TRUST_AGENT_PRIVATE_KEY || !TRUST_VALIDATOR_PRIVATE_KEY || !TRUST_AGENT_ID) {
    throw new ServiceUnavailableException('Onchain attestation is not set up on this server');
  }
  const agent = walletFrom(TRUST_AGENT_PRIVATE_KEY);
  const validator = walletFrom(TRUST_VALIDATOR_PRIVATE_KEY);
  if (agent.account.address === validator.account.address) {
    throw new ServiceUnavailableException('The agent and the validator must be different wallets');
  }
  return { agent, validator, agentId: BigInt(TRUST_AGENT_ID) };
}

// Whose verdicts count. TRUST_VALIDATORS lists extra addresses, so a bounty can accept an
// outside validator; this server's own validator is always included when it has one.
export function trustedValidators(): Set<string> {
  const listed = (process.env.TRUST_VALIDATORS ?? '')
    .split(',')
    .map(address => address.trim().toLowerCase())
    .filter(Boolean);
  const own = process.env.TRUST_VALIDATOR_PRIVATE_KEY ? [trustSigners().validator.account.address.toLowerCase()] : [];
  return new Set([...listed, ...own]);
}
