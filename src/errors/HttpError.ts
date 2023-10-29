/**
 * Represents an HTTP error with a specific status code and message.
 * 
 * This class extends the native JavaScript `Error` class, adding an additional
 * property for the HTTP status code. It's designed to be thrown in situations
 * where a specific HTTP error needs to be conveyed, such as in request handlers or middleware.
 */
class HttpError extends Error {
  /** HTTP status code representing the error. */
  public status: number

  /**
   * Constructs a new HttpError.
   * 
   * @param status - The HTTP status code associated with the error.
   * @param message - A human-readable description of the error.
   */
  constructor(status: number, message: string) {
    super(message)

    this.status = status
    this.name = 'HttpError'

    // Ensure the prototype chain is set up correctly.
    Object.setPrototypeOf(this, HttpError.prototype)
  }
}

export default HttpError