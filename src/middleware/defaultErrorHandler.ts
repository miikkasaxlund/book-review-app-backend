import HttpError from "../errors/HttpError";
import RequestErrorHandler from "../utils/RequestHandler/RequestErrorHandler";
import Logger from "../utils/logging/Logger";

/**
 * The default error handler that's used for handling any unhandled errors or exceptions
 * that occur during the processing of an HTTP request in the request handler.
 */
const defaultErrorHandler = new RequestErrorHandler('defaultErrorHandler', async (error, _request, context) => {
  const logger = Logger.create(context)

  if (error instanceof HttpError) {
    logger.error(`HTTP Error (${error.status}): ${error.message}`)

    return {
      status: error.status,
      jsonBody: {
        message: error.message,
      }
    }
  }

  logger.error('Unexpected error occurred:', error)
  
  return {
    status: 500,
    jsonBody: {
      message: 'Unexpected error'
    }
  }
})

export default defaultErrorHandler
