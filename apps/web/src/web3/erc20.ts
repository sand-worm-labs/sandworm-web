import { erc20Abi, parseAbi } from "viem";

export const permitAbi = parseAbi([
  "function name() view returns (string)",
  "function nonces(address owner) view returns (uint256)",
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
]);

export { erc20Abi };
