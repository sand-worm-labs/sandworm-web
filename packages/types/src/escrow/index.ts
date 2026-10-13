import { escrowDeployments } from "./deployments";

export { bountyEscrowAbi } from "./abi";
export { demoTokenAbi } from "./demoToken";
export { escrowDeployments };
export { escrowTokens, type EscrowToken } from "./tokens";
export { bountyRef } from "./ref";
export {
  BPS,
  DEFAULT_FEE_BPS,
  JUDGING_PERIOD_SECONDS,
  MAX_PRIZE_PLACES,
  MAX_WINNERS,
  assignPlaces,
  depositFor,
  escrowPhase,
  feeFor,
  grossFor,
  payoutFor,
  type EscrowPhase,
  type PaidAward,
} from "./rules";

export const escrowAddressFor = (chainId: number) => escrowDeployments[chainId];
