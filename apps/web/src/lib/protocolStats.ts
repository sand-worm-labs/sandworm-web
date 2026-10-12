// Live numbers for a protocol card on a Showcase page, from DefiLlama. They are read on the
// server and kept for an hour. A failed or slow call gives null, and the card shows without
// them: a number we could not fetch is left off, never guessed.
const LLAMA = "https://api.llama.fi";
const TIMEOUT_MS = 4000;
const REVALIDATE_SECONDS = 3600;

export type ProtocolStats = {
  // Value locked on the chain the page is about, in US dollars.
  tvl: number | null;
  // Protocol fees over the last 30 days, in US dollars.
  fees30d: number | null;
  category: string | null;
  description: string | null;
  website: string | null;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

// `slug` is the protocol's DefiLlama slug, which for the protocols on the Showcase is its name
// in lowercase; a protocol DefiLlama does not know gives null.
export async function fetchProtocolStats(
  slug: string,
  chain: string
): Promise<ProtocolStats | null> {
  const [protocol, fees] = await Promise.all([
    getJson<{
      currentChainTvls?: Record<string, number>;
      category?: string;
      description?: string;
      url?: string;
    }>(`${LLAMA}/protocol/${slug}`),
    getJson<{ total30d?: number }>(`${LLAMA}/summary/fees/${slug}`),
  ]);
  if (!protocol) return null;

  const tvl = protocol.currentChainTvls?.[chain];
  return {
    tvl: typeof tvl === "number" ? tvl : null,
    fees30d: typeof fees?.total30d === "number" ? fees.total30d : null,
    category: protocol.category ?? null,
    description: protocol.description ?? null,
    website: protocol.url ?? null,
  };
}

// =====================================
// ⬢  Profile
// =====================================
// A point of a series: unix seconds, and the value.
export type SeriesPoint = [number, number];

export type ProtocolProfile = ProtocolStats & {
  name: string;
  logo: string | null;
  twitter: string | null;
  // Value locked on the chain, daily.
  tvlHistory: SeriesPoint[];
  // Protocol fees, daily.
  feesHistory: SeriesPoint[];
  fees7d: number | null;
  feesAllTime: number | null;
  // What DefiLlama counts as fees for this protocol.
  feesMethodology: string | null;
};

// Everything a protocol's profile page draws: the stats of its card, plus the history behind
// them. A protocol DefiLlama does not know gives null.
export async function fetchProtocolProfile(
  slug: string,
  chain: string
): Promise<ProtocolProfile | null> {
  const [protocol, fees] = await Promise.all([
    getJson<{
      name?: string;
      logo?: string;
      twitter?: string;
      url?: string;
      category?: string;
      description?: string;
      currentChainTvls?: Record<string, number>;
      chainTvls?: Record<
        string,
        { tvl?: { date: number; totalLiquidityUSD: number }[] }
      >;
    }>(`${LLAMA}/protocol/${slug}`),
    getJson<{
      total7d?: number;
      total30d?: number;
      totalAllTime?: number;
      totalDataChart?: [number, number][];
      methodology?: { Fees?: string };
    }>(`${LLAMA}/summary/fees/${slug}`),
  ]);
  if (!protocol) return null;

  const tvl = protocol.currentChainTvls?.[chain];
  const history = protocol.chainTvls?.[chain]?.tvl ?? [];
  const number = (value: unknown) => (typeof value === "number" ? value : null);

  return {
    name: protocol.name ?? slug,
    logo: protocol.logo ?? null,
    twitter: protocol.twitter ?? null,
    tvl: number(tvl),
    fees30d: number(fees?.total30d),
    fees7d: number(fees?.total7d),
    feesAllTime: number(fees?.totalAllTime),
    category: protocol.category ?? null,
    description: protocol.description ?? null,
    website: protocol.url ?? null,
    tvlHistory: history.map(point => [point.date, point.totalLiquidityUSD]),
    feesHistory: fees?.totalDataChart ?? [],
    feesMethodology: fees?.methodology?.Fees ?? null,
  };
}

// $3.3M, $184K, $1.2B.
export function formatUsd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}
