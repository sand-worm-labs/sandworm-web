import { BaseError, ContractFunctionRevertedError } from "viem";

const REVERTS: Record<string, string> = {
  TokenNotAllowed: "This token is not accepted by the escrow.",
  InvalidAmount: "The amount must be greater than zero.",
  InvalidDeadline: "The deadline must be in the future.",
  InvalidAddress: "One of the addresses is not valid.",
  UnknownBounty: "This bounty is not in the escrow.",
  BountyClosed: "This bounty is already closed.",
  NotAuthorized: "This wallet is not allowed to do that.",
  TooEarly:
    "It is too early to do that. Check the deadline and judging period.",
  LengthMismatch: "Winners and amounts do not match.",
  TooManyWinners: "An award can have at most 50 winners.",
  ExceedsRemaining: "That is more than what is left in the escrow.",
};

export const describeError = (error: unknown): string => {
  if (!(error instanceof BaseError)) {
    return error instanceof Error ? error.message : "Something went wrong.";
  }

  const revert = error.walk(
    inner => inner instanceof ContractFunctionRevertedError
  );
  if (revert instanceof ContractFunctionRevertedError) {
    const name = revert.data?.errorName;
    if (name && REVERTS[name]) return REVERTS[name];
  }

  if (
    error.name === "UserRejectedRequestError" ||
    /user rejected/i.test(error.message)
  ) {
    return "You cancelled the request in your wallet.";
  }
  if (/insufficient funds/i.test(error.message)) {
    return "Not enough gas in this wallet to send the transaction.";
  }
  return error.shortMessage || "The transaction failed.";
};
