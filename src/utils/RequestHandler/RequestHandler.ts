import { HttpHandler, HttpRequest, HttpResponse, HttpResponseInit, InvocationContext } from "@azure/functions"
import Middleware from "../Middleware"
import { RequestHandlerSubject } from "./RequestObserver"
import RequestLoggerObserver from "./observers/RequestLoggerObserver"
import RequestErrorHandler from "./RequestErrorHandler"
import defaultErrorHandler from "../../middleware/defaultErrorHandler"
import Logger from "../logging/Logger"

/**
 * A class responsible for handling HTTP requests, processing them through middleware, and responding.
 */
class RequestHandler extends RequestHandlerSubject {
  /** Unique identifier for the request handler. */
  public id: string
  /** Collection of middleware to be executed. */
  private middleware: Middleware[]
  /** Custom error handler function. */
  private errorHandler: RequestErrorHandler

  /**
   * Constructs a new request handler.
   * 
   * @param id - The unique identifier for the request handler.
   * @param errorHandler - Optional error handler function.
   */
  constructor(id: string, errorHandler: RequestErrorHandler = defaultErrorHandler) {
    super()

    this.id = id
    this.middleware = []
    this.errorHandler = errorHandler

    this.httpTrigger = this.httpTrigger.bind(this)
  }

  /**
   * Core method for handling a request, processing it through middleware, and responding.
   * 
   * @param request - The incoming HTTP request.
   * @param context - The invocation context from Azure functions.
   * 
   * @returns The HTTP response object.
   */
  public async httpTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit | HttpResponse> {
    const logger = Logger.create(context)
    const loggerObserver = new RequestLoggerObserver(logger)

    this.addObserver(loggerObserver)

    this.notifyRequestReceived(request, context)

    let response: HttpResponseInit
    let index = 0

    try {
      const next = async (err?: unknown): Promise<void> => {
        // If error is passed as a parameter, exit middleware chain invocation
        if (err) {
          this.notifyErrorOccurred(err, request, context)
          response = await this.errorHandler.run(err, request, context)

          return
        }

        if (index < this.middleware.length) {
          const middleware = this.middleware[index]
          index++
          response = (await middleware.run(request, context, next)) || response
        }
      }

      await next()
    } catch (error) {
      this.notifyErrorOccurred(error, request, context)
      response = await this.errorHandler.run(error, request, context)
    }

    const httpResponse = new HttpResponse(response)

    this.notifyResponseSent(httpResponse, request, context)

    this.removeObserver(loggerObserver)
    Logger.destroy(context)

    return httpResponse
  }

  /**
   * Adds a middleware to the middleware collection.
   * 
   * @remark If a HttpHandler is passed, it will be converted to a middleware automatically.
   * 
   * @param middleware - Middleware to be added.
   * 
   * @returns The current request handler instance for chaining.
   */
  public use(middleware: Middleware | HttpHandler) {
    if (middleware instanceof Middleware) {
      this.middleware.push(middleware)
    } else {
      // Convert HttpHandler to middleware
      const functionalMiddleware = new Middleware(
        `${this.id}_middleware_${this.middleware.length}`,
        async (request, context, next) => {
          try {
            const response = await middleware(request, context)

            return response
          } catch (err) {
            next(err)
          }
        }
      )
      
      this.middleware.push(functionalMiddleware)
    }

    return this
  }
}

export default RequestHandler
