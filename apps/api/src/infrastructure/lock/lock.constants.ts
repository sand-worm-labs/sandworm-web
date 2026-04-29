export const LOCK_CONFIG = {
    EXPIRATION_TIME: 5000,   // 5s — locks held that long are edge cases anyway
    RETRY_TIMEOUT: 30000,        // 200ms — fast retry, pubsub wake handles most cases
    NUM_PARTITIONS: 32,
} as const;