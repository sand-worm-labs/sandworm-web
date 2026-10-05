"use client";

import {
  bountyEscrowAbi,
  bountyRef,
  escrowAddressFor,
  escrowTokens,
} from "@sandworm/types/escrow";
import { useCallback, useState } from "react";
import {
  getTypesForEIP712Domain,
  hashDomain,
  parseSignature,
  parseUnits,
  type Hash,
} from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { useConfirmBountyFundingMutation } from "@/generated/graphql";

import { targetChains } from "../config";
import { erc20Abi, permitAbi } from "../erc20";

import { useTx } from "./useTx";

// =====================================
// ⬢ Types
// =====================================
export type FundStep =
  | "idle"
  | "approving"
  | "depositing"
  | "confirming"
  | "done";

type FundArgs = {
  slug: string;
  chainId: number;
  tokenSymbol: string;
  amount: string;
  deadline: Date;
};

type PermitDomain = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
};

const CONFIRM_ATTEMPTS = 5;
const permitTypes = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

// Permit is used only when the token's own domain separator matches what we
// would sign, so a wrong guess can never produce an invalid signature.
const findPermitDomain = async (
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  token: `0x${string}`,
  chainId: number
) => {
  try {
    const [name, separator] = await Promise.all([
      publicClient.readContract({
        address: token,
        abi: permitAbi,
        functionName: "name",
      }),
      publicClient.readContract({
        address: token,
        abi: permitAbi,
        functionName: "DOMAIN_SEPARATOR",
      }),
    ]);
    const domains: PermitDomain[] = ["1", "2"].map(version => ({
      name,
      version,
      chainId,
      verifyingContract: token,
    }));
    return (
      domains.find(
        domain =>
          hashDomain({
            domain,
            types: { EIP712Domain: getTypesForEIP712Domain({ domain }) },
          } as Parameters<typeof hashDomain>[0]) === separator
      ) ?? null
    );
  } catch {
    return null;
  }
};

// =====================================
// ⬢ useFundBounty
// =====================================
export const useFundBounty = (chainId: number) => {
  const { address: account } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const runTx = useTx();
  const [confirmMutation] = useConfirmBountyFundingMutation();
  const [step, setStep] = useState<FundStep>("idle");

  const confirm = useCallback(
    async (slug: string, txHash: string) => {
      setStep("confirming");
      const attempt = async (count: number): Promise<{ slug: string }> => {
        try {
          const { data } = await confirmMutation({
            variables: { slug, chainId, txHash },
          });
          if (!data?.confirmBountyFunding)
            throw new Error("No bounty returned");
          return data.confirmBountyFunding;
        } catch (error) {
          if (count >= CONFIRM_ATTEMPTS) throw error;
          await wait(2_000);
          return attempt(count + 1);
        }
      };
      const bounty = await attempt(1);
      setStep("done");
      return bounty;
    },
    [chainId, confirmMutation]
  );

  const fund = useCallback(
    async ({ slug, tokenSymbol, amount, deadline }: FundArgs) => {
      if (!walletClient || !publicClient || !account) {
        throw new Error("Connect your wallet first.");
      }
      const chain = targetChains.find(item => item.id === chainId);
      const escrow = escrowAddressFor(chainId);
      const token = escrowTokens[chainId]?.find(
        item => item.symbol === tokenSymbol
      );
      if (!chain || !escrow || !token) {
        throw new Error(
          "The escrow does not accept this token on this network."
        );
      }

      const units = parseUnits(amount, token.decimals);
      const unixDeadline = BigInt(Math.floor(deadline.getTime() / 1000));
      const ref = bountyRef(slug);

      const [balance, allowance] = await Promise.all([
        publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [account],
        }),
        publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account, escrow],
        }),
      ]);
      if (balance < units) {
        throw new Error(`You need ${amount} ${token.symbol} in this wallet.`);
      }

      let receipt;
      try {
        if (allowance < units) {
          const domain = await findPermitDomain(
            publicClient,
            token.address,
            chainId
          );
          if (domain) {
            setStep("depositing");
            const nonce = await publicClient.readContract({
              address: token.address,
              abi: permitAbi,
              functionName: "nonces",
              args: [account],
            });
            const permitDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
            const signature = await walletClient.signTypedData({
              account,
              domain,
              types: permitTypes,
              primaryType: "Permit",
              message: {
                owner: account,
                spender: escrow,
                value: units,
                nonce,
                deadline: permitDeadline,
              },
            });
            const { r, s, v, yParity } = parseSignature(signature);
            receipt = await runTx("Fund escrow", chain, publicClient, () =>
              walletClient.writeContract({
                account,
                chain,
                address: escrow,
                abi: bountyEscrowAbi,
                functionName: "createBountyWithPermit",
                args: [
                  token.address,
                  units,
                  unixDeadline,
                  ref,
                  permitDeadline,
                  Number(v ?? BigInt(27) + BigInt(yParity ?? 0)),
                  r,
                  s,
                ],
              })
            );
          } else {
            setStep("approving");
            await runTx(`Approve ${token.symbol}`, chain, publicClient, () =>
              walletClient.writeContract({
                account,
                chain,
                address: token.address,
                abi: erc20Abi,
                functionName: "approve",
                args: [escrow, units],
              })
            );
          }
        }

        if (!receipt) {
          setStep("depositing");
          receipt = await runTx("Fund escrow", chain, publicClient, () =>
            walletClient.writeContract({
              account,
              chain,
              address: escrow,
              abi: bountyEscrowAbi,
              functionName: "createBounty",
              args: [token.address, units, unixDeadline, ref],
            })
          );
        }
      } catch (error) {
        setStep("idle");
        throw error;
      }

      return confirm(slug, receipt.transactionHash);
    },
    [account, chainId, confirm, publicClient, runTx, walletClient]
  );

  return { fund, confirm, step };
};

export type { Hash };
