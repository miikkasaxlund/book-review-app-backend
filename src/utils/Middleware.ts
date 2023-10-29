import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import Logger from "./logging/Logger"

/**
 * Represents a middleware function that processes HTTP requests.
 */
export type MiddlewareFunction = (request: HttpRequest, context: InvocationContext, next: any) => Promise<any>

/**
 * Class representing a Middleware to process HTTP requests.
 * Each middleware has a unique ID and can execute a specific action in the processing chain.
 */
class Middleware {
  /** Unique key for the middleware instance. */
  public key: string
  /** Function that defines the actual logic of the middleware. */
  private callback: MiddlewareFunction

  /**
   * Constructs a new middleware.
   *
   * @param key - Unique key for the middleware.
   * @param callback - Function representing the middleware logic.
   */
  constructor(middlewareId: string, callback: MiddlewareFunction) {
    this.key = middlewareId
    this.callback = callback
  }

  /**
   * Executes the middleware's logic.
   *
   * @param request - The incoming HTTP request.
   * @param context - The invocation context from Azure functions.
   * @param next - Function to invoke the next middleware or error handler.
   *
   * @returns Response data if any, otherwise void.
   */
  public async run(request: HttpRequest, context: InvocationContext, next: (error?: unknown) => Promise<void>): Promise<void | HttpResponseInit> {
    const logger = Logger.create(context)
    
    logger.info(`Middleware '${this.key}' triggered. Path: ${request.url}, Method: ${request.method}`)

    try {
      return await this.callback(request, context, next)
      
    } catch (error) {
      logger.error(`Error occurred in middleware '${this.key}'. Error: ${error.message}`)

      throw error
    }
  }
}

export default Middleware
