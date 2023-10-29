import { app } from "@azure/functions"

import RequestHandler from "../utils/RequestHandler"
import BookManager from "../utils/managers/BookManager"

/**
 * Endpoint to remove a book by its unique identifier.
 */
const removeBook = new RequestHandler('removeBook')
  .use(async (request, _context) => {
    const bookId = request.params.bookId

    await BookManager.removeBook(bookId)
  
    return {
      jsonBody: {
        message: `Succesfully removed a book with id "${bookId}"`
      }
    }
  })

app.http('removeBook', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'books/{bookId}',
    handler: removeBook.httpTrigger
});
