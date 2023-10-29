import { app } from "@azure/functions"
import RequestHandler from "../utils/RequestHandler"
import BookManager from "../utils/managers/BookManager"

/**
 * Endpoint to retrieve all books.
 */
const getAllBooks = new RequestHandler('getAllBooks')
  .use(async (_request, _context) => {
    const books = await BookManager.getAllBooks()
  
    return {
      jsonBody: books
    }
  })

app.http('getAllBooks', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'books',
    handler: getAllBooks.httpTrigger
});
