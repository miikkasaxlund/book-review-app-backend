import { DEFAULT_CACHE_SIZE } from "../../constants"
import { LRUCache } from "./LRUCache"
import { Mutex, MutexInterface } from 'async-mutex'

/**
 * An interface that defines methods for cache observers.
 */
export interface CacheObserver {
  /**
   * Updates a cache item based on its key with provided data.
   * 
   * @param key - Key of the cache item.
   * @param data - Data to update in the cache.
   */
  updateCacheItem(key: string, data: any): void
  /**
   * Invalidates (removes) a cache item based on its key.
   * 
   * @param key - Key of the cache item to invalidate.
   */
  invalidateCacheItem(key: string): void
}

/**
 * Manages cache operations using an LRU strategy.
 */
export class CacheManager {
  /** Internal cache instance which uses an LRU strategy. */
  private cache: LRUCache
  /** Mutexes for key-based locking to prevent race conditions during cache operations. */
  private mutexes: Map<string, MutexInterface> = new Map()

  /**
   * Creates a new CacheManager instance.
   * 
   * @param capacity - Maximum number of items the cache can hold. Defaults to DEFAULT_CACHE_SIZE.
   */
  constructor(capacity: number = DEFAULT_CACHE_SIZE) {
    this.cache = new LRUCache(capacity)
  }

  /**
   * Retrieves or initializes a mutex for a specific key.
   * 
   * @param key - Cache key to retrieve the mutex for.
   * 
   * @returns Mutex for the specified key.
   */
  private getMutexForKey(key: string) {
    if (!this.mutexes.has(key)) {
      this.mutexes.set(key, new Mutex())
    }

    return this.mutexes.get(key)!
  }

  /**
   * Retrieves a cache item based on its key.
   * 
   * @remark This operation is thread-safe using a mutex lock based on the key.
   * 
   * @param key - Key of the cache item to retrieve.
   * 
   * @returns The cached data, or null if not found.
   */
  public async getCacheItem(key: string): Promise<any> {
    const release = await this.getMutexForKey(key).acquire()

    try {
      return this.cache.get(key)
    } finally {
      release()
    }
  }

  /**
   * Updates or adds a cache item based on its key.
   * 
   * @remark This operation is thread-safe using a mutex lock based on the key.
   * 
   * @param key - Key of the cache item to update or add.
   * @param data - Data to update or add to the cache.
   */
  public async updateCacheItem(key: string, data: any): Promise<void> {
    const release = await this.getMutexForKey(key).acquire()

    try {
      return this.cache.put(key, data)
    } finally {
      release()
    }
  }

  /**
   * Invalidates (removes) a cache item based on its key.
   * 
   * @remark This operation is thread-safe using a mutex lock based on the key.
   * 
   * @param key - Key of the cache item to invalidate.
   */
  public async invalidateCacheItem(key: string): Promise<void> {
    const release = await this.getMutexForKey(key).acquire()

    try {
      this.cache.delete(key)
    } finally {
      release()
    }
  }
}

/**
 * Subject class that maintains a list of cache observers and notifies them of cache changes.
 */
export class CacheSubject {
  /** Array of observers watching for cache changes. */
  private observers: CacheObserver[] = []

  /**
   * Adds an observer to the list of observers.
   * 
   * @param observer - The observer to add.
   */
  addObserver(observer: CacheObserver): void {
    this.observers.push(observer)
  }

  /**
   * Removes an observer from the list of observers.
   * 
   * @param observer - The observer to remove.
   */
  removeObserver(observer: CacheObserver): void {
    const index = this.observers.indexOf(observer)

    if (index !== -1) {
        this.observers.splice(index, 1)
    }
  }

  /**
   * Notifies all observers about a cache update.
   * 
   * @param key - Key of the cache item that was updated.
   * @param data - Updated data.
   */
  notifyCacheUpdate(key: string, data: any): void {
    for (const observer of this.observers) {
      observer.updateCacheItem(key, data)
    }
  }

  /**
   * Notifies all observers about a cache invalidation.
   * 
   * @param key - Key of the cache item that was invalidated.
   */
  notifyCacheInvalidation(key: string): void {
    for (const observer of this.observers) {
      observer.invalidateCacheItem(key)
    }
  }
}