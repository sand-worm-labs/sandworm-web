import { keccak256, toBytes } from "viem";

export const bountyRef = (slug: string) => keccak256(toBytes(slug));
