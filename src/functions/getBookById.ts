import { app } from "@azure/functions"

import BookManager from "../utils/managers/BookManager"
import RequestHandler from "../utils/RequestHandler"
import HttpError from "../errors/HttpError"

/**
 * Endpoint to retrieve a book by its unique identifier.
 */
const getBookById = new RequestHandler('getBookById')
  .use(async (request, _context) => {  
    const book = await BookManager.getBookById(request.params.bookId)
  
    if (book) {
      return {
        jsonBody: book
      }
    }
    
    throw new HttpError(404, 'Not found')
  })

app.http('getBookById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'books/{bookId}',
    handler: getBookById.httpTrigger
});
