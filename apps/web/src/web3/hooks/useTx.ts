"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { Chain, Hash, PublicClient } from "viem";

import { describeError } from "../errors";
import { explorerTxUrl } from "../config";

// =====================================
// ⬢ useTx
// =====================================
export const useTx = () =>
  useCallback(
    async (
      label: string,
      chain: Chain,
      publicClient: PublicClient,
      send: () => Promise<Hash>
    ) => {
      const id = toast.loading(`${label}: confirm in your wallet...`);
      try {
        const hash = await send();
        toast.loading(`${label}: waiting for the network...`, { id });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== "success")
          throw new Error("Transaction reverted");
        toast.success(`${label}: done`, {
          id,
          action: {
            label: "View",
            onClick: () => window.open(explorerTxUrl(chain, hash), "_blank"),
          },
        });
        return receipt;
      } catch (error) {
        toast.error(describeError(error), { id });
        throw error;
      }
    },
    []
  );
