// Classic "Ethereum blockies" identicon — the same deterministic seeded-PRNG
// pixel-art algorithm used by MetaMask, scaffold-eth's <Address> component
// (what ABI Ninja is built on), and most wallet UIs. Implemented locally
// (no npm dependency, no network call) since it's a pure rendering
// algorithm with no cryptographic correctness at stake — a plain visual
// seeded from the address string, purely client-side.

const SIZE = 8;
const SCALE = 4;

function seedRand(seed: string): () => number {
  let randseed = new Array(4).fill(0);
  for (let i = 0; i < seed.length; i++) {
    randseed[i % 4] = (randseed[i % 4] << 5) - randseed[i % 4] + seed.charCodeAt(i);
    randseed[i % 4] = randseed[i % 4] & 0xffffffff;
  }
  return () => {
    const t = randseed[0] ^ (randseed[0] << 11);
    randseed[0] = randseed[1];
    randseed[1] = randseed[2];
    randseed[2] = randseed[3];
    randseed[3] = randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8);
    return (randseed[3] >>> 0) / 0xffffffff;
  };
}

function createColor(rand: () => number): string {
  const h = Math.floor(rand() * 360);
  const s = rand() * 60 + 40;
  const l = (rand() + rand() + rand() + rand()) * 25;
  return `hsl(${h},${s}%,${l}%)`;
}

/** Deterministic identicon for an address, as a data: URI PNG. */
export function blockieDataUri(address: string): string {
  const rand = seedRand(address.toLowerCase());
  const bgColor = createColor(rand);
  const color = createColor(rand);
  const spotColor = createColor(rand);

  // Left half + mirrored right half, per the standard algorithm.
  const data: number[][] = [];
  for (let x = 0; x < SIZE / 2; x++) {
    const column: number[] = [];
    for (let y = 0; y < SIZE; y++) column.push(Math.floor(rand() * 2.3));
    data[x] = column;
    data[SIZE - 1 - x] = column;
  }

  const canvas = document.createElement("canvas");
  canvas.width = SIZE * SCALE;
  canvas.height = SIZE * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      const value = data[x]![y];
      if (value === 0) continue;
      ctx.fillStyle = value === 1 ? color : spotColor;
      ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    }
  }

  return canvas.toDataURL("image/png");
}
