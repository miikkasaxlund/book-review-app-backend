import { app } from "@azure/functions"

import { BookData } from "../models/Book"
import BookManager from "../utils/managers/BookManager"
import RequestHandler from "../utils/RequestHandler"
import HttpError from "../errors/HttpError"

/**
 * Endpoint to create a new book.
 */
const createBook = new RequestHandler('createBook')
  .use(async (request, _context) => {
    const data = await request.json() as BookData
    const book = await BookManager.createBook(data)
  
    if (book) {
      return { jsonBody: book }
    }

    throw new HttpError(500, 'Error creating a book')
  })

app.http('createBook', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'books',
    handler: createBook.httpTrigger
});
