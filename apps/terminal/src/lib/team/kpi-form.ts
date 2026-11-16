const MULTIPLIERS: Record<string, number> = {
  k: 1e3,
  m: 1e6,
  b: 1e9,
  t: 1e12,
};

// "Swap volume (USD)" -> "swap-volume-usd": a key a notebook or agent can name
export function slugifyKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

// What someone types for a reading: "1.84B", "$1,200", "34%", "-3.5k".
// Null when it isn't a number, so the form can say so.
export function parseKpiNumber(input: string): number | null {
  const text = input.trim().replace(/[$€£,\s%]/g, "");
  const match = /^(-?\d*\.?\d+)([kmbt])?$/i.exec(text);
  if (!match) return null;

  const [, digits, suffix] = match;
  const number =
    Number(digits) * (suffix ? MULTIPLIERS[suffix.toLowerCase()]! : 1);
  return Number.isFinite(number) ? number : null;
}
