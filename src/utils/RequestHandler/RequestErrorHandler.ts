import { HttpRequest, HttpResponse, HttpResponseInit, InvocationContext } from "@azure/functions"
import Logger from "../logging/Logger"

/**
 * Represents a custom error handler type.
 */
type RequestErrorHandlerFunction = (error: any, request: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit | HttpResponse>

/**
 * Class representing an RequestErrorHandler for processing HTTP request errors.
 * Each RequestErrorHandler has a unique ID and can execute a specific error-handling logic.
 */
class RequestErrorHandler {
  /** Unique key for the error handler instance. */
  public key: string
  /** Function that defines the actual error-handling logic of the ErrorHandler. */
  private callback: RequestErrorHandlerFunction

  /**
   * Constructs a new error handler.
   *
   * @param key - Unique key for the error handler.
   * @param callback - Function representing the error-handling logic.
   */
  constructor(key: string, callback: RequestErrorHandlerFunction) {
    this.key = key,
    this.callback = callback
  }

  /**
   * Executes the error handler's logic.
   *
   * @param error - The error that occurred during request processing.
   * @param request - The incoming HTTP request.
   * @param context - The invocation context from Azure functions.
   *
   * @returns A response object.
   */
  public async run(error: any, request: HttpRequest, context: InvocationContext) {
    const logger = Logger.create(context)

    logger.warn(`Error handler '${this.key}' triggered for request. Path: ${request.url}, Method: ${request.method}, Error: ${error.message}`)

    try {
      return await this.callback(error, request, context)
    } catch (handlerError) {
      logger.error(`Error handler '${this.key}' itself encountered an error: ${handlerError.message}`)

      return {
        status: 500,
        jsonBody: {
          message: 'Unexpected error occurred'
        }
      }
    }
  }
}

export default RequestErrorHandler
