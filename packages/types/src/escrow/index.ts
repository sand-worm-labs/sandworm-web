import { escrowDeployments } from "./deployments";

export { bountyEscrowAbi } from "./abi";
export { demoTokenAbi } from "./demoToken";
export { escrowDeployments };
export { escrowTokens, type EscrowToken } from "./tokens";
export { bountyRef } from "./ref";
export {
  BPS,
  JUDGING_PERIOD_SECONDS,
  MAX_WINNERS,
  escrowPhase,
  feeFor,
  payoutFor,
  type EscrowPhase,
} from "./rules";

export const escrowAddressFor = (chainId: number) => escrowDeployments[chainId];
