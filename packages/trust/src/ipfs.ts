// Publishing and fetching the files an onchain record points to. A file is pinned to
// IPFS through Pinata when PINATA_JWT is set; otherwise it travels as a data: URI,
// which is just as verifiable because the record also holds the file's hash.

import { optional } from './config.ts';

const PIN_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const DEFAULT_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

// =====================================
// ⬢ Publish
// =====================================
async function pin(bytes: Uint8Array, name: string, jwt: string): Promise<string> {
  const form = new FormData();
  form.append('file', new Blob([bytes as unknown as ArrayBuffer], { type: 'application/json' }), name);
  const res = await fetch(PIN_URL, { method: 'POST', headers: { Authorization: `Bearer ${jwt}` }, body: form });
  if (!res.ok) throw new Error(`Pinning ${name} failed: ${res.status} ${await res.text()}`);
  const { IpfsHash } = (await res.json()) as { IpfsHash: string };
  return `ipfs://${IpfsHash}`;
}

// The exact bytes are stored, never re-serialised, so the hash of what is fetched
// back is the hash of what was published.
export async function publish(bytes: Uint8Array, name: string): Promise<string> {
  const jwt = optional('PINATA_JWT');
  if (jwt) return pin(bytes, name, jwt);
  console.warn(`PINATA_JWT is not set: ${name} is published as a data: URI, not on IPFS.`);
  return `data:application/json;base64,${Buffer.from(bytes).toString('base64')}`;
}

// =====================================
// ⬢ Fetch
// =====================================
export async function fetchBytes(uri: string): Promise<Uint8Array> {
  if (uri.startsWith('data:')) {
    const [header, body = ''] = uri.slice(5).split(/,(.*)/s);
    return header?.includes(';base64') ? Buffer.from(body, 'base64') : Buffer.from(decodeURIComponent(body));
  }
  const gateway = (optional('IPFS_GATEWAY') ?? DEFAULT_GATEWAY).replace(/\/$/, '');
  const url = uri.startsWith('ipfs://') ? `${gateway}/${uri.slice(7)}` : uri;
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`Could not fetch ${uri}: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}
