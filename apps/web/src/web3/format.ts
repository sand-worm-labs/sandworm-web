import { formatUnits } from "viem";

export const shortAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const formatToken = (amount: bigint, decimals: number) => {
  const [whole = "0", fraction = ""] = formatUnits(amount, decimals).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${grouped}.${fraction}` : grouped;
};

export const formatDate = (unixSeconds: number | bigint) =>
  new Date(Number(unixSeconds) * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
