import { CONTAINER_ID_BOOKS } from "../../constants"
import HttpError from "../../errors/HttpError"
import Book, { BookData } from "../../models/Book"
import { CacheManager, CacheSubject } from "./CacheManager"
import Cosmos from "./Cosmos"
import Logger from "../logging/Logger"

/**
 * Manages the lifecycle and caching of book resources.
 */
class BookManager {
  private static instance: BookManager
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
   * Retrieve the singleton instance of the BookManager.
   * 
   * @returns The single instance of the BookManager.
   */
  private static getInstance() {
    if (!BookManager.instance) {
      BookManager.instance = new BookManager()
    }

    return BookManager.instance
  }

  /**
   * Fetches a book by its ID, first looking in cache, and if not found, retrieving from Cosmos.
   * 
   * @param bookId - The unique ID of the book to fetch.
   * 
   * @returns The book resource.
   * 
   * @throws Throws an HttpError if the book is not found.
   */
  public static async getBookById(bookId: string) {
    const instance = BookManager.getInstance()

    const cacheKey = `book_${bookId}`

    const cachedBook = instance.cacheManager.getCacheItem(cacheKey)

    if (cachedBook) {
      return cachedBook
    } else {
      try {
        const resource = await Cosmos.read(CONTAINER_ID_BOOKS, bookId)
  
        if (resource) {
          const book = new Book(resource)
    
          instance.cacheSubject.notifyCacheUpdate(cacheKey, book)
  
          return book
        }

        throw new HttpError(404, `Book with id "${bookId}" not found`)
      } catch (error) {
        Logger.error(error)

        throw error
      }
    }
  }

  /**
   * Creates a new book resource in Cosmos and updates the cache.
   * 
   * @param bookData - The data of the book to be created.
   * 
   * @returns The created book resource.
   * 
   * @throws Throws an HttpError if there's an unexpected error.
   */
  public static async createBook(bookData: BookData) {
    try {
      const resource = await Cosmos.create(CONTAINER_ID_BOOKS, bookData)

      if (resource) {
        const instance = BookManager.getInstance()

        const book = new Book(resource)
        const cacheKey = `book_${book.id}`

        instance.cacheSubject.notifyCacheUpdate(cacheKey, book)

        return book
      }
    } catch (error) {
      Logger.error(error)

      throw error
    }

    throw new HttpError(500, 'Unexpected error')
  }

  /**
   * Fetches all book resources from Cosmos.
   * 
   * TODO: Determine if the result should be cached. 
   * TODO: Implement pagination.
   * 
   * @returns An array of book resources.
   */
  public static async getAllBooks() {
    try {
      const resources = await Cosmos.readAll(CONTAINER_ID_BOOKS)
  
      if (resources) {
        const books = resources.map(resource => new Book(resource))
      
        return books
      }
    
      return []
    } catch (error) {
      Logger.error(error)

      throw error
    }
  }
}

export default BookManager