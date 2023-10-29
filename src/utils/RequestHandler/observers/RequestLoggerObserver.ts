import { HttpRequest, HttpResponse, HttpResponseInit, InvocationContext } from "@azure/functions";
import { RequestObserver } from "../RequestObserver";
import winston from "winston";
import Logger from "../../logging/Logger";

/**
 * Observer that logs the lifecycle of a request using a provided Winston logger.
 * Implements the `RequestObserver` interface to handle request received, response sent, and errors occurred events.
 */
class RequestLoggerObserver implements RequestObserver {
  /** The Winston logger instance to be used for logging. */
  private logger: winston.Logger

  /**
   * Initializes a new instance of the `RequestLoggerObserver` class.
   * 
   * @param logger - The Winston logger instance to be used for logging.
   */
  constructor(logger: winston.Logger = Logger.get()) {
    this.logger = logger
  }

  /**
   * Logs when a request has been received.
   * 
   * @param request - The incoming HTTP request.
   * @param _context - The invocation context from Azure functions.
   */
  onRequestReceived(request: HttpRequest, _context: InvocationContext): void {
    this.logger.info(`Request received. Path: ${request.url}, Method: ${request.method}`)
  }

  /**
   * Logs when a response has been sent.
   * 
   * @param response - The HTTP response object or initialization object.
   * @param request - The original HTTP request.
   * @param _context - The invocation context from Azure functions.
   */
  onResponseSent(response: HttpResponseInit | HttpResponse, request: HttpRequest, _context: InvocationContext): void {
    this.logger.info(`Response sent. Path: ${request.url}, Method: ${request.method}, Status: ${response.status}`)
  }

  /**
   * Logs when an error occurs during request processing.
   * 
   * @param error - The error that occurred.
   * @param request - The original HTTP request.
   * @param _context - The invocation context from Azure functions.
   */
  onErrorOccurred(error: any, request: HttpRequest, _context: InvocationContext): void {
    this.logger.error(`Error occurred during request. Path: ${request.url}, Method: ${request.method}, Error: ${error.message}`)
  }
}

export default RequestLoggerObserver
