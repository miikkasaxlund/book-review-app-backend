import { app } from "@azure/functions"

import RequestHandler from "../utils/RequestHandler"
import ReviewManager from "../utils/managers/ReviewManager"

/**
 * Endpoint to remove a book by its unique identifier.
 */
const removeReview = new RequestHandler('removeReview')
  .use(async (request, _context) => {
    const reviewId = request.params.reviewId

    await ReviewManager.removeReview(reviewId)
  
    return {
      jsonBody: {
        message: `Succesfully removed a review with id "${reviewId}"`
      }
    }
  })

app.http('removeReview', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'reviews/{reviewId}',
    handler: removeReview.httpTrigger
});
