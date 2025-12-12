export interface ILockService {
    /**
     * Acquire a distributed lock and execute a callback while holding it.
     * The lock is automatically released when the callback completes or throws.
     * 
     * @param key - Unique lock identifier
     * @param callback - Function to execute while holding the lock
     * @param options - Optional lock configuration
     * @returns Promise resolving to the callback's return value
     * @throws If unable to acquire lock within timeout
     */
    acquireLock<T>(
      key: string,
      callback: () => Promise<T>,
      options?: LockOptions
    ): Promise<T>
  
    /**
     * Try to acquire a lock without blocking
     * 
     * @param key - Unique lock identifier
     * @param options - Optional lock configuration
     * @returns Lock token if successful, null if lock is held by another process
     */
    tryAcquire(
      key: string,
      options?: LockOptions
    ): Promise<string | null>
  
    /**
     * Release a previously acquired lock
     * 
     * @param key - Unique lock identifier
     * @param token - Lock token returned from tryAcquire
     */
    release(key: string, token: string): Promise<void>
  
    /**
     * Extend the TTL of an existing lock
     * 
     * @param key - Unique lock identifier
     * @param token - Lock token
     * @param ttl - New TTL in milliseconds
     */
    extend(key: string, token: string, ttl: number): Promise<boolean>
  }
  
  export interface LockOptions {
    /**
     * Lock TTL in milliseconds (default: 30000)
     * Lock auto-expires after this duration to prevent deadlocks
     */
    ttl?: number
  
    /**
     * Maximum time to wait for lock acquisition in milliseconds (default: 10000)
     * Throws error if lock cannot be acquired within this time
     */
    acquireTimeout?: number
  
    /**
     * Retry interval when waiting for lock in milliseconds (default: 100)
     */
    retryInterval?: number
  
    /**
     * Whether to automatically extend lock while callback is running (default: false)
     */
    autoExtend?: boolean
  }