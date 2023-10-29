/**
 * Represents a node in a doubly-linked list structure.
 * Used for keeping track of the cache order in the LRUCache class.
 */
class Node {
  /** Key identifier for the node */
  key: string
  /** Data value stored in the node */
  value: any
  /** Reference to the previous node in the list or null if it's the first node */
  prev: Node | null = null
  /** Reference to the next node in the list or null if it's the last node */
  next: Node | null = null

  /**
   * Creates a new Node instance.
   * @param key - The key identifier for the node.
   * @param value - The data value to be stored in the node.
   */
  constructor(key: string, value: any) {
    this.key = key
    this.value = value
  }
}

/**
 * Represents a Least Recently Used (LRU) cache.
 * The cache will remove the least recently accessed item when the capacity is reached.
 */
export class LRUCache {
  /** The maximum number of items the cache can hold */
  private capacity: number
  /** A map for quick access to cache items using their key */
  private cache: Map<string, Node> = new Map()
  /** Reference to the first (oldest) node in the cache or null if the cache is empty */
  private head: Node | null = null
  /** Reference to the last (newest) node in the cache or null if the cache is empty */
  private tail: Node | null = null

  /**
   * Creates a new LRUCache instance.
   * 
   * @param capacity - The maximum number of items the cache can hold.
   */
  constructor(capacity: number) {
    this.capacity = capacity
  }

  /**
   * Fetches a value from the cache using its key.
   * 
   * @param key - The key of the item to fetch.
   * @returns The item value if it exists, or null otherwise.
   */
  get(key: string): any {
    const node = this.cache.get(key)
    if (!node) return null

    this.remove(node)
    this.addToFront(node)
  
    return node.value
  }

  /**
   * Adds or updates a value in the cache.
   * If the cache exceeds its capacity, the least recently used item will be evicted.
   * 
   * @param key - The key of the item.
   * @param value - The value to be stored or updated.
   */
  put(key: string, value: any): void {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!
      node.value = value
      this.remove(node)
      this.addToFront(node)
    } else {
      const newNode = new Node(key, value);
      if (this.cache.size >= this.capacity) {
        if (this.tail) {
          this.cache.delete(this.tail.key)
          this.remove(this.tail)
        }
      }
      this.addToFront(newNode);
      this.cache.set(key, newNode);
    }
  }

  /**
   * Removes an item from the cache using its key.
   * 
   * @param key - The key of the item to remove.
   */
  delete(key: string): void {
    const node = this.cache.get(key)
    if (node) {
      this.remove(node)
      this.cache.delete(key)
    }
  }

  /**
   * Removes the specified node from the internal doubly-linked list.
   * 
   * @param node - The node to remove.
   */
  private remove(node: Node): void {
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }
  }

  /**
   * Adds the specified node to the front of the internal doubly-linked list.
   * 
   * @param node - The node to add to the front.
   */
  private addToFront(node: Node): void {
    node.next = this.head
    node.prev = null

    if (this.head) {
      this.head.prev = node
    }
    this.head = node

    if (!this.tail) {
      this.tail = node
    }
  }
}