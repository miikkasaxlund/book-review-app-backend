import { CONTAINER_ID_REVIEWS } from "../../constants"
import HttpError from "../../errors/HttpError"
import Book from "../../models/Book"
import { CacheManager, CacheSubject } from "./CacheManager"
import Cosmos from "./Cosmos"
import Logger from "../logging/Logger"
import Review, { ReviewData } from "../../models/Review"
import BookManager from "./BookManager"

/**
 * Manages the lifecycle and caching of review resources.
 */
class ReviewManager {
  private static instance: ReviewManager
  private cacheSubject: CacheSubject
  private cacheManager: CacheManager

  /**
   * Private constructor to ensure singleton pattern.
   */
  private constructor() {
    this.cacheSubject = new CacheSubject()
    this.cacheManager = new CacheManager()
    this.cacheSubject.addObserver(this.cacheManager)
  }

  /**
   * Retrieve the singleton instance of the ReviewManager.
   * 
   * @returns The single instance of the ReviewManager.
   */
  private static getInstance() {
    if (!ReviewManager.instance) {
      ReviewManager.instance = new ReviewManager()
    }

    return ReviewManager.instance
  }

  /**
   * Creates a new review resource in Cosmos and updates the cache.
   * 
   * @param reviewData - The data of the review to be created.
   * 
   * @returns The created review resource.
   * 
   * @throws Throws an HttpError if there's an unexpected error.
   */
  public static async createReview(reviewData: ReviewData) {
    try {
      const book = await BookManager.getBookById(reviewData.bookId)

      if (!book) throw new HttpError(404, 'Book not found')

      const resource = await Cosmos.create(CONTAINER_ID_REVIEWS, reviewData)

      if (resource) {
        const instance = ReviewManager.getInstance()

        const review = new Review(resource)
        const cacheKey = `review_${review.id}`

        instance.cacheSubject.notifyCacheUpdate(cacheKey, review)

        return review
      }
    } catch (error) {
      Logger.error(error)

      throw error
    }

    throw new HttpError(500, 'Unexpected error')
  }

  public static async removeReview(reviewId: string) {
    try {
      const instance = ReviewManager.getInstance()
      const cacheKey = `review_${reviewId}`

      const review = await ReviewManager.getReviewById(reviewId)

      if (!review) throw new HttpError(404, `Review with id "${reviewId}" not found`)

      await Cosmos.delete(CONTAINER_ID_REVIEWS, reviewId)
  
      await instance.cacheManager.invalidateCacheItem(cacheKey)
    } catch (error) {
      Logger.error(error)

      throw error
    }
  }

  public static async getReviewById(reviewId: string) {
    const instance = ReviewManager.getInstance()

    const cacheKey = `review_${reviewId}`

    const cachedReview = await instance.cacheManager.getCacheItem(cacheKey)

    if (cachedReview) {
      return cachedReview
    } else {
      try {
        const resource = await Cosmos.read(CONTAINER_ID_REVIEWS, reviewId)
  
        if (resource) {
          const review = new Review(resource)
    
          instance.cacheSubject.notifyCacheUpdate(cacheKey, review)
  
          return review
        }

        throw new HttpError(404, `Review with id "${reviewId}" not found`)
      } catch (error) {
        Logger.error(error)

        throw error
      }
    }
  }

  public static async getAllReviews() {
    try {
      const resources = await Cosmos.readAll(CONTAINER_ID_REVIEWS)
  
      if (resources) {
        const reviews = resources.map(resource => new Review(resource))
      
        return reviews
      }
    
      return []
    } catch (error) {
      Logger.error(error)

      throw error
    }
  }

  /**
   * Fetches book reviews from Cosmos.
   * 
   * TODO: Determine if the result should be cached. 
   * TODO: Implement pagination.
   * 
   * @returns An array of book review resources.
   */
  public static async getReviewsByBookId(bookId: string) {
    try {
      const book = await BookManager.getBookById(bookId)

      if (!book) throw new HttpError(404, 'Book not found')

      const resources = await Cosmos.query(CONTAINER_ID_REVIEWS, {
        query: `SELECT * FROM c WHERE c.bookId = @bookId`,
        parameters: [
          { name: '@bookId', value: bookId }
        ]
      })
  
  
      if (resources) {
        const reviews: Review[] = resources.map(resource => new Review(resource))
      
        return reviews
      }
    
      return []
    } catch (error) {
      Logger.error(error)

      throw error
    }
  }
}

export default ReviewManager