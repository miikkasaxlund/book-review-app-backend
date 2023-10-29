import { app } from "@azure/functions"

import RequestHandler from "../utils/RequestHandler"
import ReviewManager from "../utils/managers/ReviewManager"

/**
 * Endpoint to retrieve reviews by book id.
 */
const getReviewsByBookId = new RequestHandler('getReviewsByBookId')
  .use(async (request, _context) => {
    const bookId = request.params.bookId

    const reviews = await ReviewManager.getReviewsByBookId(bookId)!
  
    return { jsonBody: reviews }
  })

app.http('getReviewsByBookId', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'books/{bookId}/reviews',
    handler: getReviewsByBookId.httpTrigger
});
