// What one run of the scripts leaves behind for the next one, in out/state.json.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../out/state.json', import.meta.url);

export type State = {
  agentId?: string;
  registrationTx?: string;
  agentURI?: string;
  receiptURI?: string;
  requestHash?: string;
  inputHash?: string;
  requestTx?: string;
  requestBlock?: string;
  validationTx?: string;
};

export function loadState(): State {
  try {
    return JSON.parse(readFileSync(FILE, 'utf8')) as State;
  } catch {
    return {};
  }
}

// Merged, so each script adds to what the earlier ones saved.
export function saveState(patch: State): State {
  const next = { ...loadState(), ...patch };
  mkdirSync(new URL('../out/', import.meta.url), { recursive: true });
  writeFileSync(FILE, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

export function need<K extends keyof State>(state: State, key: K, script: string): NonNullable<State[K]> {
  const value = state[key];
  if (value === undefined) throw new Error(`out/state.json has no ${key}: run ${script} first`);
  return value as NonNullable<State[K]>;
}
