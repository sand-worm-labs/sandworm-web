export enum AIProvider {
  OPENROUTER = 'openrouter',
}

export const AI_ENV_KEYS = {
  [AIProvider.OPENROUTER]: 'OPENROUTER_API_KEY',
};

export const AI_ENV_HASH_KEYS: Record<AIProvider, string> = {
  [AIProvider.OPENROUTER]: 'OPENROUTER_API_KEY_HASH',
};