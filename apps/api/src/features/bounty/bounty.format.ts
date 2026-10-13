// How bounty amounts, places and wallets are written out for people.

export const formatAmount = (amount: string) =>
  Number(amount).toLocaleString('en-US', { maximumFractionDigits: 6 });

export const shortAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export const ordinal = (n: number) => {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
};
