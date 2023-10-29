/**
 * DEFAULT SETTINGS
 */

/**
 * The ID of the Cosmos DB database used for the Book Review Application.
 * Defaults to 'book_review_app' if not provided in the environment.
 */
export const DATABASE_ID = process.env.COSMOS_DATABASE || 'book_review_app'
/**
 * The default size of the cache for caching frequently accessed items.
 * Set to 1000 items by default.
 */
export const DEFAULT_CACHE_SIZE = 1000


/**
 * COSMOS CONTAINER IDENTIFIERS
 */

/**
 * The ID of the container storing book data in Cosmos DB.
 */
export const CONTAINER_ID_BOOKS = 'books'
/**
 * The ID of the container storing book review data in Cosmos DB.
 */
export const CONTAINER_ID_REVIEWS = 'reviews'
