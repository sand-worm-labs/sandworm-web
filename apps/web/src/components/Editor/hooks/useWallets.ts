import { useCallback, useMemo } from "react";

import {
  useUpdateWalletsMutation,
  useCurrentUserQuery as useGetCurrentUserQuery,
  type WalletInput,
} from "@/generated/graphql";

type UseWalletsReturn = {
  wallets: WalletInput[];
  addWallets: (wallets: WalletInput[]) => Promise<void>;
  deleteWallet: (address: string, chain: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
};

export const useWallets = (): UseWalletsReturn => {
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useGetCurrentUserQuery({ fetchPolicy: "cache-and-network" });

  const [
    updateWalletsMutation,
    { loading: updateLoading, error: updateError },
  ] = useUpdateWalletsMutation();

  const addWallets = useCallback(
    async (wallets: WalletInput[]) => {
      await updateWalletsMutation({ variables: { wallets } });
      await refetch();
    },
    [updateWalletsMutation, refetch]
  );

  const deleteWallet = useCallback(
    async (address: string, chain: string) => {
      const remaining = (data?.currentUser.user.settings?.wallets ?? []).filter(
        w => !(w.address === address && w.chain === chain)
      );
      await updateWalletsMutation({ variables: { wallets: remaining } });
      await refetch();
    },
    [updateWalletsMutation, data, refetch]
  );

  return useMemo(
    () => ({
      wallets: data?.currentUser.user.settings?.wallets ?? [],
      addWallets,
      deleteWallet,
      loading: queryLoading || updateLoading,
      error: (queryError || updateError) as Error | null,
    }),
    [
      data,
      addWallets,
      deleteWallet,
      queryLoading,
      updateLoading,

      queryError,
      updateError,
    ]
  );
};
