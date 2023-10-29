import { HttpRequest, HttpResponse, HttpResponseInit, InvocationContext } from "@azure/functions"

/**
 * Represents an observer for monitoring and responding to various HTTP request-related events.
 */
export interface RequestObserver {
  /**
   * Called when a request is received.
   * 
   * @param request - The incoming HTTP request.
   * @param context - The invocation context from Azure functions.
   */
  onRequestReceived(request: HttpRequest, context: InvocationContext): void

  /**
   * Called when a response is sent.
   * 
   * @param response - The outgoing HTTP response or its initialization object.
   * @param request - The incoming HTTP request.
   * @param context - The invocation context from Azure functions.
   */
  onResponseSent(response: HttpResponseInit | HttpResponse, request: HttpRequest, context: InvocationContext): void

  /**
   * Called when an error occurs while handling a request.
   * 
   * @param error - The error that occurred.
   * @param request - The incoming HTTP request.
   * @param context - The invocation context from Azure functions.
   */
  onErrorOccurred(error: any, request: HttpRequest, context: InvocationContext): void
}

/**
 * Represents the subject in the Observer pattern, specifically for HTTP requests.
 * This allows for monitoring various events like receiving requests, sending responses, and errors.
 */
export class RequestHandlerSubject {
  /** Collection of observers monitoring the request events. */
  private observers: RequestObserver[] = []

  /**
   * Adds an observer to the collection.
   * 
   * @param observer - The observer to be added.
   */
  addObserver(observer: RequestObserver): void {
    this.observers.push(observer)
  }

  /**
   * Removes an observer from the collection.
   * @param observer - The observer to be removed.
   */
  removeObserver(observer: RequestObserver): void {
    const index = this.observers.indexOf(observer);

    if (index !== -1) {
        this.observers.splice(index, 1);
    }
  }

  /**
   * Notifies all observers that a request has been received.
   * 
   * @param request - The incoming HTTP request.
   * @param context - The invocation context from Azure functions.
   */
  notifyRequestReceived(request: HttpRequest, context: InvocationContext): void {
    for (const observer of this.observers) {
      observer.onRequestReceived(request, context)
    }
  }

  /**
   * Notifies all observers that a response has been sent.
   * 
   * @param response - The outgoing HTTP response or its initialization object.
   * @param request - The incoming HTTP request.
   * @param context - The invocation context from Azure functions.
   */
  notifyResponseSent(response: HttpResponseInit | HttpResponse, request: HttpRequest, context: InvocationContext): void {
    for (const observer of this.observers) {
      observer.onResponseSent(response, request, context)
    }
  }

  /**
   * Notifies all observers that an error occurred while handling a request.
   * 
   * @param error - The error that occurred.
   * @param request - The incoming HTTP request.
   * @param context - The invocation context from Azure functions.
   */
  notifyErrorOccurred(error: any, request: HttpRequest, context: InvocationContext): void {
    for (const observer of this.observers) {
      observer.onErrorOccurred(error, request, context)
    }
  }
}