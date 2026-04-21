export const LOCK_CONFIG = {
    EXPIRATION_TIME: 30_000,   // 30s — locks held that long are edge cases anyway
    RETRY_TIMEOUT: 200,        // 200ms — fast retry, pubsub wake handles most cases
    NUM_PARTITIONS: 32,
} as const;