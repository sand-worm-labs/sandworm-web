// Canonical JSON and hashing. The same value always gives the same bytes and hash,
// whoever builds it, so two parties can check they mean the same thing.

import { keccak256, stringToBytes, type Hex } from 'viem';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

// =====================================
// ⬢ Normalising
// =====================================
// Line endings and edge whitespace differ between editors; the code does not.
export const normalizeText = (text: string): string => text.replace(/\r\n?/g, '\n').trim();

function sortKeys(value: Json): Json {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, sortKeys(value[key] as Json)]),
    );
  }
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Cannot hash NaN or Infinity');
  return value;
}

// =====================================
// ⬢ Canonical form
// =====================================
// Sorted keys, no whitespace. Arrays keep their order: a cell list has one.
export const canonicalJson = (value: Json): string => JSON.stringify(sortKeys(value));

export const keccakText = (text: string): Hex => keccak256(stringToBytes(text));

export const hashCanonical = (value: Json): Hex => keccakText(canonicalJson(value));
